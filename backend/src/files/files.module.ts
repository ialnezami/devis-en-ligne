import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FilesController } from './files.controller';
import { FileUploadService } from './services/file-upload.service';
import { FileStorageService } from './services/file-storage.service';
import { FileCompressionService } from './services/file-compression.service';
import { FileSecurityService } from './services/file-security.service';
import { FileAttachmentService } from './services/file-attachment.service';
import { FileVersioningService } from './services/file-versioning.service';

@Module({
  imports: [ConfigModule],
  controllers: [FilesController],
  providers: [
    FileUploadService,
    FileStorageService,
    FileCompressionService,
    FileSecurityService,
    FileAttachmentService,
    FileVersioningService,
  ],
  exports: [
    FileUploadService,
    FileStorageService,
    FileCompressionService,
    FileSecurityService,
    FileAttachmentService,
    FileVersioningService,
  ],
})
export class FilesModule {}
