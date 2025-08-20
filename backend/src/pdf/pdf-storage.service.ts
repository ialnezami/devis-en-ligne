import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageFactoryService } from './services/storage-factory.service';
import { v4 as uuidv4 } from 'uuid';

export interface PDFMetadata {
  id: string;
  filename: string;
  originalName: string;
  quotationId?: string;
  templateId?: string;
  companyId?: string;
  type: 'quotation' | 'invoice' | 'proposal' | 'custom';
  version: string;
  size: number;
  mimeType: string;
  generatedAt: Date;
  generatedBy: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface PDFVersion {
  version: string;
  filename: string;
  size: number;
  generatedAt: Date;
  generatedBy: string;
  changes?: string;
}

export interface CompanyBranding {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  headerTemplate?: string;
  footerTemplate?: string;
  watermark?: string;
  customCSS?: string;
}

@Injectable()
export class PDFStorageService {
  private readonly logger = new Logger(PDFStorageService.name);
  private readonly maxFileSize: number; // in bytes
  private readonly allowedMimeTypes: string[];

  constructor(
    private configService: ConfigService,
    private storageFactory: StorageFactoryService,
  ) {
    this.maxFileSize = this.configService.get<number>('PDF_MAX_FILE_SIZE', 50 * 1024 * 1024); // 50MB
    this.allowedMimeTypes = ['application/pdf'];
  }

  /**
   * Store a PDF file with metadata
   */
  async storePDF(
    pdfBuffer: Buffer,
    metadata: Omit<PDFMetadata, 'id' | 'filename' | 'size' | 'mimeType' | 'generatedAt'>,
  ): Promise<PDFMetadata> {
    try {
      // Validate file
      this.validatePDFFile(pdfBuffer);

      // Generate unique filename
      const filename = this.generateFilename(metadata.type, metadata.quotationId);

      // Store file using storage provider
      const storageProvider = this.storageFactory.getStorageProvider();
      await storageProvider.storeFile(filename, pdfBuffer, {
        type: metadata.type,
        quotationId: metadata.quotationId,
        companyId: metadata.companyId,
      });

      // Create metadata
      const pdfMetadata: PDFMetadata = {
        ...metadata,
        id: uuidv4(),
        filename,
        size: pdfBuffer.length,
        mimeType: 'application/pdf',
        generatedAt: new Date(),
      };

      // Save metadata
      await this.saveMetadata(pdfMetadata);

      this.logger.log('PDF stored successfully', {
        filename,
        size: pdfBuffer.length,
        type: metadata.type,
        provider: this.storageFactory.getStorageConfig().provider,
      });

      return pdfMetadata;
    } catch (error) {
      this.logger.error('Error storing PDF', { error: error.message });
      throw error;
    }
  }

