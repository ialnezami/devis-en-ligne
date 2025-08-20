import { Module } from '@nestjs/common';
import { PDFService } from './pdf.service';
import { PDFController } from './pdf.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [PDFController],
  providers: [PDFService],
  exports: [PDFService],
})
export class PDFModule {}
