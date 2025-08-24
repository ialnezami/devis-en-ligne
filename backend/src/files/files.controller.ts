import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile, 
  UploadedFiles,
  Res,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { FileUploadService } from './services/file-upload.service';
import { FileStorageService } from './services/file-storage.service';
import { FileAttachmentService } from './services/file-attachment.service';
import { FileVersioningService } from './services/file-versioning.service';
import { FileMetadata, FileUploadOptions } from './interfaces/file.interface';

@ApiTags('Files')
@Controller('files')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly fileStorageService: FileStorageService,
    private readonly fileAttachmentService: FileAttachmentService,
    private readonly fileVersioningService: FileVersioningService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        options: {
          type: 'string',
          description: 'JSON string of upload options',
        },
        metadata: {
          type: 'string',
          description: 'JSON string of file metadata',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('options') options?: string,
    @Body('metadata') metadata?: string,
  ) {
    try {
      if (!file) {
        throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
      }

      const uploadOptions: Partial<FileUploadOptions> = options ? JSON.parse(options) : {};
      const fileMetadata: Partial<FileMetadata> = metadata ? JSON.parse(metadata) : {};

      const result = await this.fileUploadService.uploadFile(file, uploadOptions, fileMetadata);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'File upload failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('upload/multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        options: {
          type: 'string',
          description: 'JSON string of upload options',
        },
        metadata: {
          type: 'string',
          description: 'JSON string of file metadata',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Files uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('options') options?: string,
    @Body('metadata') metadata?: string,
  ) {
    try {
      if (!files || files.length === 0) {
        throw new HttpException('No files provided', HttpStatus.BAD_REQUEST);
      }

      const uploadOptions: Partial<FileUploadOptions> = options ? JSON.parse(options) : {};
      const fileMetadata: Partial<FileMetadata> = metadata ? JSON.parse(metadata) : {};

      const results = await this.fileUploadService.uploadMultipleFiles(files, uploadOptions, fileMetadata);
      return results;
    } catch (error) {
      throw new HttpException(
        error.message || 'Files upload failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':fileId')
  @ApiOperation({ summary: 'Download a file' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async downloadFile(
    @Param('fileId') fileId: string,
    @Res() res: Response,
  ) {
    try {
      const file = await this.fileStorageService.getFile(fileId);
      if (!file) {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }

      const metadata = await this.fileStorageService.getFileMetadata(fileId);
      if (!metadata) {
        throw new HttpException('File metadata not found', HttpStatus.NOT_FOUND);
      }

      res.set({
        'Content-Type': metadata.mimeType,
        'Content-Disposition': `attachment; filename="${metadata.originalName}"`,
        'Content-Length': metadata.size.toString(),
      });

      res.send(file);
    } catch (error) {
      throw new HttpException(
        error.message || 'File download failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':fileId/metadata')
  @ApiOperation({ summary: 'Get file metadata' })
  @ApiResponse({ status: 200, description: 'File metadata retrieved successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async getFileMetadata(@Param('fileId') fileId: string) {
    try {
      const metadata = await this.fileStorageService.getFileMetadata(fileId);
      if (!metadata) {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }
      return metadata;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get file metadata',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':fileId')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteFile(@Param('fileId') fileId: string) {
    try {
      const success = await this.fileStorageService.deleteFile(fileId);
      if (!success) {
        throw new HttpException('File not found or deletion failed', HttpStatus.NOT_FOUND);
      }
      return { message: 'File deleted successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'File deletion failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':fileId/versions')
  @ApiOperation({ summary: 'Get file versions' })
  @ApiResponse({ status: 200, description: 'File versions retrieved successfully' })
  async getFileVersions(
    @Param('fileId') fileId: string,
    @Query('version') version?: string,
    @Query('uploadedBy') uploadedBy?: string,
    @Query('changes') changes?: string,
  ) {
    try {
      const versions = await this.fileVersioningService.getFileVersions(fileId, {
        version,
        uploadedBy,
        changes,
      });
      return versions;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get file versions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':fileId/versions')
  @ApiOperation({ summary: 'Create a new file version' })
  @ApiResponse({ status: 201, description: 'File version created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createFileVersion(
    @Param('fileId') fileId: string,
    @Body() body: {
      version: string;
      uploadedBy: string;
      changes?: string;
      metadata?: Partial<FileMetadata>;
    },
  ) {
    try {
      // This would typically involve uploading a new file
      // For now, we'll return a placeholder response
      throw new HttpException(
        'Version creation requires file upload - use upload endpoint with version parameter',
        HttpStatus.BAD_REQUEST,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create file version',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':fileId/versions/:version')
  @ApiOperation({ summary: 'Get a specific file version' })
  @ApiResponse({ status: 200, description: 'File version retrieved successfully' })
  @ApiResponse({ status: 404, description: 'File version not found' })
  async getFileVersion(
    @Param('fileId') fileId: string,
    @Param('version') version: string,
  ) {
    try {
      const fileVersion = await this.fileVersioningService.getVersion(fileId, version);
      if (!fileVersion) {
        throw new HttpException('File version not found', HttpStatus.NOT_FOUND);
      }
      return fileVersion;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get file version',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':fileId/versions/:version/rollback')
  @ApiOperation({ summary: 'Rollback to a specific file version' })
  @ApiResponse({ status: 200, description: 'File rolled back successfully' })
  @ApiResponse({ status: 404, description: 'File version not found' })
  async rollbackToVersion(
    @Param('fileId') fileId: string,
    @Param('version') version: string,
    @Body() body: { uploadedBy: string; reason?: string },
  ) {
    try {
      const result = await this.fileVersioningService.rollbackToVersion(
        fileId,
        version,
        body.uploadedBy,
        body.reason,
      );
      
      if (!result.success) {
        throw new HttpException(result.error || 'Rollback failed', HttpStatus.BAD_REQUEST);
      }
      
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to rollback file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':fileId/versions/:version1/compare/:version2')
  @ApiOperation({ summary: 'Compare two file versions' })
  @ApiResponse({ status: 200, description: 'Version comparison completed successfully' })
  @ApiResponse({ status: 404, description: 'One or both versions not found' })
  async compareVersions(
    @Param('fileId') fileId: string,
    @Param('version1') version1: string,
    @Param('version2') version2: string,
  ) {
    try {
      const comparison = await this.fileVersioningService.compareVersions(
        fileId,
        version1,
        version2,
      );
      
      if (!comparison) {
        throw new HttpException('One or both versions not found', HttpStatus.NOT_FOUND);
      }
      
      return comparison;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to compare versions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':fileId/versions/stats')
  @ApiOperation({ summary: 'Get file version statistics' })
  @ApiResponse({ status: 200, description: 'Version statistics retrieved successfully' })
  async getVersionStats(@Param('fileId') fileId: string) {
    try {
      const stats = await this.fileVersioningService.getVersionStats(fileId);
      return stats;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get version statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('attachments')
  @ApiOperation({ summary: 'Attach a file to an entity' })
  @ApiResponse({ status: 201, description: 'File attached successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async attachFile(
    @Body() body: {
      fileId: string;
      entityType: string;
      entityId: string;
      attachmentType?: string;
      displayName?: string;
      description?: string;
      order?: number;
      isRequired?: boolean;
    },
  ) {
    try {
      const result = await this.fileAttachmentService.attachFile(
        body.fileId,
        body.entityType,
        body.entityId,
        body.attachmentType,
        body.displayName,
        body.description,
        body.order,
        body.isRequired,
      );
      
      if (!result.success) {
        throw new HttpException(result.error || 'Attachment failed', HttpStatus.BAD_REQUEST);
      }
      
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to attach file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('attachments/:entityType/:entityId')
  @ApiOperation({ summary: 'Get attachments for an entity' })
  @ApiResponse({ status: 200, description: 'Attachments retrieved successfully' })
  async getEntityAttachments(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('attachmentType') attachmentType?: string,
    @Query('isRequired') isRequired?: boolean,
  ) {
    try {
      const attachments = await this.fileAttachmentService.getEntityAttachments(
        entityType,
        entityId,
        { attachmentType, isRequired: isRequired === true },
      );
      return attachments;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get attachments',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('attachments/:attachmentId')
  @ApiOperation({ summary: 'Update attachment metadata' })
  @ApiResponse({ status: 200, description: 'Attachment updated successfully' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async updateAttachment(
    @Param('attachmentId') attachmentId: string,
    @Body() body: {
      displayName?: string;
      description?: string;
      order?: number;
      isRequired?: boolean;
    },
  ) {
    try {
      const result = await this.fileAttachmentService.updateAttachment(
        attachmentId,
        body,
      );
      
      if (!result.success) {
        throw new HttpException(result.error || 'Update failed', HttpStatus.BAD_REQUEST);
      }
      
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update attachment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('attachments/:attachmentId')
  @ApiOperation({ summary: 'Detach a file from an entity' })
  @ApiResponse({ status: 200, description: 'File detached successfully' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async detachFile(@Param('attachmentId') attachmentId: string) {
    try {
      const result = await this.fileAttachmentService.detachFile(attachmentId);
      
      if (!result.success) {
        throw new HttpException(result.error || 'Detachment failed', HttpStatus.BAD_REQUEST);
      }
      
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to detach file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('attachments/:entityType/:entityId/reorder')
  @ApiOperation({ summary: 'Reorder attachments for an entity' })
  @ApiResponse({ status: 200, description: 'Attachments reordered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async reorderAttachments(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Body() body: { attachmentIds: string[] },
  ) {
    try {
      const result = await this.fileAttachmentService.reorderAttachments(
        entityType,
        entityId,
        body.attachmentIds,
      );
      
      if (!result.success) {
        throw new HttpException(result.error || 'Reordering failed', HttpStatus.BAD_REQUEST);
      }
      
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to reorder attachments',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('attachments/:entityType/:entityId/stats')
  @ApiOperation({ summary: 'Get attachment statistics for an entity' })
  @ApiResponse({ status: 200, description: 'Attachment statistics retrieved successfully' })
  async getAttachmentStats(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    try {
      const stats = await this.fileAttachmentService.getAttachmentStats(entityType, entityId);
      return stats;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get attachment statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('attachments/:entityType/:entityId/validate')
  @ApiOperation({ summary: 'Validate attachment requirements for an entity' })
  @ApiResponse({ status: 200, description: 'Validation completed successfully' })
  async validateAttachmentRequirements(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    try {
      const validation = await this.fileAttachmentService.validateAttachmentRequirements(
        entityType,
        entityId,
      );
      return validation;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to validate attachments',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('attachments/:entityType/:entityId/bulk')
  @ApiOperation({ summary: 'Bulk attach files to an entity' })
  @ApiResponse({ status: 201, description: 'Bulk attachment completed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async bulkAttachFiles(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Body() body: {
      files: Array<{
        fileId: string;
        attachmentType: string;
        displayName?: string;
        description?: string;
        isRequired?: boolean;
      }>;
    },
  ) {
    try {
      const result = await this.fileAttachmentService.bulkAttachFiles(
        body.files,
        entityType,
        entityId,
      );
      
      if (!result.success) {
        throw new HttpException('Some attachments failed', HttpStatus.BAD_REQUEST);
      }
      
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to bulk attach files',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Search files' })
  @ApiResponse({ status: 200, description: 'Search completed successfully' })
  async searchFiles(
    @Query('query') query: string,
    @Query('mimeType') mimeType?: string,
    @Query('sizeMin') sizeMin?: string,
    @Query('sizeMax') sizeMax?: string,
    @Query('uploadedAfter') uploadedAfter?: string,
    @Query('uploadedBefore') uploadedBefore?: string,
  ) {
    try {
      // This would typically use a search service
      // For now, return a placeholder response
      return {
        message: 'File search functionality not yet implemented',
        query,
        filters: { mimeType, sizeMin, sizeMax, uploadedAfter, uploadedBefore },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Search failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
