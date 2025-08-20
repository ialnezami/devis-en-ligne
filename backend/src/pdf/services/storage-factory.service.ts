import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageProvider, StorageConfig } from '../interfaces/storage.interface';
import { LocalStorageProvider } from '../providers/local-storage.provider';
import { S3StorageProvider } from '../providers/s3-storage.provider';

@Injectable()
export class StorageFactoryService {
  private readonly logger = new Logger(StorageFactoryService.name);
  private storageProvider: StorageProvider;
  private readonly config: StorageConfig;

  constructor(
    private configService: ConfigService,
    private localStorageProvider: LocalStorageProvider,
    private s3StorageProvider: S3StorageProvider,
  ) {
    this.config = this.getStorageConfig();
    this.storageProvider = this.createStorageProvider();
  }

  /**
   * Get the current storage provider
   */
  getStorageProvider(): StorageProvider {
    return this.storageProvider;
  }

  /**
   * Switch storage provider dynamically
   */
  async switchStorageProvider(provider: 'local' | 's3'): Promise<void> {
    try {
      this.logger.log('Switching storage provider', { from: this.config.provider, to: provider });
      
      // Update configuration
      this.config.provider = provider;
      
      // Create new provider
      this.storageProvider = this.createStorageProvider();
      
      this.logger.log('Storage provider switched successfully', { provider });
    } catch (error) {
      this.logger.error('Error switching storage provider', { provider, error: error.message });
      throw error;
    }
  }

  /**
   * Get storage configuration
   */
  getStorageConfig(): StorageConfig {
    const provider = this.configService.get<string>('STORAGE_PROVIDER', 'local') as 'local' | 's3';
    
    const config: StorageConfig = {
      provider,
      local: {
        basePath: this.configService.get<string>('PDF_STORAGE_PATH', './storage/pdfs'),
      },
      s3: {
        bucket: this.configService.get<string>('AWS_S3_BUCKET', 'pdf-storage'),
        region: this.configService.get<string>('AWS_REGION', 'us-east-1'),
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
        endpoint: this.configService.get<string>('AWS_S3_ENDPOINT'),
        forcePathStyle: this.configService.get<boolean>('AWS_S3_FORCE_PATH_STYLE', false),
      },
    };

    return config;
  }

  /**
   * Validate storage configuration
   */
  validateStorageConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = this.getStorageConfig();

    if (config.provider === 's3') {
      if (!config.s3?.bucket) {
        errors.push('AWS_S3_BUCKET is required for S3 storage');
      }
      if (!config.s3?.region) {
        errors.push('AWS_REGION is required for S3 storage');
      }
      if (!config.s3?.accessKeyId) {
        errors.push('AWS_ACCESS_KEY_ID is required for S3 storage');
      }
      if (!config.s3?.secretAccessKey) {
        errors.push('AWS_SECRET_ACCESS_KEY is required for S3 storage');
      }
    }

    if (config.provider === 'local') {
      if (!config.local?.basePath) {
        errors.push('PDF_STORAGE_PATH is required for local storage');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Test storage provider connection
   */
  async testStorageConnection(): Promise<{ success: boolean; provider: string; error?: string }> {
    try {
      const provider = this.config.provider;
      this.logger.log('Testing storage connection', { provider });

      if (provider === 's3') {
        // Test S3 connection by listing buckets
        await this.s3StorageProvider.listFiles();
        return { success: true, provider: 's3' };
      } else {
        // Test local storage by checking directory access
        await this.localStorageProvider.listFiles();
        return { success: true, provider: 'local' };
      }
    } catch (error) {
      this.logger.error('Storage connection test failed', { provider: this.config.provider, error: error.message });
      return { 
        success: false, 
        provider: this.config.provider, 
        error: error.message 
      };
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    provider: string;
    totalFiles: number;
    totalSize: number;
    availableSpace: number;
    connectionStatus: string;
  }> {
    try {
      const connectionTest = await this.testStorageConnection();
      const provider = this.storageProvider;
      
      let stats = { totalFiles: 0, totalSize: 0, availableSpace: 0 };
      
      if (connectionTest.success) {
        if (this.config.provider === 'local') {
          stats = await this.localStorageProvider.getStorageStats();
        } else {
          // For S3, we'll get basic stats
          const files = await this.s3StorageProvider.listFiles();
          stats = {
            totalFiles: files.length,
            totalSize: 0, // Would need to calculate from metadata
            availableSpace: 0, // S3 doesn't have this concept
          };
        }
      }

      return {
        provider: this.config.provider,
        ...stats,
        connectionStatus: connectionTest.success ? 'connected' : 'disconnected',
      };
    } catch (error) {
      this.logger.error('Error getting storage stats', { error: error.message });
      return {
        provider: this.config.provider,
        totalFiles: 0,
        totalSize: 0,
        availableSpace: 0,
        connectionStatus: 'error',
      };
    }
  }

  /**
   * Migrate files between storage providers
   */
  async migrateStorage(targetProvider: 'local' | 's3'): Promise<{
    success: boolean;
    migratedFiles: number;
    errors: string[];
  }> {
    try {
      if (targetProvider === this.config.provider) {
        return { success: true, migratedFiles: 0, errors: [] };
      }

      this.logger.log('Starting storage migration', { 
        from: this.config.provider, 
        to: targetProvider 
      });

      const sourceProvider = this.storageProvider;
      const targetProviderInstance = targetProvider === 's3' 
        ? this.s3StorageProvider 
        : this.localStorageProvider;

      // List all files from source
      const files = await sourceProvider.listFiles();
      const errors: string[] = [];
      let migratedFiles = 0;

      for (const filename of files) {
        try {
          // Get file from source
          const buffer = await sourceProvider.getFile(filename);
          
          // Store in target
          await targetProviderInstance.storeFile(filename, buffer);
          
          // Delete from source (optional - you might want to keep both)
          // await sourceProvider.deleteFile(filename);
          
          migratedFiles++;
          
          if (migratedFiles % 10 === 0) {
            this.logger.log('Migration progress', { migratedFiles, total: files.length });
          }
        } catch (error) {
          errors.push(`Failed to migrate ${filename}: ${error.message}`);
        }
      }

      this.logger.log('Storage migration completed', { 
        migratedFiles, 
        total: files.length, 
        errors: errors.length 
      });

      return {
        success: errors.length === 0,
        migratedFiles,
        errors,
      };
    } catch (error) {
      this.logger.error('Storage migration failed', { error: error.message });
      return {
        success: false,
        migratedFiles: 0,
        errors: [error.message],
      };
    }
  }

  // Private methods

  private createStorageProvider(): StorageProvider {
    const config = this.getStorageConfig();
    
    if (config.provider === 's3') {
      this.logger.log('Using S3 storage provider');
      return this.s3StorageProvider;
    } else {
      this.logger.log('Using local storage provider');
      return this.localStorageProvider;
    }
  }
}
