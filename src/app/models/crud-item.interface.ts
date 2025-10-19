export interface CrudItem {
  id?: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  files?: CrudFile[];
  isActive: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface CrudFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document';
  size: number;
  uploadedAt: Date;
  path: string;
}

export interface CrudFormData {
  title: string;
  description: string;
  category: string;
  tags: string;
  priority: 'low' | 'medium' | 'high';
  files: File[];
}

export interface CrudFilter {
  category?: string;
  priority?: string;
  isActive?: boolean;
  searchTerm?: string;
}