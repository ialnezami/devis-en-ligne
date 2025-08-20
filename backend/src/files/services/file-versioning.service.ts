import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  FileVersion, 
  FileMetadata 
} from '../interfaces/file.interface';
import { FileStorageService } from './file-storage.service';

export interface VersionResult {
  success: boolean;
  version?: FileVersion;
  error?: string;
}

export interface VersionQuery {
  fileId?: string;
  version?: string;
  uploadedBy?: string;
  changes?: string;
}

export interface VersionComparison {
  currentVersion: FileVersion;
  previousVersion: FileVersion;
  differences: {
    sizeChanged: boolean;
    sizeDifference: number;
    metadataChanged: boolean;
    metadataDifferences: Record<string, { old: any; new: any }>;
    contentChanged: boolean;
  };
}

@Injectable()
export class FileVersioningService {
  private readonly logger = new Logger(FileVersioningService.name);
  private readonly versions: Map<string, FileVersion> = new Map();
  private readonly versionHistory: Map<string, FileVersion[]> = new Map();

  constructor(
    private configService: ConfigService,
    private fileStorage: FileStorageService,
  ) {}

  /**
   * Create a new version of a file
   */
  async createVersion(
    fileId: string,
    filePath: string,
    buffer: Buffer,
    version: string,
    uploadedBy: string,
    changes?: string,
    metadata?: Partial<FileMetadata>,
  ): Promise<VersionResult> {
    try {
      // Get current file metadata
      const currentMetadata = await this.fileStorage.getFileMetadata(fileId);
      if (!currentMetadata) {
        return { success: false, error: 'Original file not found' };
      }

      // Check if version already exists
      const existingVersion = this.findVersion(fileId, version);
      if (existingVersion) {
        return { success: false, error: 'Version already exists' };
      }

      // Create version record
      const fileVersion: FileVersion = {
        id: this.generateVersionId(),
        fileId,
        version,
        filePath,
        size: buffer.length,
        uploadedBy,
        changes: changes || 'New version created',
        createdAt: new Date(),
        metadata: metadata || {},
      };

      // Store version
      this.versions.set(fileVersion.id, fileVersion);

      // Add to version history
      if (!this.versionHistory.has(fileId)) {
        this.versionHistory.set(fileId, []);
      }
      this.versionHistory.get(fileId)!.push(fileVersion);

      // Store file content
      const storageResult = await this.fileStorage.createFileVersion(
        fileId,
        filePath,
        buffer,
        version,
        uploadedBy,
        changes,
      );

      if (!storageResult) {
        return { success: false, error: 'Failed to store version file' };
      }

      this.logger.log('File version created successfully', { 
        versionId: fileVersion.id,
        fileId,
        version,
        uploadedBy,
        size: buffer.length 
      });

      return {
        success: true,
        version: fileVersion,
      };

    } catch (error) {
      this.logger.error('Error creating file version', { 
        fileId, 
        version, 
        error: error.message 
      });
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get all versions of a file
   */
  async getFileVersions(
    fileId: string,
    query?: VersionQuery,
  ): Promise<FileVersion[]> {
    try {
      let versions = this.versionHistory.get(fileId) || [];

      // Apply filters
      if (query?.version) {
        versions = versions.filter(v => v.version === query.version);
      }

      if (query?.uploadedBy) {
        versions = versions.filter(v => v.uploadedBy === query.uploadedBy);
      }

      if (query?.changes) {
        versions = versions.filter(v => 
          v.changes.toLowerCase().includes(query.changes!.toLowerCase())
        );
      }

      // Sort by creation date (newest first)
      versions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return versions;
    } catch (error) {
      this.logger.error('Error getting file versions', { 
        fileId, 
        error: error.message 
      });
      return [];
    }
  }

  /**
   * Get a specific version of a file
   */
  async getVersion(
    fileId: string,
    version: string,
  ): Promise<FileVersion | null> {
    try {
      return this.findVersion(fileId, version) || null;
    } catch (error) {
      this.logger.error('Error getting file version', { 
        fileId, 
        version, 
        error: error.message 
      });
      return null;
    }
  }

  /**
   * Get the latest version of a file
   */
  async getLatestVersion(fileId: string): Promise<FileVersion | null> {
    try {
      const versions = await this.getFileVersions(fileId);
      return versions.length > 0 ? versions[0] : null;
    } catch (error) {
      this.logger.error('Error getting latest version', { 
        fileId, 
        error: error.message 
      });
      return null;
    }
  }

  /**
   * Compare two versions of a file
   */
  async compareVersions(
    fileId: string,
    version1: string,
    version2: string,
  ): Promise<VersionComparison | null> {
    try {
      const v1 = await this.getVersion(fileId, version1);
      const v2 = await this.getVersion(fileId, version2);

      if (!v1 || !v2) {
        return null;
      }

      // Determine which is current and which is previous
      const currentVersion = v1.createdAt > v2.createdAt ? v1 : v2;
      const previousVersion = v1.createdAt > v2.createdAt ? v2 : v1;

      // Get current file metadata for comparison
      const currentMetadata = await this.fileStorage.getFileMetadata(fileId);

      const differences = {
        sizeChanged: currentVersion.size !== previousVersion.size,
        sizeDifference: currentVersion.size - previousVersion.size,
        metadataChanged: false,
        metadataDifferences: {} as Record<string, { old: any; new: any }>,
        contentChanged: false,
      };

      // Compare metadata if available
      if (currentMetadata && previousVersion.metadata) {
        const metadataFields = ['mimeType', 'originalName', 'description'];
        
        for (const field of metadataFields) {
          const oldValue = (previousVersion.metadata as any)[field];
          const newValue = (currentMetadata as any)[field];
          
          if (oldValue !== newValue) {
            differences.metadataChanged = true;
            differences.metadataDifferences[field] = {
              old: oldValue,
              new: newValue,
            };
          }
        }
      }

      // Check if content changed (simplified check)
      differences.contentChanged = differences.sizeChanged || differences.metadataChanged;

      return {
        currentVersion,
        previousVersion,
        differences,
      };

    } catch (error) {
      this.logger.error('Error comparing versions', { 
        fileId, 
        version1, 
        version2, 
        error: error.message 
      });
      return null;
    }
  }

  /**
   * Rollback to a previous version
   */
  async rollbackToVersion(
    fileId: string,
    targetVersion: string,
    uploadedBy: string,
    reason?: string,
  ): Promise<VersionResult> {
    try {
      const targetVersionData = await this.getVersion(fileId, targetVersion);
      if (!targetVersionData) {
        return { success: false, error: 'Target version not found' };
      }

      // Get the target version file content
      const targetFileContent = await this.fileStorage.getFile(targetVersionData.filePath);
      if (!targetFileContent) {
        return { success: false, error: 'Target version file content not found' };
      }

      // Create a new version with the rollback content
      const rollbackVersion = `rollback_${Date.now()}`;
      const rollbackResult = await this.createVersion(
        fileId,
        targetVersionData.filePath,
        targetFileContent,
        rollbackVersion,
        uploadedBy,
        `Rollback to version ${targetVersion}${reason ? `: ${reason}` : ''}`,
      );

      if (!rollbackResult.success) {
        return rollbackResult;
      }

      this.logger.log('File rolled back successfully', { 
        fileId,
        fromVersion: await this.getLatestVersion(fileId).then(v => v?.version),
        toVersion: targetVersion,
        rollbackVersion,
        uploadedBy,
        reason 
      });

      return rollbackResult;

    } catch (error) {
      this.logger.error('Error rolling back file', { 
        fileId, 
        targetVersion, 
        error: error.message 
      });
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete a specific version
   */
  async deleteVersion(
    fileId: string,
    version: string,
  ): Promise<VersionResult> {
    try {
      const versionData = await this.getVersion(fileId, version);
      if (!versionData) {
        return { success: false, error: 'Version not found' };
      }

      // Check if this is the only version
      const allVersions = await this.getFileVersions(fileId);
      if (allVersions.length <= 1) {
        return { success: false, error: 'Cannot delete the only version of a file' };
      }

      // Remove from storage
      await this.fileStorage.deleteFile(versionData.filePath);

      // Remove from version history
      const fileVersions = this.versionHistory.get(fileId) || [];
      const updatedVersions = fileVersions.filter(v => v.id !== versionData.id);
      this.versionHistory.set(fileId, updatedVersions);

      // Remove from versions map
      this.versions.delete(versionData.id);

      this.logger.log('File version deleted successfully', { 
        versionId: versionData.id,
        fileId,
        version,
        remainingVersions: updatedVersions.length 
      });

      return {
        success: true,
        version: versionData,
      };

    } catch (error) {
      this.logger.error('Error deleting file version', { 
        fileId, 
        version, 
        error: error.message 
      });
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get version statistics for a file
   */
  async getVersionStats(fileId: string): Promise<{
    totalVersions: number;
    totalSize: number;
    averageSize: number;
    oldestVersion: Date | null;
    newestVersion: Date | null;
    versionHistory: Array<{ version: string; size: number; createdAt: Date; uploadedBy: string }>;
  }> {
    try {
      const versions = await this.getFileVersions(fileId);
      
      if (versions.length === 0) {
        return {
          totalVersions: 0,
          totalSize: 0,
          averageSize: 0,
          oldestVersion: null,
          newestVersion: null,
          versionHistory: [],
        };
      }

      const totalSize = versions.reduce((sum, v) => sum + v.size, 0);
      const averageSize = Math.round(totalSize / versions.length);
      const oldestVersion = versions[versions.length - 1]?.createdAt || null;
      const newestVersion = versions[0]?.createdAt || null;

      const versionHistory = versions.map(v => ({
        version: v.version,
        size: v.size,
        createdAt: v.createdAt,
        uploadedBy: v.uploadedBy,
      }));

      return {
        totalVersions: versions.length,
        totalSize,
        averageSize,
        oldestVersion,
        newestVersion,
        versionHistory,
      };

    } catch (error) {
      this.logger.error('Error getting version stats', { 
        fileId, 
        error: error.message 
      });
      
      return {
        totalVersions: 0,
        totalSize: 0,
        averageSize: 0,
        oldestVersion: null,
        newestVersion: null,
        versionHistory: [],
      };
    }
  }

  /**
   * Clean up old versions based on retention policy
   */
  async cleanupOldVersions(
    fileId: string,
    maxVersions: number = 10,
    maxAgeDays: number = 365,
  ): Promise<{
    success: boolean;
    deletedCount: number;
    errors: string[];
  }> {
    try {
      const versions = await this.getFileVersions(fileId);
      
      if (versions.length <= maxVersions) {
        return { success: true, deletedCount: 0, errors: [] };
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

      const versionsToDelete = versions
        .slice(maxVersions) // Keep only the most recent maxVersions
        .filter(v => v.createdAt < cutoffDate); // Only delete old versions

      const errors: string[] = [];
      let deletedCount = 0;

      for (const version of versionsToDelete) {
        try {
          const result = await this.deleteVersion(fileId, version.version);
          if (result.success) {
            deletedCount++;
          } else {
            errors.push(`Failed to delete version ${version.version}: ${result.error}`);
          }
        } catch (error) {
          errors.push(`Error deleting version ${version.version}: ${error.message}`);
        }
      }

      this.logger.log('Version cleanup completed', { 
        fileId,
        totalVersions: versions.length,
        deletedCount,
        remainingVersions: versions.length - deletedCount,
        errors: errors.length 
      });

      return {
        success: errors.length === 0,
        deletedCount,
        errors,
      };

    } catch (error) {
      this.logger.error('Error during version cleanup', { 
        fileId, 
        error: error.message 
      });
      
      return {
        success: false,
        deletedCount: 0,
        errors: [error.message],
      };
    }
  }

  /**
   * Export version history to a report
   */
  async exportVersionHistory(
    fileId: string,
    format: 'json' | 'csv' = 'json',
  ): Promise<{
    success: boolean;
    data?: string;
    error?: string;
  }> {
    try {
      const versions = await this.getFileVersions(fileId);
      const stats = await this.getVersionStats(fileId);

      if (format === 'json') {
        const report = {
          fileId,
          summary: stats,
          versions: versions.map(v => ({
            version: v.version,
            size: v.size,
            uploadedBy: v.uploadedBy,
            changes: v.changes,
            createdAt: v.createdAt,
          })),
          exportDate: new Date(),
        };

        return {
          success: true,
          data: JSON.stringify(report, null, 2),
        };
      } else if (format === 'csv') {
        const csvHeaders = 'Version,Size (bytes),Uploaded By,Changes,Created At\n';
        const csvRows = versions.map(v => 
          `"${v.version}","${v.size}","${v.uploadedBy}","${v.changes.replace(/"/g, '""')}","${v.createdAt.toISOString()}"`
        ).join('\n');

        const csvData = csvHeaders + csvRows;

        return {
          success: true,
          data: csvData,
        };
      }

      return { success: false, error: 'Unsupported format' };

    } catch (error) {
      this.logger.error('Error exporting version history', { 
        fileId, 
        format, 
        error: error.message 
      });
      
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Private helper methods

  private findVersion(fileId: string, version: string): FileVersion | null {
    const fileVersions = this.versionHistory.get(fileId) || [];
    return fileVersions.find(v => v.version === version) || null;
  }

  private generateVersionId(): string {
    return `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
