export interface FileMetadata {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url?: string;
  uploadedBy: string;
  uploadedAt: Date;
  companyId?: string;
  quotationId?: string;
  templateId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  isPublic: boolean;
  expiresAt?: Date;
}

export interface FileVersion {
  id: string;
  fileId: string;
  version: string;
  filePath: string;
  size: number;
  uploadedBy: string;
  changes: string;
  createdAt: Date;
  metadata: Record<string, any>;
}

export interface FileUploadOptions {
  maxFileSize?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  compressImages?: boolean;
  generateThumbnails?: boolean;
  watermark?: boolean;
  encryption?: boolean;
  publicAccess?: boolean;
  expiresAt?: Date;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FileCompressionResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  format: string;
}

export interface FileAttachment {
  id: string;
  fileId: string;
  entityType: 'quotation' | 'template' | 'user' | 'company' | 'other';
  entityId: string;
  attachmentType: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other';
  displayName?: string;
  description?: string;
  order?: number;
  isRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileSecurityConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  blockedExtensions: string[];
  virusScanning: boolean;
  contentValidation: boolean;
  encryptionRequired: boolean;
  publicAccessAllowed: boolean;
  retentionPolicy: {
    enabled: boolean;
    days: number;
    action: 'delete' | 'archive' | 'move';
  };
}

export interface FileUploadResult {
  success: boolean;
  file?: FileMetadata;
  error?: string;
  validation?: FileValidationResult;
  compression?: FileCompressionResult;
}

export interface FileSearchCriteria {
  filename?: string;
  mimeType?: string;
  uploadedBy?: string;
  companyId?: string;
  quotationId?: string;
  templateId?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  sizeMin?: number;
  sizeMax?: number;
  isPublic?: boolean;
}

export interface FileStorageConfig {
  provider: 'local' | 's3' | 'azure' | 'gcs';
  bucket?: string;
  region?: string;
  baseUrl?: string;
  credentials?: Record<string, any>;
  encryption?: {
    enabled: boolean;
    algorithm: string;
    key?: string;
  };
  compression?: {
    enabled: boolean;
    quality: number;
    formats: string[];
  };
}
