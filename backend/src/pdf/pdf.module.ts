import { Module } from '@nestjs/common';
import { PDFService } from './pdf.service';
import { PDFController } from './pdf.controller';
import { PDFStorageService } from './pdf-storage.service';
import { PDFTemplateService } from './pdf-template.service';
import { StorageFactoryService } from './services/storage-factory.service';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { S3StorageProvider } from './providers/s3-storage.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [PDFController],
  providers: [PDFService, PDFStorageService, PDFTemplateService],
  exports: [PDFService, PDFStorageService, PDFTemplateService],
})
export class PDFModule {}
