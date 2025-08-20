import { Module } from '@nestjs/common';
import { PDFService } from './pdf.service';
import { PDFController } from './pdf.controller';
import { PDFStorageService } from './pdf-storage.service';
import { PDFTemplateService } from './pdf-template.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [PDFController],
  providers: [PDFService, PDFStorageService, PDFTemplateService],
  exports: [PDFService, PDFStorageService, PDFTemplateService],
})
export class PDFModule {}
