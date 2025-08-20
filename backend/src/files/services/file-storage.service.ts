import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { 
  FileMetadata, 
  FileStorageConfig,
  FileVersion 
} from '../interfaces/file.interface';

export interface StorageResult {
  success: boolean;
  url?: string;
  path: string;
  error?: string;
}

export interface StorageMetadata {
  contentType: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private readonly storageConfig: FileStorageConfig;
  private readonly s3Client: any = null;
  private readonly useS3: boolean;

  constructor(private configService: ConfigService) {
    this.storageConfig = {
      provider: this.configService.get<'local' | 's3' | 'azure' | 'gcs'>('FILE_STORAGE_PROVIDER', 'local'),
      bucket: this.configService.get<string>('FILE_S3_BUCKET'),
      region: this.configService.get<string>('FILE_S3_REGION'),
      baseUrl: this.configService.get<string>('FILE_STORAGE_BASE_URL'),
      credentials: {
        accessKeyId: this.configService.get<string>('FILE_S3_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('FILE_S3_SECRET_ACCESS_KEY'),
      },
      encryption: {
        enabled: this.configService.get<boolean>('FILE_ENCRYPTION_ENABLED', false),
        algorithm: this.configService.get<string>('FILE_ENCRYPTION_ALGORITHM', 'AES-256'),
        key: this.configService.get<string>('FILE_ENCRYPTION_KEY'),
      },
      compression: {
        enabled: this.configService.get<boolean>('FILE_COMPRESSION_ENABLED', true),
        quality: this.configService.get<number>('FILE_COMPRESSION_QUALITY', 80),
        formats: this.configService.get<string[]>('FILE_COMPRESSION_FORMATS', ['jpeg', 'png', 'webp']),
      },
    };

    this.useS3 = this.storageConfig.provider === 's3' && 
                  this.storageConfig.bucket && 
                  this.storageConfig.credentials?.accessKeyId;

    if (this.useS3) {
      this.initializeS3Client();
    }

    this.logger.log('File storage service initialized', { 
      provider: this.storageConfig.provider,
      useS3: this.useS3 
    });
  }

  /**
   * Store a file
   */
  async storeFile(filePath: string, buffer: Buffer, metadata: StorageMetadata): Promise<StorageResult> {
    try {
      if (this.useS3) {
        return await this.storeFileS3(filePath, buffer, metadata);
      } else {
        return await this.storeFileLocal(filePath, buffer, metadata);
      }
    } catch (error) {
      this.logger.error('Error storing file', { filePath, error: error.message });
      return {
        success: false,
        path: filePath,
        error: error.message,
      };
    }
  }

  /**
   * Retrieve a file
   */
  async getFile(filePath: string): Promise<Buffer | null> {
    try {
      if (this.useS3) {
        return await this.getFileS3(filePath);
      } else {
        return await this.getFileLocal(filePath);
      }
    } catch (error) {
      this.logger.error('Error retrieving file', { filePath, error: error.message });
      return null;
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      if (this.useS3) {
        return await this.deleteFileS3(filePath);
      } else {
        return await this.deleteFileLocal(filePath);
      }
    } catch (error) {
      this.logger.error('Error deleting file', { filePath, error: error.message });
      return false;
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      if (this.useS3) {
        return await this.fileExistsS3(filePath);
      } else {
        return await this.fileExistsLocal(filePath);
      }
    } catch (error) {
      this.logger.error('Error checking file existence', { filePath, error: error.message });
      return false;
    }
  }

  /**
   * Save file metadata
   */
  async saveFileMetadata(metadata: FileMetadata): Promise<void> {
    try {
      const metadataPath = this.getMetadataPath(metadata.id);
      const metadataContent = JSON.stringify(metadata, null, 2);
      
      if (this.useS3) {
        await this.storeFileS3(metadataPath, Buffer.from(metadataContent), {
          contentType: 'application/json',
          metadata: { isMetadata: true },
        });
      } else {
        await this.storeFileLocal(metadataPath, Buffer.from(metadataContent), {
          contentType: 'application/json',
          metadata: { isMetadata: true },
        });
      }

      this.logger.log('File metadata saved', { fileId: metadata.id });
    } catch (error) {
      this.logger.error('Error saving file metadata', { fileId: metadata.id, error: error.message });
      throw error;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string): Promise<FileMetadata | null> {
    try {
      const metadataPath = this.getMetadataPath(fileId);
      const metadataBuffer = await this.getFile(metadataPath);
      
      if (metadataBuffer) {
        return JSON.parse(metadataBuffer.toString());
      }
      
      return null;
    } catch (error) {
      this.logger.error('Error getting file metadata', { fileId, error: error.message });
      return null;
    }
  }

  /**
   * Create file version
   */
  async createFileVersion(
    originalFileId: string,
    filePath: string,
    buffer: Buffer,
    version: string,
    uploadedBy: string,
    changes?: string,
  ): Promise<FileVersion | null> {
    try {
      const versionPath = this.getVersionPath(originalFileId, version);
      
      // Store version file
      const storageResult = await this.storeFile(versionPath, buffer, {
        contentType: 'application/octet-stream',
        metadata: { isVersion: true, originalFileId, version },
      });

      if (!storageResult.success) {
        throw new Error('Failed to store version file');
      }

      // Create version metadata
      const fileVersion: FileVersion = {
        version,
        filename: path.basename(filePath),
        size: buffer.length,
        uploadedAt: new Date(),
        uploadedBy,
        changes,
        checksum: this.calculateChecksum(buffer),
      };

      // Save version metadata
      const versionMetadataPath = this.getVersionMetadataPath(originalFileId, version);
      await this.storeFile(versionMetadataPath, Buffer.from(JSON.stringify(fileVersion, null, 2)), {
        contentType: 'application/json',
        metadata: { isVersionMetadata: true },
      });

      this.logger.log('File version created', { originalFileId, version });
      return fileVersion;
    } catch (error) {
      this.logger.error('Error creating file version', { originalFileId, version, error: error.message });
      return null;
    }
  }

  /**
   * Get file versions
   */
  async getFileVersions(fileId: string): Promise<FileVersion[]> {
    try {
      const versions: FileVersion[] = [];
      const versionDir = this.getVersionDir(fileId);
      
      // List version metadata files
      const metadataFiles = await this.listFiles(versionDir, '*.json');
      
      for (const metadataFile of metadataFiles) {
        if (metadataFile.includes('metadata')) {
          const metadataBuffer = await this.getFile(metadataFile);
          if (metadataBuffer) {
            const version = JSON.parse(metadataBuffer.toString());
            versions.push(version);
          }
        }
      }

      // Sort by version number
      return versions.sort((a, b) => {
        const versionA = parseFloat(a.version) || 0;
        const versionB = parseFloat(b.version) || 0;
        return versionB - versionA;
      });
    } catch (error) {
      this.logger.error('Error getting file versions', { fileId, error: error.message });
      return [];
    }
  }

  /**
   * List files in directory
   */
  async listFiles(directory: string, pattern?: string): Promise<string[]> {
    try {
      if (this.useS3) {
        return await this.listFilesS3(directory, pattern);
      } else {
        return await this.listFilesLocal(directory, pattern);
      }
    } catch (error) {
      this.logger.error('Error listing files', { directory, error: error.message });
      return [];
    }
  }

  // S3 Storage Methods

  private async storeFileS3(filePath: string, buffer: Buffer, metadata: StorageMetadata): Promise<StorageResult> {
    try {
      const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
      
      const command = new PutObjectCommand({
        Bucket: this.storageConfig.bucket,
        Key: filePath,
        Body: buffer,
        ContentType: metadata.contentType,
        Metadata: metadata.metadata,
        ...(this.storageConfig.encryption?.enabled && {
          ServerSideEncryption: 'AES256',
        }),
      });

      await this.s3Client.send(command);

      const url = this.generateS3Url(filePath);
      
      return {
        success: true,
        url,
        path: filePath,
      };
    } catch (error) {
      this.logger.error('Error storing file in S3', { filePath, error: error.message });
      return {
        success: false,
        path: filePath,
        error: error.message,
      };
    }
  }

  private async getFileS3(filePath: string): Promise<Buffer | null> {
    try {
      const { GetObjectCommand } = require('@aws-sdk/client-s3');
      
      const command = new GetObjectCommand({
        Bucket: this.storageConfig.bucket,
        Key: filePath,
      });

      const response = await this.s3Client.send(command);
      const chunks: Buffer[] = [];
      
      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      this.logger.error('Error getting file from S3', { filePath, error: error.message });
      return null;
    }
  }

  private async deleteFileS3(filePath: string): Promise<boolean> {
    try {
      const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
      
      const command = new DeleteObjectCommand({
        Bucket: this.storageConfig.bucket,
        Key: filePath,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      this.logger.error('Error deleting file from S3', { filePath, error: error.message });
      return false;
    }
  }

  private async fileExistsS3(filePath: string): Promise<boolean> {
    try {
      const { HeadObjectCommand } = require('@aws-sdk/client-s3');
      
      const command = new HeadObjectCommand({
        Bucket: this.storageConfig.bucket,
        Key: filePath,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  private async listFilesS3(directory: string, pattern?: string): Promise<string[]> {
    try {
      const { ListObjectsV2Command } = require('@aws-sdk/client-s3');
      
      const command = new ListObjectsV2Command({
        Bucket: this.storageConfig.bucket,
        Prefix: directory,
      });

      const response = await this.s3Client.send(command);
      const files = response.Contents?.map((obj: any) => obj.Key) || [];
      
      if (pattern) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return files.filter((file: string) => regex.test(file));
      }
      
      return files;
    } catch (error) {
      this.logger.error('Error listing files in S3', { directory, error: error.message });
      return [];
    }
  }

  // Local Storage Methods

  private async storeFileLocal(filePath: string, buffer: Buffer, metadata: StorageMetadata): Promise<StorageResult> {
    try {
      const fullPath = path.join(process.cwd(), 'uploads', filePath);
      const dir = path.dirname(fullPath);
      
      // Ensure directory exists
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write file
      fs.writeFileSync(fullPath, buffer);
      
      const url = this.generateLocalUrl(filePath);
      
      return {
        success: true,
        url,
        path: filePath,
      };
    } catch (error) {
      this.logger.error('Error storing file locally', { filePath, error: error.message });
      return {
        success: false,
        path: filePath,
        error: error.message,
      };
    }
  }

  private async getFileLocal(filePath: string): Promise<Buffer | null> {
    try {
      const fullPath = path.join(process.cwd(), 'uploads', filePath);
      
      if (fs.existsSync(fullPath)) {
        return fs.readFileSync(fullPath);
      }
      
      return null;
    } catch (error) {
      this.logger.error('Error getting file locally', { filePath, error: error.message });
      return null;
    }
  }

  private async deleteFileLocal(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(process.cwd(), 'uploads', filePath);
      
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
      
      return false;
    } catch (error) {
      this.logger.error('Error deleting file locally', { filePath, error: error.message });
      return false;
    }
  }

  private async fileExistsLocal(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(process.cwd(), 'uploads', filePath);
      return fs.existsSync(fullPath);
    } catch (error) {
      return false;
    }
  }

  private async listFilesLocal(directory: string, pattern?: string): Promise<string[]> {
    try {
      const fullPath = path.join(process.cwd(), 'uploads', directory);
      
      if (!fs.existsSync(fullPath)) {
        return [];
      }
      
      const files = fs.readdirSync(fullPath);
      
      if (pattern) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return files.filter(file => regex.test(file));
      }
      
      return files;
    } catch (error) {
      this.logger.error('Error listing files locally', { directory, error: error.message });
      return [];
    }
  }

  // Helper Methods

  private initializeS3Client(): void {
    try {
      const { S3Client } = require('@aws-sdk/client-s3');
      
      this.s3Client = new S3Client({
        region: this.storageConfig.region,
        credentials: {
          accessKeyId: this.storageConfig.credentials?.accessKeyId,
          secretAccessKey: this.storageConfig.credentials?.secretAccessKey,
        },
      });

      this.logger.log('S3 client initialized successfully');
    } catch (error) {
      this.logger.error('Error initializing S3 client', { error: error.message });
      this.useS3 = false;
    }
  }

  private generateS3Url(filePath: string): string {
    if (this.storageConfig.baseUrl) {
      return `${this.storageConfig.baseUrl}/${filePath}`;
    }
    
    return `https://${this.storageConfig.bucket}.s3.${this.storageConfig.region}.amazonaws.com/${filePath}`;
  }

  private generateLocalUrl(filePath: string): string {
    if (this.storageConfig.baseUrl) {
      return `${this.storageConfig.baseUrl}/uploads/${filePath}`;
    }
    
    return `/uploads/${filePath}`;
  }

  private getMetadataPath(fileId: string): string {
    return `metadata/${fileId}.json`;
  }

  private getVersionPath(fileId: string, version: string): string {
    return `versions/${fileId}/${version}/file`;
  }

  private getVersionMetadataPath(fileId: string, version: string): string {
    return `versions/${fileId}/${version}/metadata.json`;
  }

  private getVersionDir(fileId: string): string {
    return `versions/${fileId}`;
  }

  private calculateChecksum(buffer: Buffer): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }
}
