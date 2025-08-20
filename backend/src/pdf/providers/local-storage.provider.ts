import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { StorageProvider } from '../interfaces/storage.interface';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly basePath: string;

  constructor(private configService: ConfigService) {
    this.basePath = this.configService.get<string>('PDF_STORAGE_PATH', './storage/pdfs');
    this.ensureDirectoryExists(this.basePath);
  }

  async storeFile(filename: string, buffer: Buffer, metadata?: Record<string, any>): Promise<string> {
    try {
      const filePath = this.getFilePath(filename);
      
      // Ensure directory exists
      await this.ensureDirectoryExists(path.dirname(filePath));

      // Write file
      await fs.promises.writeFile(filePath, buffer);

      this.logger.log('File stored successfully locally', { filename, size: buffer.length });
      return filename;
    } catch (error) {
      this.logger.error('Error storing file locally', { filename, error: error.message });
      throw new Error(`Failed to store file locally: ${error.message}`);
    }
  }

  async getFile(filename: string): Promise<Buffer> {
    try {
      const filePath = this.getFilePath(filename);
      const buffer = await fs.promises.readFile(filePath);

      this.logger.log('File retrieved successfully from local storage', { filename });
      return buffer;
    } catch (error) {
      this.logger.error('Error retrieving file from local storage', { filename, error: error.message });
      throw new Error(`Failed to retrieve file from local storage: ${error.message}`);
    }
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      const filePath = this.getFilePath(filename);
      
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }

      this.logger.log('File deleted successfully from local storage', { filename });
    } catch (error) {
      this.logger.error('Error deleting file from local storage', { filename, error: error.message });
      throw new Error(`Failed to delete file from local storage: ${error.message}`);
    }
  }

  async fileExists(filename: string): Promise<boolean> {
    try {
      const filePath = this.getFilePath(filename);
      return fs.existsSync(filePath);
    } catch (error) {
      this.logger.error('Error checking file existence in local storage', { filename, error: error.message });
      return false;
    }
  }

  async getFileUrl(filename: string): Promise<string> {
    // For local storage, return a file:// URL or relative path
    const filePath = this.getFilePath(filename);
    return `file://${path.resolve(filePath)}`;
  }

  async listFiles(prefix?: string): Promise<string[]> {
    try {
      const searchPath = prefix ? path.join(this.basePath, prefix) : this.basePath;
      
      if (!fs.existsSync(searchPath)) {
        return [];
      }

      const files = await fs.promises.readdir(searchPath, { withFileTypes: true });
      const fileList: string[] = [];

      for (const file of files) {
        if (file.isFile()) {
          const relativePath = path.relative(this.basePath, path.join(searchPath, file.name));
          fileList.push(relativePath);
        } else if (file.isDirectory()) {
          // Recursively list files in subdirectories
          const subFiles = await this.listFiles(path.join(prefix || '', file.name));
          fileList.push(...subFiles);
        }
      }

      return fileList;
    } catch (error) {
      this.logger.error('Error listing files from local storage', { prefix, error: error.message });
      return [];
    }
  }

  /**
   * Get file metadata from local storage
   */
  async getFileMetadata(filename: string): Promise<Record<string, any> | null> {
    try {
      const filePath = this.getFilePath(filename);
      
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const stats = await fs.promises.stat(filePath);
      
      return {
        size: stats.size,
        contentType: 'application/pdf',
        lastModified: stats.mtime,
        created: stats.birthtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
      };
    } catch (error) {
      this.logger.error('Error getting file metadata from local storage', { filename, error: error.message });
      return null;
    }
  }

  /**
   * Copy file within local storage
   */
  async copyFile(sourceFilename: string, destinationFilename: string): Promise<void> {
    try {
      const sourcePath = this.getFilePath(sourceFilename);
      const destinationPath = this.getFilePath(destinationFilename);

      // Ensure destination directory exists
      await this.ensureDirectoryExists(path.dirname(destinationPath));

      // Copy file
      await fs.promises.copyFile(sourcePath, destinationPath);

      this.logger.log('File copied successfully in local storage', { sourceFilename, destinationFilename });
    } catch (error) {
      this.logger.error('Error copying file in local storage', { sourceFilename, destinationFilename, error: error.message });
      throw new Error(`Failed to copy file in local storage: ${error.message}`);
    }
  }

  /**
   * Move file within local storage
   */
  async moveFile(sourceFilename: string, destinationFilename: string): Promise<void> {
    try {
      const sourcePath = this.getFilePath(sourceFilename);
      const destinationPath = this.getFilePath(destinationFilename);

      // Ensure destination directory exists
      await this.ensureDirectoryExists(path.dirname(destinationPath));

      // Move file
      await fs.promises.rename(sourcePath, destinationPath);

      this.logger.log('File moved successfully in local storage', { sourceFilename, destinationFilename });
    } catch (error) {
      this.logger.error('Error moving file in local storage', { sourceFilename, destinationFilename, error: error.message });
      throw new Error(`Failed to move file in local storage: ${error.message}`);
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    availableSpace: number;
  }> {
    try {
      const files = await this.listFiles();
      let totalSize = 0;

      for (const file of files) {
        const metadata = await this.getFileMetadata(file);
        if (metadata?.size) {
          totalSize += metadata.size;
        }
      }

      return {
        totalFiles: files.length,
        totalSize,
        availableSpace: await this.getAvailableSpace(),
      };
    } catch (error) {
      this.logger.error('Error getting storage stats', { error: error.message });
      return { totalFiles: 0, totalSize: 0, availableSpace: 0 };
    }
  }

  // Private helper methods

  private getFilePath(filename: string): string {
    return path.join(this.basePath, filename);
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    if (!fs.existsSync(dirPath)) {
      await fs.promises.mkdir(dirPath, { recursive: true });
    }
  }

  private async getAvailableSpace(): Promise<number> {
    try {
      // This is a simplified approach - in production you might want to use a more robust method
      const stats = await fs.promises.stat(this.basePath);
      return 0; // Placeholder - would need platform-specific implementation
    } catch (error) {
      return 0;
    }
  }
}
