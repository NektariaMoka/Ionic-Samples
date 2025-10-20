import { inject, Injectable } from '@angular/core';
import {
  Storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from '@angular/fire/storage';
import { Subject } from 'rxjs';
import { FileUploadResult } from '../models/user.interface';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private uploadProgressSubject = new Subject<number>();
  public uploadProgress$ = this.uploadProgressSubject.asObservable();
  private storage = inject(Storage);
  // File size limits (in bytes)
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

  // Allowed file types
  private readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];
  private readonly ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

  constructor() {}

  async uploadProfileImage(
    userId: string,
    file: File
  ): Promise<FileUploadResult> {
    return this.uploadFile(
      file,
      `users/${userId}/profile/avatar`,
      this.ALLOWED_IMAGE_TYPES,
      this.MAX_IMAGE_SIZE
    );
  }

  async uploadCoverImage(
    userId: string,
    file: File
  ): Promise<FileUploadResult> {
    return this.uploadFile(
      file,
      `users/${userId}/profile/cover`,
      this.ALLOWED_IMAGE_TYPES,
      this.MAX_IMAGE_SIZE
    );
  }

  async uploadDocument(
    userId: string,
    file: File,
    category: string = 'documents'
  ): Promise<FileUploadResult> {
    const allowedTypes = [
      ...this.ALLOWED_IMAGE_TYPES,
      ...this.ALLOWED_DOCUMENT_TYPES,
    ];
    return this.uploadFile(
      file,
      `users/${userId}/${category}/${Date.now()}_${file.name}`,
      allowedTypes,
      this.MAX_FILE_SIZE
    );
  }

  async uploadFile(
    file: File,
    path: string,
    allowedTypes: string[],
    maxSize: number
  ): Promise<FileUploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file, allowedTypes, maxSize);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Create storage reference
      const storageRef = ref(this.storage, path);

      // Start upload
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise(resolve => {
        uploadTask.on(
          'state_changed',
          snapshot => {
            // Progress monitoring
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            this.uploadProgressSubject.next(progress);
          },
          error => {
            // Handle upload errors
            console.error('Upload error:', error);
            this.uploadProgressSubject.next(0);
            resolve({
              success: false,
              error: this.getUploadErrorMessage(error),
            });
          },
          async () => {
            // Upload completed successfully
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              this.uploadProgressSubject.next(100);
              resolve({ success: true, downloadURL });
            } catch (_error) {
              resolve({ success: false, error: 'Failed to get download URL' });
            }
          }
        );
      });
    } catch (error: any) {
      return { success: false, error: error.message || 'Upload failed' };
    }
  }

  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fileRef = ref(this.storage, filePath);
      await deleteObject(fileRef);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  validateFile(
    file: File,
    allowedTypes: string[],
    maxSize: number
  ): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return {
        isValid: false,
        error: `File size must be less than ${maxSizeMB}MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }

    return { isValid: true };
  }

  getFileExtension(filename: string): string {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isImageFile(file: File): boolean {
    return this.ALLOWED_IMAGE_TYPES.includes(file.type);
  }

  isDocumentFile(file: File): boolean {
    return this.ALLOWED_DOCUMENT_TYPES.includes(file.type);
  }

  private getUploadErrorMessage(error: any): string {
    switch (error.code) {
      case 'storage/unauthorized':
        return 'You do not have permission to upload files.';
      case 'storage/canceled':
        return 'Upload was canceled.';
      case 'storage/unknown':
        return 'An unknown error occurred during upload.';
      case 'storage/invalid-format':
        return 'Invalid file format.';
      case 'storage/invalid-argument':
        return 'Invalid upload arguments.';
      default:
        return error.message || 'Upload failed. Please try again.';
    }
  }

  // Utility method to create file input element
  createFileInput(
    accept: string = '*',
    multiple: boolean = false
  ): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = multiple;
    input.style.display = 'none';
    return input;
  }

  // Utility method to trigger file selection
  selectFile(
    accept: string = '*',
    multiple: boolean = false
  ): Promise<FileList | null> {
    return new Promise(resolve => {
      const input = this.createFileInput(accept, multiple);
      input.onchange = () => resolve(input.files);
      input.onclick = () => {
        // Reset value to allow selecting the same file again
        input.value = '';
      };
      document.body.appendChild(input);
      input.click();
      document.body.removeChild(input);
    });
  }
}
