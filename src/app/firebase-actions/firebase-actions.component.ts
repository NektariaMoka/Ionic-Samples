import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { CrudService } from '../services/crud.service';
import { FileUploadService } from '../services/file-upload.service';
import { AuthService } from '../services/auth.service';
import { LoadingService } from '../services/loading.service';
import { CrudItem, CrudFormData, CrudFilter } from '../models/crud-item.interface';

@Component({
  selector: 'app-firebase-actions',
  templateUrl: './firebase-actions.component.html',
  styleUrls: ['./firebase-actions.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule]
})
export class FirebaseActionsComponent implements OnInit, OnDestroy {
  // Form and data
  crudForm: FormGroup;
  items: CrudItem[] = [];
  filteredItems: CrudItem[] = [];
  selectedItem: CrudItem | null = null;
  
  // UI state
  isEditing = false;
  showForm = false;
  showFilters = false;
  uploadProgress = 0;
  isUploading = false;
  
  // Filters
  filter: CrudFilter = {};
  categories: string[] = [];
  tags: string[] = [];
  priorityCounts: { [key: string]: number } = {};
  
  // File handling
  selectedFiles: File[] = [];
  previewFiles: { file: File; preview: string }[] = [];
  
  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private crudService: CrudService,
    private fileUploadService: FileUploadService,
    private authService: AuthService,
    private loadingService: LoadingService
  ) {
    this.crudForm = this.createForm();
  }

  ngOnInit() {
    this.initializeComponent();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeComponent() {
    // Subscribe to items
    const itemsSub = this.crudService.items$.subscribe(items => {
      this.items = items;
      this.filteredItems = items;
      this.updateFilterData();
    });
    this.subscriptions.push(itemsSub);

    // Subscribe to upload progress
    const progressSub = this.fileUploadService.uploadProgress$.subscribe(progress => {
      this.uploadProgress = progress;
      this.isUploading = progress > 0 && progress < 100;
    });
    this.subscriptions.push(progressSub);

    // Load initial data
    this.crudService.loadItems();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', [Validators.required]],
      tags: [''],
      priority: ['medium', [Validators.required]],
      isActive: [true]
    });
  }

  private updateFilterData() {
    this.categories = this.crudService.getCategories();
    this.tags = this.crudService.getTags();
    this.priorityCounts = this.crudService.getPriorityCounts();
  }

  // Form actions
  showCreateForm() {
    this.isEditing = false;
    this.selectedItem = null;
    this.crudForm.reset({
      priority: 'medium',
      isActive: true
    });
    this.selectedFiles = [];
    this.previewFiles = [];
    this.showForm = true;
  }

  showEditForm(item: CrudItem) {
    this.isEditing = true;
    this.selectedItem = item;
    this.crudForm.patchValue({
      title: item.title,
      description: item.description,
      category: item.category,
      tags: item.tags.join(', '),
      priority: item.priority,
      isActive: item.isActive
    });
    this.selectedFiles = [];
    this.previewFiles = [];
    this.showForm = true;
  }

  hideForm() {
    this.showForm = false;
    this.isEditing = false;
    this.selectedItem = null;
    this.crudForm.reset();
    this.selectedFiles = [];
    this.previewFiles = [];
  }

  // File handling
  async onFileSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.selectedFiles = [...this.selectedFiles, ...files];
    await this.generatePreviews();
  }

  private async generatePreviews() {
    this.previewFiles = [];
    for (const file of this.selectedFiles) {
      if (this.fileUploadService.isImageFile(file)) {
        const preview = await this.createImagePreview(file);
        this.previewFiles.push({ file, preview });
      } else {
        this.previewFiles.push({ file, preview: this.getFileIcon(file) });
      }
    }
  }

  private createImagePreview(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  }

  private getFileIcon(file: File): string {
    const extension = this.fileUploadService.getFileExtension(file.name).toLowerCase();
    const iconMap: { [key: string]: string } = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      txt: '📄',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      webp: '🖼️'
    };
    return iconMap[extension] || '📎';
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewFiles.splice(index, 1);
  }

  // CRUD operations
  async onSubmit() {
    if (this.crudForm.valid) {
      const formData = this.crudForm.value;
      const tags = formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [];
      
      const itemData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags,
        priority: formData.priority,
        isActive: formData.isActive
      };

      if (this.isEditing && this.selectedItem) {
        await this.crudService.updateItem(this.selectedItem.id!, itemData, this.selectedFiles);
      } else {
        await this.crudService.createItem(itemData, this.selectedFiles);
      }
      
      this.hideForm();
    }
  }

  async deleteItem(item: CrudItem) {
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      await this.crudService.deleteItem(item.id!);
    }
  }

  // Filtering and search
  applyFilters() {
    this.crudService.searchItems(this.filter).then(items => {
      this.filteredItems = items;
    });
  }

  clearFilters() {
    this.filter = {};
    this.filteredItems = this.items;
  }

  onSearchChange(event: any) {
    this.filter.searchTerm = event.target.value;
    this.applyFilters();
  }

  onCategoryChange(event: any) {
    this.filter.category = event.target.value;
    this.applyFilters();
  }

  onPriorityChange(event: any) {
    this.filter.priority = event.target.value;
    this.applyFilters();
  }

  onActiveChange(event: any) {
    this.filter.isActive = event.target.checked;
    this.applyFilters();
  }

  // Utility methods
  getPriorityColor(priority: string): string {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'danger'
    };
    return colors[priority as keyof typeof colors] || 'medium';
  }

  getFileSize(size: number): string {
    return this.fileUploadService.formatFileSize(size);
  }

  isImageFile(file: File): boolean {
    return this.fileUploadService.isImageFile(file);
  }

  isDocumentFile(file: File): boolean {
    return this.fileUploadService.isDocumentFile(file);
  }

  // Toggle filters visibility
  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  // Get current user
  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  // Track by function for ngFor
  trackByItemId(index: number, item: CrudItem): string {
    return item.id || index.toString();
  }

  // Get file icon for display
  getFileIcon(filename: string): string {
    const extension = this.fileUploadService.getFileExtension(filename).toLowerCase();
    const iconMap: { [key: string]: string } = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      txt: '📄',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      webp: '🖼️'
    };
    return iconMap[extension] || '📎';
  }
}