  /**
   * Retrieve a PDF file by ID
   */
  async getPDF(id: string): Promise<{ buffer: Buffer; metadata: PDFMetadata }> {
    try {
      const metadata = await this.getMetadata(id);
      if (!metadata) {
        throw new Error(`PDF with ID ${id} not found`);
      }

      const storageProvider = this.storageFactory.getStorageProvider();
      const buffer = await storageProvider.getFile(metadata.filename);

      this.logger.log('PDF retrieved successfully', { 
        id, 
        filename: metadata.filename,
        provider: this.storageFactory.getStorageConfig().provider,
      });

      return { buffer, metadata };
    } catch (error) {
      this.logger.error('Error retrieving PDF', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Create a new version of an existing PDF
   */
  async createVersion(
    originalId: string,
    pdfBuffer: Buffer,
    version: string,
    generatedBy: string,
    changes?: string,
  ): Promise<PDFMetadata> {
    try {
      const originalMetadata = await this.getMetadata(originalId);
      if (!originalMetadata) {
        throw new Error(`Original PDF with ID ${originalId} not found`);
      }

      // Generate new filename for version
      const filename = this.generateVersionFilename(originalMetadata.filename, version);

      // Store new version using storage provider
      const storageProvider = this.storageFactory.getStorageProvider();
      await storageProvider.storeFile(filename, pdfBuffer, {
        type: originalMetadata.type,
        quotationId: originalMetadata.quotationId,
        companyId: originalMetadata.companyId,
        version,
      });

      // Create version metadata
      const versionMetadata: PDFMetadata = {
        ...originalMetadata,
        id: uuidv4(),
        filename,
        version,
        size: pdfBuffer.length,
        generatedAt: new Date(),
        generatedBy,
      };

      // Save version metadata
      await this.saveMetadata(versionMetadata);

      // Update version history
      await this.addVersionHistory(originalId, {
        version,
        filename,
        size: pdfBuffer.length,
        generatedAt: new Date(),
        generatedBy,
        changes,
      });

      this.logger.log('PDF version created successfully', {
        originalId,
        version,
        filename,
        provider: this.storageFactory.getStorageConfig().provider,
      });

      return versionMetadata;
    } catch (error) {
      this.logger.error('Error creating PDF version', { originalId, error: error.message });
      throw error;
    }
  }

  /**
   * Get version history for a PDF
   */
  async getVersionHistory(id: string): Promise<PDFVersion[]> {
    try {
      const historyPath = this.getVersionHistoryPath(id);
      
      if (!this.fileExists(historyPath)) {
        return [];
      }

      const historyData = await this.readFile(historyPath);
      return JSON.parse(historyData);
    } catch (error) {
      this.logger.error('Error retrieving version history', { id, error: error.message });
      return [];
    }
  }

  /**
   * Delete a PDF file
   */
  async deletePDF(id: string): Promise<void> {
    try {
      const metadata = await this.getMetadata(id);
      if (!metadata) {
        throw new Error(`PDF with ID ${id} not found`);
      }

      // Delete file using storage provider
      const storageProvider = this.storageFactory.getStorageProvider();
      await storageProvider.deleteFile(metadata.filename);

      // Delete metadata
      await this.deleteMetadata(id);

      // Delete version history
      const historyPath = this.getVersionHistoryPath(id);
      if (this.fileExists(historyPath)) {
        await this.deleteFile(historyPath);
      }

      this.logger.log('PDF deleted successfully', { 
        id, 
        filename: metadata.filename,
        provider: this.storageFactory.getStorageConfig().provider,
      });
    } catch (error) {
      this.logger.error('Error deleting PDF', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Search PDFs by criteria
   */
  async searchPDFs(criteria: {
    type?: string;
    companyId?: string;
    quotationId?: string;
    generatedBy?: string;
    dateFrom?: Date;
    dateTo?: Date;
    tags?: string[];
  }): Promise<PDFMetadata[]> {
    try {
      const allMetadata = await this.getAllMetadata();
      
      return allMetadata.filter(metadata => {
        if (criteria.type && metadata.type !== criteria.type) return false;
        if (criteria.companyId && metadata.companyId !== criteria.companyId) return false;
        if (criteria.quotationId && metadata.quotationId !== criteria.quotationId) return false;
        if (criteria.generatedBy && metadata.generatedBy !== criteria.generatedBy) return false;
        
        if (criteria.dateFrom && metadata.generatedAt < criteria.dateFrom) return false;
        if (criteria.dateTo && metadata.generatedAt > criteria.dateTo) return false;
        
        if (criteria.tags && criteria.tags.length > 0) {
          const hasMatchingTag = criteria.tags.some(tag => 
            metadata.tags?.includes(tag)
          );
          if (!hasMatchingTag) return false;
        }
        
        return true;
      });
    } catch (error) {
      this.logger.error('Error searching PDFs', { criteria, error: error.message });
      throw error;
    }
  }

  /**
   * Get company branding configuration
   */
  async getCompanyBranding(companyId: string): Promise<CompanyBranding> {
    try {
      const brandingPath = this.getCompanyBrandingPath(companyId);
      
      if (!this.fileExists(brandingPath)) {
        return this.getDefaultBranding();
      }

      const brandingData = await this.readFile(brandingPath);
      return JSON.parse(brandingData);
    } catch (error) {
      this.logger.error('Error retrieving company branding', { companyId, error: error.message });
      return this.getDefaultBranding();
    }
  }

  /**
   * Update company branding configuration
   */
  async updateCompanyBranding(companyId: string, branding: CompanyBranding): Promise<void> {
    try {
      const brandingPath = this.getCompanyBrandingPath(companyId);
      
      // Ensure directory exists
      await this.ensureDirectoryExists(this.getDirectoryPath(brandingPath));
      
      // Save branding configuration
      await this.writeFile(brandingPath, JSON.stringify(branding, null, 2));

      this.logger.log('Company branding updated successfully', { companyId });
    } catch (error) {
      this.logger.error('Error updating company branding', { companyId, error: error.message });
      throw error;
    }
  }

  /**
   * Clean up old PDF versions
   */
  async cleanupOldVersions(maxVersions: number = 5): Promise<void> {
    try {
      const allMetadata = await this.getAllMetadata();
      const groupedByOriginal = new Map<string, PDFMetadata[]>();

      // Group PDFs by original ID
      for (const metadata of allMetadata) {
        const originalId = metadata.quotationId || metadata.id;
        if (!groupedByOriginal.has(originalId)) {
          groupedByOriginal.set(originalId, []);
        }
        groupedByOriginal.get(originalId)!.push(metadata);
      }

      // Clean up excess versions
      for (const [originalId, versions] of groupedByOriginal) {
        if (versions.length > maxVersions) {
          // Sort by generation date (oldest first)
          const sortedVersions = versions.sort((a, b) => 
            new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime()
          );

          // Keep the latest versions
          const versionsToDelete = sortedVersions.slice(0, versions.length - maxVersions);
          
          for (const version of versionsToDelete) {
            await this.deletePDF(version.id);
          }

          this.logger.log('Cleaned up old PDF versions', {
            originalId,
            deletedCount: versionsToDelete.length,
            remainingCount: maxVersions,
          });
        }
      }
    } catch (error) {
      this.logger.error('Error cleaning up old PDF versions', { error: error.message });
      throw error;
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    provider: string;
    totalFiles: number;
    totalSize: number;
    connectionStatus: string;
  }> {
    try {
      return await this.storageFactory.getStorageStats();
    } catch (error) {
      this.logger.error('Error getting storage stats', { error: error.message });
      return {
        provider: 'unknown',
        totalFiles: 0,
        totalSize: 0,
        connectionStatus: 'error',
      };
    }
  }

  // Private helper methods

  private validatePDFFile(buffer: Buffer): void {
    if (buffer.length === 0) {
      throw new Error('PDF buffer is empty');
    }

    if (buffer.length > this.maxFileSize) {
      throw new Error(`PDF file size exceeds maximum allowed size of ${this.maxFileSize} bytes`);
    }

    // Check PDF header (PDF files start with %PDF)
    const header = buffer.toString('ascii', 0, 4);
    if (header !== '%PDF') {
      throw new Error('Invalid PDF file format');
    }
  }

  private generateFilename(type: string, quotationId?: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const id = quotationId || uuidv4();
    return `${type}_${id}_${timestamp}.pdf`;
  }

  private generateVersionFilename(originalFilename: string, version: string): string {
    const nameWithoutExt = originalFilename.replace(/\.pdf$/, '');
    return `${nameWithoutExt}_v${version}.pdf`;
  }

  private getMetadataPath(id: string): string {
    return `metadata/${id}.json`;
  }

  private getVersionHistoryPath(id: string): string {
    return `versions/${id}.json`;
  }

  private getCompanyBrandingPath(companyId: string): string {
    return `branding/${companyId}.json`;
  }

  private getDirectoryPath(filePath: string): string {
    const parts = filePath.split('/');
    parts.pop();
    return parts.join('/');
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    // This is handled by the storage provider
    // For local storage, it will create directories
    // For S3, it's not needed
  }

  private async saveMetadata(metadata: PDFMetadata): Promise<void> {
    const metadataPath = this.getMetadataPath(metadata.id);
    await this.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  }

  private async getMetadata(id: string): Promise<PDFMetadata | null> {
    try {
      const metadataPath = this.getMetadataPath(id);
      if (!this.fileExists(metadataPath)) {
        return null;
      }

      const metadataData = await this.readFile(metadataPath);
      return JSON.parse(metadataData);
    } catch (error) {
      return null;
    }
  }

  private async getAllMetadata(): Promise<PDFMetadata[]> {
    try {
      const metadataDir = 'metadata';
      const storageProvider = this.storageFactory.getStorageProvider();
      const files = await storageProvider.listFiles(metadataDir);
      const metadata: PDFMetadata[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const fileData = await this.readFile(file);
          metadata.push(JSON.parse(fileData));
        }
      }

      return metadata;
    } catch (error) {
      return [];
    }
  }

  private async deleteMetadata(id: string): Promise<void> {
    const metadataPath = this.getMetadataPath(id);
    if (this.fileExists(metadataPath)) {
      await this.deleteFile(metadataPath);
    }
  }

  private async addVersionHistory(originalId: string, version: PDFVersion): Promise<void> {
    const history = await this.getVersionHistory(originalId);
    history.push(version);
    
    const historyPath = this.getVersionHistoryPath(originalId);
    await this.writeFile(historyPath, JSON.stringify(history, null, 2));
  }

  private getDefaultBranding(): CompanyBranding {
    return {
      primaryColor: '#2563eb',
      secondaryColor: '#64748b',
      fontFamily: 'Arial, sans-serif',
      customCSS: `
        .company-header { color: #2563eb; }
        .company-footer { color: #64748b; }
        .primary-button { background-color: #2563eb; }
        .secondary-button { background-color: #64748b; }
      `,
    };
  }

  // File operations using storage provider
  private async readFile(filePath: string): Promise<string> {
    const storageProvider = this.storageFactory.getStorageProvider();
    const buffer = await storageProvider.getFile(filePath);
    return buffer.toString('utf8');
  }

  private async writeFile(filePath: string, content: string): Promise<void> {
    const storageProvider = this.storageFactory.getStorageProvider();
    await storageProvider.storeFile(filePath, Buffer.from(content), { contentType: 'text/plain' });
  }

  private async deleteFile(filePath: string): Promise<void> {
    const storageProvider = this.storageFactory.getStorageProvider();
    await storageProvider.deleteFile(filePath);
  }

  private fileExists(filePath: string): boolean {
    // This is a simplified check - in production you'd want to use the storage provider
    try {
      const storageProvider = this.storageFactory.getStorageProvider();
      return storageProvider.fileExists(filePath);
    } catch {
      return false;
    }
  }
}
