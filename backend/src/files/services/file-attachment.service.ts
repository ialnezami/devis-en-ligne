import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  FileAttachment, 
  FileMetadata 
} from '../interfaces/file.interface';
import { FileStorageService } from './file-storage.service';

export interface AttachmentResult {
  success: boolean;
  attachment?: FileAttachment;
  error?: string;
}

export interface AttachmentQuery {
  entityType?: string;
  entityId?: string;
  attachmentType?: string;
  isRequired?: boolean;
}

@Injectable()
export class FileAttachmentService {
  private readonly logger = new Logger(FileAttachmentService.name);
  private readonly attachments: Map<string, FileAttachment> = new Map();

  constructor(
    private configService: ConfigService,
    private fileStorage: FileStorageService,
  ) {}

  /**
   * Attach a file to an entity
   */
  async attachFile(
    fileId: string,
    entityType: string,
    entityId: string,
    attachmentType: string = 'document',
    displayName?: string,
    description?: string,
    order?: number,
    isRequired: boolean = false,
  ): Promise<AttachmentResult> {
    try {
      // Verify file exists
      const fileMetadata = await this.fileStorage.getFileMetadata(fileId);
      if (!fileMetadata) {
        return { success: false, error: 'File not found' };
      }

      // Check if attachment already exists
      const existingAttachment = this.findAttachment(fileId, entityType, entityId);
      if (existingAttachment) {
        return { success: false, error: 'File already attached to this entity' };
      }

      // Create attachment
      const attachment: FileAttachment = {
        id: this.generateAttachmentId(),
        fileId,
        entityType: entityType as any,
        entityId,
        attachmentType: attachmentType as any,
        displayName: displayName || fileMetadata.originalName,
        description,
        order: order || this.getNextOrder(entityType, entityId),
        isRequired,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store attachment
      this.attachments.set(attachment.id, attachment);

      this.logger.log('File attached successfully', { 
        attachmentId: attachment.id,
        fileId,
        entityType,
        entityId 
      });

      return {
        success: true,
        attachment,
      };

    } catch (error) {
      this.logger.error('Error attaching file', { 
        fileId, 
        entityType, 
        entityId, 
        error: error.message 
      });
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Detach a file from an entity
   */
  async detachFile(
    attachmentId: string,
  ): Promise<AttachmentResult> {
    try {
      const attachment = this.attachments.get(attachmentId);
      if (!attachment) {
        return { success: false, error: 'Attachment not found' };
      }

      // Remove attachment
      this.attachments.delete(attachmentId);

      this.logger.log('File detached successfully', { 
        attachmentId,
        fileId: attachment.fileId,
        entityType: attachment.entityType,
        entityId: attachment.entityId 
      });

      return {
        success: true,
        attachment,
      };

    } catch (error) {
      this.logger.error('Error detaching file', { 
        attachmentId, 
        error: error.message 
      });
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get all attachments for an entity
   */
  async getEntityAttachments(
    entityType: string,
    entityId: string,
    query?: AttachmentQuery,
  ): Promise<FileAttachment[]> {
    try {
      let attachments = Array.from(this.attachments.values()).filter(
        attachment => attachment.entityType === entityType && attachment.entityId === entityId
      );

      // Apply filters
      if (query?.attachmentType) {
        attachments = attachments.filter(attachment => attachment.attachmentType === query.attachmentType);
      }

      if (query?.isRequired !== undefined) {
        attachments = attachments.filter(attachment => attachment.isRequired === query.isRequired);
      }

      // Sort by order
      attachments.sort((a, b) => (a.order || 0) - (b.order || 0));

      return attachments;
    } catch (error) {
      this.logger.error('Error getting entity attachments', { 
        entityType, 
        entityId, 
        error: error.message 
      });
      return [];
    }
  }

  /**
   * Get attachment by ID
   */
  async getAttachment(attachmentId: string): Promise<FileAttachment | null> {
    try {
      return this.attachments.get(attachmentId) || null;
    } catch (error) {
      this.logger.error('Error getting attachment', { 
        attachmentId, 
        error: error.message 
      });
      return null;
    }
  }

  /**
   * Update attachment metadata
   */
  async updateAttachment(
    attachmentId: string,
    updates: Partial<Pick<FileAttachment, 'displayName' | 'description' | 'order' | 'isRequired'>>,
  ): Promise<AttachmentResult> {
    try {
      const attachment = this.attachments.get(attachmentId);
      if (!attachment) {
        return { success: false, error: 'Attachment not found' };
      }

      // Update fields
      if (updates.displayName !== undefined) {
        attachment.displayName = updates.displayName;
      }
      if (updates.description !== undefined) {
        attachment.description = updates.description;
      }
      if (updates.order !== undefined) {
        attachment.order = updates.order;
      }
      if (updates.isRequired !== undefined) {
        attachment.isRequired = updates.isRequired;
      }

      attachment.updatedAt = new Date();

      this.logger.log('Attachment updated successfully', { 
        attachmentId,
        updates 
      });

      return {
        success: true,
        attachment,
      };

    } catch (error) {
      this.logger.error('Error updating attachment', { 
        attachmentId, 
        error: error.message 
      });
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Reorder attachments for an entity
   */
  async reorderAttachments(
    entityType: string,
    entityId: string,
    attachmentIds: string[],
  ): Promise<AttachmentResult> {
    try {
      const attachments = await this.getEntityAttachments(entityType, entityId);
      
      if (attachments.length !== attachmentIds.length) {
        return { success: false, error: 'Invalid attachment count for reordering' };
      }

      // Update order for each attachment
      for (let i = 0; i < attachmentIds.length; i++) {
        const attachment = attachments.find(a => a.id === attachmentIds[i]);
        if (attachment) {
          attachment.order = i + 1;
          attachment.updatedAt = new Date();
        }
      }

      this.logger.log('Attachments reordered successfully', { 
        entityType,
        entityId,
        newOrder: attachmentIds 
      });

      return { success: true };

    } catch (error) {
      this.logger.error('Error reordering attachments', { 
        entityType, 
        entityId, 
        error: error.message 
      });
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get attachment statistics for an entity
   */
  async getAttachmentStats(
    entityType: string,
    entityId: string,
  ): Promise<{
    total: number;
    byType: Record<string, number>;
    required: number;
    totalSize: number;
  }> {
    try {
      const attachments = await this.getEntityAttachments(entityType, entityId);
      
      const stats = {
        total: attachments.length,
        byType: {} as Record<string, number>,
        required: 0,
        totalSize: 0,
      };

      for (const attachment of attachments) {
        // Count by type
        stats.byType[attachment.attachmentType] = (stats.byType[attachment.attachmentType] || 0) + 1;
        
        // Count required
        if (attachment.isRequired) {
          stats.required++;
        }

        // Get file size
        const fileMetadata = await this.fileStorage.getFileMetadata(attachment.fileId);
        if (fileMetadata) {
          stats.totalSize += fileMetadata.size;
        }
      }

      return stats;
    } catch (error) {
      this.logger.error('Error getting attachment stats', { 
        entityType, 
        entityId, 
        error: error.message 
      });
      
      return {
        total: 0,
        byType: {},
        required: 0,
        totalSize: 0,
      };
    }
  }

  /**
   * Validate attachment requirements for an entity
   */
  async validateAttachmentRequirements(
    entityType: string,
    entityId: string,
  ): Promise<{
    valid: boolean;
    missing: string[];
    warnings: string[];
  }> {
    try {
      const attachments = await this.getEntityAttachments(entityType, entityId);
      const requiredAttachments = attachments.filter(a => a.isRequired);
      
      const missing: string[] = [];
      const warnings: string[] = [];

      // Check if all required attachments are present
      for (const required of requiredAttachments) {
        const fileMetadata = await this.fileStorage.getFileMetadata(required.fileId);
        if (!fileMetadata) {
          missing.push(`${required.attachmentType}: ${required.displayName || 'Unknown file'}`);
        }
      }

      // Check for potential issues
      if (attachments.length === 0) {
        warnings.push('No attachments found for this entity');
      }

      if (requiredAttachments.length === 0) {
        warnings.push('No required attachments defined for this entity type');
      }

      const valid = missing.length === 0;

      return {
        valid,
        missing,
        warnings,
      };

    } catch (error) {
      this.logger.error('Error validating attachment requirements', { 
        entityType, 
        entityId, 
        error: error.message 
      });
      
      return {
        valid: false,
        missing: ['Validation failed due to error'],
        warnings: [],
      };
    }
  }

  /**
   * Bulk attach files to an entity
   */
  async bulkAttachFiles(
    files: Array<{
      fileId: string;
      attachmentType: string;
      displayName?: string;
      description?: string;
      isRequired?: boolean;
    }>,
    entityType: string,
    entityId: string,
  ): Promise<{
    success: boolean;
    results: Array<{ fileId: string; success: boolean; attachment?: FileAttachment; error?: string }>;
  }> {
    try {
      const results = [];
      
      for (const file of files) {
        const result = await this.attachFile(
          file.fileId,
          entityType,
          entityId,
          file.attachmentType,
          file.displayName,
          file.description,
          undefined,
          file.isRequired || false,
        );

        results.push({
          fileId: file.fileId,
          success: result.success,
          attachment: result.attachment,
          error: result.error,
        });
      }

      const allSuccessful = results.every(r => r.success);

      this.logger.log('Bulk attachment completed', { 
        entityType,
        entityId,
        totalFiles: files.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      });

      return {
        success: allSuccessful,
        results,
      };

    } catch (error) {
      this.logger.error('Error in bulk attachment', { 
        entityType, 
        entityId, 
        error: error.message 
      });
      
      return {
        success: false,
        results: files.map(f => ({
          fileId: f.fileId,
          success: false,
          error: 'Bulk operation failed',
        })),
      };
    }
  }

  // Private helper methods

  private findAttachment(fileId: string, entityType: string, entityId: string): FileAttachment | null {
    return Array.from(this.attachments.values()).find(
      attachment => 
        attachment.fileId === fileId && 
        attachment.entityType === entityType && 
        attachment.entityId === entityId
    ) || null;
  }

  private generateAttachmentId(): string {
    return `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getNextOrder(entityType: string, entityId: string): number {
    const attachments = Array.from(this.attachments.values()).filter(
      attachment => attachment.entityType === entityType && attachment.entityId === entityId
    );
    
    if (attachments.length === 0) {
      return 1;
    }
    
    const maxOrder = Math.max(...attachments.map(a => a.order || 0));
    return maxOrder + 1;
  }
}
