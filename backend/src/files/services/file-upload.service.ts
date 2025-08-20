import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { 
  FileMetadata, 
  FileUploadOptions, 
  FileValidationResult, 
  FileCompressionResult,
  FileUploadResult,
  FileSecurityConfig
} from '../interfaces/file.interface';
import { FileStorageService } from './file-storage.service';
import { FileCompressionService } from './file-compression.service';
import { FileSecurityService } from './file-security.service';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private readonly defaultUploadOptions: FileUploadOptions;
  private readonly securityConfig: FileSecurityConfig;

  constructor(
    private configService: ConfigService,
    private fileStorage: FileStorageService,
    private fileCompression: FileCompressionService,
    private fileSecurity: FileSecurityService,
  ) {
    this.defaultUploadOptions = {
      maxFileSize: this.configService.get<number>('FILE_MAX_SIZE', 50 * 1024 * 1024), // 50MB
      allowedMimeTypes: this.configService.get<string[]>('FILE_ALLOWED_MIME_TYPES', [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'text/csv'
      ]),
      allowedExtensions: this.configService.get<string[]>('FILE_ALLOWED_EXTENSIONS', [
        '.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'
      ]),
      compressImages: this.configService.get<boolean>('FILE_COMPRESS_IMAGES', true),
      generateThumbnails: this.configService.get<boolean>('FILE_GENERATE_THUMBNAILS', true),
      watermark: this.configService.get<boolean>('FILE_WATERMARK', false),
      encryption: this.configService.get<boolean>('FILE_ENCRYPTION', false),
      publicAccess: false,
    };

    this.securityConfig = {
      maxFileSize: this.defaultUploadOptions.maxFileSize!,
      allowedMimeTypes: this.defaultUploadOptions.allowedMimeTypes!,
      blockedExtensions: this.configService.get<string[]>('FILE_BLOCKED_EXTENSIONS', [
        '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar'
      ]),
      virusScanning: this.configService.get<boolean>('FILE_VIRUS_SCANNING', true),
      contentValidation: this.configService.get<boolean>('FILE_CONTENT_VALIDATION', true),
      encryptionRequired: this.configService.get<boolean>('FILE_ENCRYPTION_REQUIRED', false),
      publicAccessAllowed: this.configService.get<boolean>('FILE_PUBLIC_ACCESS_ALLOWED', false),
      retentionPolicy: {
        enabled: this.configService.get<boolean>('FILE_RETENTION_POLICY_ENABLED', false),
        days: this.configService.get<number>('FILE_RETENTION_POLICY_DAYS', 365),
        action: this.configService.get<'delete' | 'archive' | 'move'>('FILE_RETENTION_POLICY_ACTION', 'archive'),
      },
    };
  }

  /**
   * Upload a file with validation, compression, and security checks
   */
  async uploadFile(
    file: Express.Multer.File,
    options: Partial<FileUploadOptions> = {},
    metadata: Partial<FileMetadata> = {},
  ): Promise<FileUploadResult> {
    try {
      const uploadOptions = { ...this.defaultUploadOptions, ...options };
      
      this.logger.log('Starting file upload', { 
        filename: file.originalname, 
        size: file.size,
        mimeType: file.mimetype 
      });

      // 1. Validate file
      const validation = await this.validateFile(file, uploadOptions);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'File validation failed',
          validation,
        };
      }

      // 2. Security checks
      const securityCheck = await this.fileSecurity.performSecurityChecks(file);
      if (!securityCheck.passed) {
        return {
          success: false,
          error: 'File security check failed',
          validation: {
            isValid: false,
            errors: securityCheck.errors,
            warnings: [],
          },
        };
      }

      // 3. Generate unique filename and path
      const fileId = uuidv4();
      const fileExtension = path.extname(file.originalname);
      const filename = `${fileId}${fileExtension}`;
      const relativePath = this.generateFilePath(metadata.companyId, fileId, fileExtension);

      // 4. Process file (compression, watermarking, etc.)
      let processedBuffer = file.buffer;
      let compressionResult: FileCompressionResult | undefined;

      if (uploadOptions.compressImages && this.isImageFile(file.mimetype)) {
        const compression = await this.fileCompression.compressImage(file.buffer, file.mimetype);
        if (compression.success && compression.compressedBuffer) {
          processedBuffer = compression.compressedBuffer;
          compressionResult = compression.result;
          this.logger.log('Image compressed successfully', { 
            originalSize: file.size, 
            compressedSize: processedBuffer.length 
          });
        }
      }

      // 5. Add watermark if requested
      if (uploadOptions.watermark && this.isImageFile(file.mimetype)) {
        const watermarked = await this.fileCompression.addWatermark(processedBuffer, file.mimetype);
        if (watermarked.success && watermarked.buffer) {
          processedBuffer = watermarked.buffer;
        }
      }

      // 6. Encrypt file if required
      if (uploadOptions.encryption) {
        const encrypted = await this.fileSecurity.encryptFile(processedBuffer);
        if (encrypted.success && encrypted.encryptedBuffer) {
          processedBuffer = encrypted.encryptedBuffer;
        }
      }

      // 7. Store file
      const storageResult = await this.fileStorage.storeFile(
        relativePath,
        processedBuffer,
        {
          contentType: file.mimetype,
          metadata: {
            originalName: file.originalname,
            originalSize: file.size,
            uploadedBy: metadata.uploadedBy || 'unknown',
            companyId: metadata.companyId,
            quotationId: metadata.quotationId,
            templateId: metadata.templateId,
            tags: metadata.tags,
            isPublic: uploadOptions.publicAccess || false,
            expiresAt: uploadOptions.expiresAt,
          },
        }
      );

      if (!storageResult.success) {
        return {
          success: false,
          error: 'Failed to store file',
        };
      }

      // 8. Generate thumbnail if requested
      let thumbnailPath: string | undefined;
      if (uploadOptions.generateThumbnails && this.isImageFile(file.mimetype)) {
        const thumbnail = await this.fileCompression.generateThumbnail(file.buffer, file.mimetype);
        if (thumbnail.success && thumbnail.buffer) {
          const thumbnailRelativePath = this.generateThumbnailPath(relativePath);
          await this.fileStorage.storeFile(thumbnailRelativePath, thumbnail.buffer, {
            contentType: 'image/jpeg',
            metadata: { isThumbnail: true, originalFile: relativePath },
          });
          thumbnailPath = thumbnailRelativePath;
        }
      }

      // 9. Create file metadata
      const fileMetadata: FileMetadata = {
        id: fileId,
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: processedBuffer.length,
        path: relativePath,
        url: storageResult.url,
        uploadedBy: metadata.uploadedBy || 'unknown',
        uploadedAt: new Date(),
        companyId: metadata.companyId,
        quotationId: metadata.quotationId,
        templateId: metadata.templateId,
        tags: metadata.tags,
        metadata: {
          ...metadata.metadata,
          thumbnailPath,
          originalSize: file.size,
          checksum: this.calculateChecksum(processedBuffer),
          security: {
            encrypted: uploadOptions.encryption,
            virusScanned: this.securityConfig.virusScanning,
            contentValidated: this.securityConfig.contentValidation,
          },
        },
        isPublic: uploadOptions.publicAccess || false,
        expiresAt: uploadOptions.expiresAt,
      };

      // 10. Save metadata
      await this.fileStorage.saveFileMetadata(fileMetadata);

      this.logger.log('File uploaded successfully', { 
        fileId, 
        filename: file.originalname,
        size: processedBuffer.length,
        path: relativePath 
      });

      return {
        success: true,
        file: fileMetadata,
        validation,
        compression: compressionResult,
      };

    } catch (error) {
      this.logger.error('Error uploading file', { 
        filename: file.originalname, 
        error: error.message 
      });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    options: Partial<FileUploadOptions> = {},
    metadata: Partial<FileMetadata> = {},
  ): Promise<FileUploadResult[]> {
    const results: FileUploadResult[] = [];
    
    for (const file of files) {
      const result = await this.uploadFile(file, options, metadata);
      results.push(result);
    }

    return results;
  }

  /**
   * Validate file before upload
   */
  private async validateFile(file: Express.Multer.File, options: FileUploadOptions): Promise<FileValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file size
    if (file.size > options.maxFileSize!) {
      errors.push(`File size ${file.size} bytes exceeds maximum allowed size of ${options.maxFileSize} bytes`);
    }

    // Check MIME type
    if (!options.allowedMimeTypes!.includes(file.mimetype)) {
      errors.push(`MIME type ${file.mimetype} is not allowed`);
    }

    // Check file extension
    const extension = path.extname(file.originalname).toLowerCase();
    if (!options.allowedExtensions!.includes(extension)) {
      errors.push(`File extension ${extension} is not allowed`);
    }

    // Check for blocked extensions
    if (this.securityConfig.blockedExtensions.includes(extension)) {
      errors.push(`File extension ${extension} is blocked for security reasons`);
    }

    // Check file content (basic validation)
    if (options.contentValidation !== false) {
      const contentCheck = await this.validateFileContent(file);
      if (!contentCheck.isValid) {
        errors.push(...contentCheck.errors);
      }
    }

    // Warnings for large files
    if (file.size > 10 * 1024 * 1024) { // 10MB
      warnings.push('File is large and may take time to process');
    }

    // Warnings for certain file types
    if (file.mimetype.startsWith('image/') && file.size > 5 * 1024 * 1024) { // 5MB
      warnings.push('Large image file - consider compression');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate file content for security
   */
  private async validateFileContent(file: Express.Multer.File): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check file header for common file types
      const header = file.buffer.slice(0, 8);
      
      if (file.mimetype === 'image/jpeg' && !this.isValidJPEGHeader(header)) {
        errors.push('Invalid JPEG file header');
      }
      
      if (file.mimetype === 'image/png' && !this.isValidPNGHeader(header)) {
        errors.push('Invalid PNG file header');
      }
      
      if (file.mimetype === 'application/pdf' && !this.isValidPDFHeader(header)) {
        errors.push('Invalid PDF file header');
      }

      // Check for executable content in text files
      if (file.mimetype.startsWith('text/') && this.containsExecutableContent(file.buffer)) {
        errors.push('File contains potentially executable content');
      }

    } catch (error) {
      errors.push('Unable to validate file content');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if file is an image
   */
  private isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  /**
   * Generate file path
   */
  private generateFilePath(companyId?: string, fileId?: string, extension?: string): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    let basePath = `uploads/${year}/${month}/${day}`;
    
    if (companyId) {
      basePath = `companies/${companyId}/${basePath}`;
    }
    
    if (fileId && extension) {
      return `${basePath}/${fileId}${extension}`;
    }
    
    return basePath;
  }

  /**
   * Generate thumbnail path
   */
  private generateThumbnailPath(originalPath: string): string {
    const dir = path.dirname(originalPath);
    const name = path.basename(originalPath, path.extname(originalPath));
    return `${dir}/thumbnails/${name}_thumb.jpg`;
  }

  /**
   * Calculate file checksum
   */
  private calculateChecksum(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Validate JPEG header
   */
  private isValidJPEGHeader(header: Buffer): boolean {
    return header[0] === 0xFF && header[1] === 0xD8;
  }

  /**
   * Validate PNG header
   */
  private isValidPNGHeader(header: Buffer): boolean {
    return header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47;
  }

  /**
   * Validate PDF header
   */
  private isValidPDFHeader(header: Buffer): boolean {
    const headerStr = header.toString('ascii', 0, 4);
    return headerStr === '%PDF';
  }

  /**
   * Check for executable content in text files
   */
  private containsExecutableContent(buffer: Buffer): boolean {
    const content = buffer.toString('utf8', 0, Math.min(buffer.length, 1000));
    const suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /eval\s*\(/gi,
      /document\./gi,
      /window\./gi,
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(content));
  }
}
