import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
  HttpStatus,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { PDFService, PDFOptions } from './pdf.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { Quotation } from '../quotations/entities/quotation.entity';
import { Template } from '../templates/entities/template.entity';
import { Company } from '../companies/entities/company.entity';

export interface GeneratePDFDto {
  quotationId: string;
  templateId?: string;
  documentType: 'quotation' | 'invoice' | 'proposal';
  options?: PDFOptions;
  watermark?: string;
  digitalSignature?: {
    certificate: string;
    reason: string;
    location: string;
    contactInfo: string;
  };
}

export interface CustomPDFDto {
  template: string;
  data: any;
  options?: PDFOptions;
  filename?: string;
}

@ApiTags('pdf')
@Controller('pdf')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PDFController {
  constructor(private readonly pdfService: PDFService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate PDF document from quotation' })
  @ApiResponse({
    status: 201,
    description: 'PDF generated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        filename: { type: 'string' },
        size: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Quotation or template not found' })
  async generatePDF(
    @Body() generatePDFDto: GeneratePDFDto,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    try {
      // This would typically fetch quotation, template, and company data
      // For now, we'll use mock data
      const quotation = await this.getMockQuotation(generatePDFDto.quotationId);
      const template = await this.getMockTemplate(generatePDFDto.templateId);
      const company = await this.getMockCompany();

      let pdfBuffer: Buffer;

      switch (generatePDFDto.documentType) {
        case 'quotation':
          pdfBuffer = await this.pdfService.generateQuotationPDF(
            quotation,
            template,
            company,
            user,
            generatePDFDto.options,
          );
          break;
        case 'invoice':
          pdfBuffer = await this.pdfService.generateInvoicePDF(
            quotation,
            company,
            user,
            generatePDFDto.options,
          );
          break;
        case 'proposal':
          pdfBuffer = await this.pdfService.generateProposalPDF(
            quotation,
            template,
            company,
            user,
            generatePDFDto.options,
          );
          break;
        default:
          throw new BadRequestException('Invalid document type');
      }

      // Add watermark if requested
      if (generatePDFDto.watermark) {
        pdfBuffer = await this.pdfService.addWatermark(pdfBuffer, generatePDFDto.watermark);
      }

      // Add digital signature if requested
      if (generatePDFDto.digitalSignature) {
        pdfBuffer = await this.pdfService.addDigitalSignature(pdfBuffer, {
          certificate: Buffer.from(generatePDFDto.digitalSignature.certificate, 'base64'),
          reason: generatePDFDto.digitalSignature.reason,
          location: generatePDFDto.digitalSignature.location,
          contactInfo: generatePDFDto.digitalSignature.contactInfo,
        });
      }

      // Set response headers
      const filename = `${generatePDFDto.documentType}_${quotation.id}_${Date.now()}.pdf`;
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length,
      });

      // Send PDF buffer
      res.send(pdfBuffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error generating PDF',
        error: error.message,
      });
    }
  }

  @Post('custom')
  @ApiOperation({ summary: 'Generate custom PDF from template and data' })
  @ApiResponse({
    status: 201,
    description: 'Custom PDF generated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        filename: { type: 'string' },
        size: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async generateCustomPDF(
    @Body() customPDFDto: CustomPDFDto,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    try {
      const pdfBuffer = await this.pdfService.generateCustomPDF(
        customPDFDto.template,
        customPDFDto.data,
        customPDFDto.options,
      );

      const filename = customPDFDto.filename || `custom_${Date.now()}.pdf`;
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length,
      });

      res.send(pdfBuffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error generating custom PDF',
        error: error.message,
      });
    }
  }

  @Post('merge')
  @ApiOperation({ summary: 'Merge multiple PDFs into one' })
  @ApiResponse({
    status: 201,
    description: 'PDFs merged successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        filename: { type: 'string' },
        size: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async mergePDFs(
    @Body() body: { pdfBuffers: string[] }, // Base64 encoded PDFs
    @Res() res: Response,
  ) {
    try {
      const pdfBuffers = body.pdfBuffers.map(base64 => Buffer.from(base64, 'base64'));
      const mergedBuffer = await this.pdfService.mergePDFs(pdfBuffers);

      const filename = `merged_${Date.now()}.pdf`;
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': mergedBuffer.length,
      });

      res.send(mergedBuffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error merging PDFs',
        error: error.message,
      });
    }
  }

  @Get('preview/:quotationId')
  @ApiOperation({ summary: 'Preview PDF without downloading' })
  @ApiQuery({ name: 'documentType', enum: ['quotation', 'invoice', 'proposal'] })
  @ApiQuery({ name: 'templateId', required: false })
  @ApiResponse({
    status: 200,
    description: 'PDF preview generated successfully',
  })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  async previewPDF(
    @Param('quotationId', ParseUUIDPipe) quotationId: string,
    @Query('documentType') documentType: 'quotation' | 'invoice' | 'proposal' = 'quotation',
    @Query('templateId') templateId?: string,
    @CurrentUser() user?: User,
  ) {
    // This would generate a preview version of the PDF
    // For now, return a success message
    return {
      message: 'PDF preview generated successfully',
      quotationId,
      documentType,
      templateId,
      previewUrl: `/api/pdf/preview/${quotationId}?documentType=${documentType}`,
    };
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get available PDF templates' })
  @ApiResponse({
    status: 200,
    description: 'Templates retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string' },
          description: { type: 'string' },
        },
      },
    },
  })
  async getTemplates() {
    // This would return available PDF templates
    return [
      {
        id: 'default-quotation',
        name: 'Default Quotation Template',
        type: 'quotation',
        description: 'Standard quotation template with company branding',
      },
      {
        id: 'default-invoice',
        name: 'Default Invoice Template',
        type: 'invoice',
        description: 'Professional invoice template',
      },
      {
        id: 'default-proposal',
        name: 'Default Proposal Template',
        type: 'proposal',
        description: 'Comprehensive proposal template',
      },
    ];
  }

  @Get('options')
  @ApiOperation({ summary: 'Get available PDF generation options' })
  @ApiResponse({
    status: 200,
    description: 'Options retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        formats: { type: 'array', items: { type: 'string' } },
        orientations: { type: 'array', items: { type: 'string' } },
        marginPresets: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  async getPDFOptions() {
    return {
      formats: ['A4', 'A3', 'Letter', 'Legal'],
      orientations: ['portrait', 'landscape'],
      marginPresets: [
        { name: 'Standard', value: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' } },
        { name: 'Narrow', value: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' } },
        { name: 'Wide', value: { top: '30mm', right: '30mm', bottom: '30mm', left: '30mm' } },
      ],
    };
  }

  // Mock data methods for demonstration
  private async getMockQuotation(id: string): Promise<Quotation> {
    return {
      id,
      title: 'Sample Quotation',
      description: 'This is a sample quotation for demonstration purposes',
      totalAmount: 1500,
      status: 'approved' as any,
      priority: 'medium' as any,
      version: '1.0',
      currency: 'USD',
      validityPeriod: 30,
      terms: 'Net 30 days',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Quotation;
  }

  private async getMockTemplate(id?: string): Promise<Template> {
    return {
      id: id || 'default-template',
      name: 'Default Template',
      description: 'Default quotation template',
      type: 'quotation' as any,
      status: 'active' as any,
      visibility: 'company' as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Template;
  }

  private async getMockCompany(): Promise<Company> {
    return {
      id: 'company-1',
      name: 'Sample Company Ltd',
      description: 'A sample company for demonstration',
      address: '123 Business Street, City, Country',
      phone: '+1-234-567-8900',
      email: 'info@samplecompany.com',
      website: 'https://samplecompany.com',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Company;
  }
}
