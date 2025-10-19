import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  serverTimestamp,
} from '@angular/fire/firestore';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CrudItem, CrudFilter } from '../models/crud-item.interface';
import { FileUploadService } from './file-upload.service';
import { AuthService } from './auth.service';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root',
})
export class CrudService {
  private firestore = inject(Firestore);
  private fileUploadService = inject(FileUploadService);
  private authService = inject(AuthService);
  private loadingService = inject(LoadingService);
  
  private itemsSubject = new BehaviorSubject<CrudItem[]>([]);
  public items$ = this.itemsSubject.asObservable();
  
  private readonly COLLECTION_NAME = 'crud-items';

  constructor() {
    this.loadItems();
  }

  async createItem(itemData: Omit<CrudItem, 'id' | 'createdAt' | 'updatedAt' | 'files'>, files: File[] = []): Promise<CrudItem | null> {
    try {
      await this.loadingService.showLoading('Creating item...');
      
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Upload files if any
      const uploadedFiles = await this.uploadFiles(files, currentUser.uid);

      const newItem: Omit<CrudItem, 'id'> = {
        ...itemData,
        createdBy: currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        files: uploadedFiles,
      };

      const docRef = await addDoc(collection(this.firestore, this.COLLECTION_NAME), {
        ...newItem,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const createdItem: CrudItem = {
        ...newItem,
        id: docRef.id,
      };

      // Update local state
      const currentItems = this.itemsSubject.value;
      this.itemsSubject.next([createdItem, ...currentItems]);

      await this.loadingService.hideLoading();
      await this.loadingService.showToast('Item created successfully!', 'success');
      
      return createdItem;
    } catch (error: any) {
      await this.loadingService.hideLoading();
      await this.loadingService.showToast(error.message || 'Failed to create item', 'error');
      return null;
    }
  }

  async updateItem(itemId: string, updates: Partial<CrudItem>, newFiles: File[] = []): Promise<boolean> {
    try {
      await this.loadingService.showLoading('Updating item...');
      
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Upload new files if any
      const uploadedFiles = await this.uploadFiles(newFiles, currentUser.uid);

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
        files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
      };

      const docRef = doc(this.firestore, this.COLLECTION_NAME, itemId);
      await updateDoc(docRef, updateData);

      // Update local state
      const currentItems = this.itemsSubject.value;
      const updatedItems = currentItems.map(item => 
        item.id === itemId 
          ? { ...item, ...updates, updatedAt: new Date(), files: uploadedFiles.length > 0 ? uploadedFiles : item.files }
          : item
      );
      this.itemsSubject.next(updatedItems);

      await this.loadingService.hideLoading();
      await this.loadingService.showToast('Item updated successfully!', 'success');
      
      return true;
    } catch (error: any) {
      await this.loadingService.hideLoading();
      await this.loadingService.showToast(error.message || 'Failed to update item', 'error');
      return false;
    }
  }

  async deleteItem(itemId: string): Promise<boolean> {
    try {
      await this.loadingService.showLoading('Deleting item...');
      
      // Get item to delete associated files
      const item = this.itemsSubject.value.find(i => i.id === itemId);
      if (item?.files) {
        for (const file of item.files) {
          await this.fileUploadService.deleteFile(file.path);
        }
      }

      const docRef = doc(this.firestore, this.COLLECTION_NAME, itemId);
      await deleteDoc(docRef);

      // Update local state
      const currentItems = this.itemsSubject.value;
      const filteredItems = currentItems.filter(item => item.id !== itemId);
      this.itemsSubject.next(filteredItems);

      await this.loadingService.hideLoading();
      await this.loadingService.showToast('Item deleted successfully!', 'success');
      
      return true;
    } catch (error: any) {
      await this.loadingService.hideLoading();
      await this.loadingService.showToast(error.message || 'Failed to delete item', 'error');
      return false;
    }
  }

  async getItem(itemId: string): Promise<CrudItem | null> {
    try {
      const docRef = doc(this.firestore, this.COLLECTION_NAME, itemId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as CrudItem;
      }
      return null;
    } catch (error) {
      console.error('Error getting item:', error);
      return null;
    }
  }

  async loadItems(): Promise<void> {
    try {
      const q = query(
        collection(this.firestore, this.COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const items: CrudItem[] = [];
      
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as CrudItem);
      });
      
      this.itemsSubject.next(items);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  }

  async searchItems(filter: CrudFilter): Promise<CrudItem[]> {
    try {
      let q = query(collection(this.firestore, this.COLLECTION_NAME));

      if (filter.category) {
        q = query(q, where('category', '==', filter.category));
      }

      if (filter.priority) {
        q = query(q, where('priority', '==', filter.priority));
      }

      if (filter.isActive !== undefined) {
        q = query(q, where('isActive', '==', filter.isActive));
      }

      q = query(q, orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);
      let items: CrudItem[] = [];
      
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as CrudItem);
      });

      // Client-side search for text fields
      if (filter.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase();
        items = items.filter(item => 
          item.title.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      return items;
    } catch (error) {
      console.error('Error searching items:', error);
      return [];
    }
  }

  getItemsByCategory(category: string): Observable<CrudItem[]> {
    return this.items$.pipe(
      map(items => items.filter(item => item.category === category))
    );
  }

  getItemsByPriority(priority: string): Observable<CrudItem[]> {
    return this.items$.pipe(
      map(items => items.filter(item => item.priority === priority))
    );
  }

  getActiveItems(): Observable<CrudItem[]> {
    return this.items$.pipe(
      map(items => items.filter(item => item.isActive))
    );
  }

  private async uploadFiles(files: File[], userId: string): Promise<any[]> {
    if (!files || files.length === 0) return [];

    const uploadedFiles = [];
    
    for (const file of files) {
      try {
        const result = await this.fileUploadService.uploadDocument(
          userId,
          file,
          'crud-items'
        );
        
        if (result.success && result.downloadURL) {
          uploadedFiles.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            url: result.downloadURL,
            type: this.fileUploadService.isImageFile(file) ? 'image' : 'document',
            size: file.size,
            uploadedAt: new Date(),
            path: `users/${userId}/crud-items/${Date.now()}_${file.name}`,
          });
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
    
    return uploadedFiles;
  }

  // Utility methods
  getCategories(): string[] {
    const items = this.itemsSubject.value;
    const categories = [...new Set(items.map(item => item.category))];
    return categories.sort();
  }

  getTags(): string[] {
    const items = this.itemsSubject.value;
    const allTags = items.flatMap(item => item.tags);
    const uniqueTags = [...new Set(allTags)];
    return uniqueTags.sort();
  }

  getPriorityCounts(): { [key: string]: number } {
    const items = this.itemsSubject.value;
    return items.reduce((counts, item) => {
      counts[item.priority] = (counts[item.priority] || 0) + 1;
      return counts;
    }, {} as { [key: string]: number });
  }
}