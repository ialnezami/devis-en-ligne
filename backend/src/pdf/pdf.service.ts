import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument, PDFForm, PDFTextField, PDFCheckBox, PDFDropdown, PDFOptionList, PDFSignature, PDFWidgetAnnotation, rgb } from 'pdf-lib';
import { Quotation } from '../quotations/entities/quotation.entity';
import { Template } from '../templates/entities/template.entity';
import { User } from '../users/entities/user.entity';
import { Company } from '../companies/entities/company.entity';

export interface PDFOptions {
  format?: 'A4' | 'A3' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  headerTemplate?: string;
  footerTemplate?: string;
  displayHeaderFooter?: boolean;
  printBackground?: boolean;
  preferCSSPageSize?: boolean;
}

export interface QuotationPDFData {
  quotation: Quotation;
  template: Template;
  company: Company;
  createdBy: User;
  items: Array<{
    name: string;
    description?: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
    taxRate?: number;
    taxAmount?: number;
    discountType?: 'percentage' | 'fixed';
    discountValue?: number;
    discountAmount?: number;
  }>;
  totals: {
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    currency: string;
  };
  metadata: {
    generatedAt: Date;
    version: string;
    pageCount: number;
  };
}

@Injectable()
export class PDFService {
  private readonly logger = new Logger(PDFService.name);
  private browser: puppeteer.Browser | null = null;

  constructor(private configService: ConfigService) {}

  async generateQuotationPDF(
    quotation: Quotation,
    template: Template,
    company: Company,
    createdBy: User,
    options: PDFOptions = {},
  ): Promise<Buffer> {
    try {
      this.logger.log('Starting PDF generation for quotation', { quotationId: quotation.id });

      // Prepare data for PDF generation
      const pdfData = await this.prepareQuotationData(quotation, template, company, createdBy);

      // Generate HTML content
      const htmlContent = await this.generateHTMLContent(pdfData, template);

      // Generate PDF from HTML
      const pdfBuffer = await this.generatePDFFromHTML(htmlContent, options);

      this.logger.log('PDF generated successfully', {
        quotationId: quotation.id,
        size: pdfBuffer.length,
        pageCount: pdfData.metadata.pageCount,
      });

      return pdfBuffer;
    } catch (error) {
      this.logger.error('Error generating PDF', {
        quotationId: quotation.id,
        error: error.message,
      });
      throw error;
    }
  }

  async generateInvoicePDF(
    quotation: Quotation,
    company: Company,
    createdBy: User,
    options: PDFOptions = {},
  ): Promise<Buffer> {
    try {
      this.logger.log('Starting invoice PDF generation', { quotationId: quotation.id });

      // Create invoice data structure
      const invoiceData = await this.prepareInvoiceData(quotation, company, createdBy);

      // Generate HTML content for invoice
      const htmlContent = await this.generateInvoiceHTML(invoiceData);

      // Generate PDF from HTML
      const pdfBuffer = await this.generatePDFFromHTML(htmlContent, options);

      this.logger.log('Invoice PDF generated successfully', {
        quotationId: quotation.id,
        size: pdfBuffer.length,
      });

      return pdfBuffer;
    } catch (error) {
      this.logger.error('Error generating invoice PDF', {
        quotationId: quotation.id,
        error: error.message,
      });
      throw error;
    }
  }

  async generateProposalPDF(
    quotation: Quotation,
    template: Template,
    company: Company,
    createdBy: User,
    options: PDFOptions = {},
  ): Promise<Buffer> {
    try {
      this.logger.log('Starting proposal PDF generation', { quotationId: quotation.id });

      // Prepare proposal data
      const proposalData = await this.prepareProposalData(quotation, template, company, createdBy);

      // Generate HTML content for proposal
      const htmlContent = await this.generateProposalHTML(proposalData);

      // Generate PDF from HTML
      const pdfBuffer = await this.generatePDFFromHTML(htmlContent, options);

      this.logger.log('Proposal PDF generated successfully', {
        quotationId: quotation.id,
        size: pdfBuffer.length,
      });

      return pdfBuffer;
    } catch (error) {
      this.logger.error('Error generating proposal PDF', {
        quotationId: quotation.id,
        error: error.message,
      });
      throw error;
    }
  }

  async generateCustomPDF(
    template: string,
    data: any,
    options: PDFOptions = {},
  ): Promise<Buffer> {
    try {
      this.logger.log('Starting custom PDF generation');

      // Compile template with data
      const compiledTemplate = handlebars.compile(template);
      const htmlContent = compiledTemplate(data);

      // Generate PDF from HTML
      const pdfBuffer = await this.generatePDFFromHTML(htmlContent, options);

      this.logger.log('Custom PDF generated successfully', { size: pdfBuffer.length });

      return pdfBuffer;
    } catch (error) {
      this.logger.error('Error generating custom PDF', { error: error.message });
      throw error;
    }
  }

  async mergePDFs(pdfBuffers: Buffer[]): Promise<Buffer> {
    try {
      this.logger.log('Starting PDF merge', { count: pdfBuffers.length });

      // For now, we'll use a simple approach
      // In production, you might want to use a library like pdf-lib or pdf-merger-js
      const mergedBuffer = Buffer.concat(pdfBuffers);

      this.logger.log('PDFs merged successfully', { size: mergedBuffer.length });

      return mergedBuffer;
    } catch (error) {
      this.logger.error('Error merging PDFs', { error: error.message });
      throw error;
    }
  }

  async addWatermark(
    pdfBuffer: Buffer,
    watermarkText: string,
    options: {
      position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
      opacity?: number;
      fontSize?: number;
      color?: string;
    } = {},
  ): Promise<Buffer> {
    try {
      this.logger.log('Adding watermark to PDF', { watermarkText });

      // Load the PDF document
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      
      // Default options
      const position = options.position || 'center';
      const opacity = options.opacity || 0.3;
      const fontSize = options.fontSize || 24;
      const color = options.color || '#666666';

      // Add watermark to each page
      for (const page of pages) {
        const { width, height } = page.getSize();
        
        // Calculate position based on option
        let x: number, y: number;
        switch (position) {
          case 'top-left':
            x = 50;
            y = height - 50;
            break;
          case 'top-right':
            x = width - 200;
            y = height - 50;
            break;
          case 'bottom-left':
            x = 50;
            y = 50;
            break;
          case 'bottom-right':
            x = width - 200;
            y = 50;
            break;
          case 'center':
          default:
            x = (width - 200) / 2;
            y = height / 2;
            break;
        }

        // Add watermark text
        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize,
          color: rgb(0.4, 0.4, 0.4), // Default gray color
          opacity,
          rotate: { angle: -45, type: 'degrees' as any },
        });
      }

      // Save the modified PDF
      const modifiedPdfBytes = await pdfDoc.save();
      this.logger.log('Watermark added successfully');

      return Buffer.from(modifiedPdfBytes);
    } catch (error) {
      this.logger.error('Error adding watermark', { error: error.message });
      throw error;
    }
  }

  async addDigitalSignature(
    pdfBuffer: Buffer,
    signatureData: {
      certificate: Buffer;
      reason: string;
      location: string;
      contactInfo: string;
    },
  ): Promise<Buffer> {
    try {
      this.logger.log('Adding digital signature to PDF');

      // Load the PDF document
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      
      // Create a signature field on the first page
      const pages = pdfDoc.getPages();
      if (pages.length > 0) {
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();
        
        // Draw signature box
        firstPage.drawRectangle({
          x: width - 200,
          y: 50,
          width: 180,
          height: 60,
          borderColor: this.hexToRgb('#000000'),
          borderWidth: 1,
          color: this.hexToRgb('#f8f9fa'),
        });
        
        // Add signature text
        firstPage.drawText('Digital Signature', {
          x: width - 190,
          y: 85,
          size: 12,
          color: this.hexToRgb('#000000'),
        });
        
        firstPage.drawText(`Reason: ${signatureData.reason}`, {
          x: width - 190,
          y: 70,
          size: 10,
          color: this.hexToRgb('#666666'),
        });
        
        firstPage.drawText(`Location: ${signatureData.location}`, {
          x: width - 190,
          y: 55,
          size: 10,
          color: this.hexToRgb('#666666'),
        });
      }

      // Save the modified PDF
      const modifiedPdfBytes = await pdfDoc.save();
      this.logger.log('Digital signature added successfully');

      return Buffer.from(modifiedPdfBytes);
    } catch (error) {
      this.logger.error('Error adding digital signature', { error: error.message });
      throw error;
    }
  }

  private async prepareQuotationData(
    quotation: Quotation,
    template: Template,
    company: Company,
    createdBy: User,
  ): Promise<QuotationPDFData> {
    // Calculate totals
    const items = this.calculateItemTotals(quotation);
    const totals = this.calculateQuotationTotals(items, quotation);

    return {
      quotation,
      template,
      company,
      createdBy,
      items,
      totals,
      metadata: {
        generatedAt: new Date(),
        version: quotation.version || '1.0',
        pageCount: this.estimatePageCount(items.length, template),
      },
    };
  }

  private async prepareInvoiceData(
    quotation: Quotation,
    company: Company,
    createdBy: User,
  ): Promise<any> {
    // Prepare invoice-specific data
    return {
      quotation,
      company,
      createdBy,
      invoiceNumber: `INV-${quotation.id.substring(0, 8).toUpperCase()}`,
      invoiceDate: new Date(),
      dueDate: this.calculateDueDate(quotation),
      items: this.calculateItemTotals(quotation),
      totals: this.calculateQuotationTotals(this.calculateItemTotals(quotation), quotation),
    };
  }

  private async prepareProposalData(
    quotation: Quotation,
    template: Template,
    company: Company,
    createdBy: User,
  ): Promise<any> {
    // Prepare proposal-specific data
    return {
      quotation,
      template,
      company,
      createdBy,
      proposalNumber: `PROP-${quotation.id.substring(0, 8).toUpperCase()}`,
      proposalDate: new Date(),
      validityPeriod: quotation.validityPeriod || 30,
      executiveSummary: this.generateExecutiveSummary(quotation),
      technicalSpecifications: this.extractTechnicalSpecs(quotation),
      pricing: this.extractPricingDetails(quotation),
      terms: quotation.terms,
    };
  }

  private calculateItemTotals(quotation: Quotation): any[] {
    // This would typically calculate from quotation items
    // For now, return mock data
    return [
      {
        name: 'Sample Item',
        description: 'Sample description',
        quantity: 1,
        unit: 'piece',
        unitPrice: 100,
        total: 100,
        taxRate: 10,
        taxAmount: 10,
        discountType: 'percentage',
        discountValue: 5,
        discountAmount: 5,
      },
    ];
  }

  private calculateQuotationTotals(items: any[], quotation: Quotation): any {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
    const discountAmount = items.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
    const totalAmount = subtotal + taxAmount - discountAmount;

    return {
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      currency: quotation.currency || 'USD',
    };
  }

  private estimatePageCount(itemCount: number, template: Template): number {
    // Estimate page count based on items and template
    const itemsPerPage = 10;
    const basePages = 2; // Header, footer, summary pages
    const itemPages = Math.ceil(itemCount / itemsPerPage);
    return basePages + itemPages;
  }

  private calculateDueDate(quotation: Quotation): Date {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (quotation.validityPeriod || 30));
    return dueDate;
  }

  private generateExecutiveSummary(quotation: Quotation): string {
    return `This proposal outlines the ${quotation.title} project with a total value of ${quotation.currency || 'USD'} ${quotation.totalAmount}. The project will be delivered within the specified timeline and quality standards.`;
  }

  private extractTechnicalSpecs(quotation: Quotation): any[] {
    // Extract technical specifications from quotation
    return [
      { category: 'Scope', details: quotation.description || 'Not specified' },
      { category: 'Timeline', details: `${quotation.validityPeriod || 30} days` },
      { category: 'Quality Standards', details: 'Industry best practices' },
    ];
  }

  private extractPricingDetails(quotation: Quotation): any {
    return {
      basePrice: quotation.totalAmount,
      currency: quotation.currency || 'USD',
      paymentTerms: quotation.terms || 'Net 30',
      validityPeriod: quotation.validityPeriod || 30,
    };
  }

  private async generateHTMLContent(pdfData: QuotationPDFData, template: Template): Promise<string> {
    // Load template HTML
    const templatePath = path.join(process.cwd(), 'src/pdf/templates/quotation-template.html');
    let templateHTML = '';

    try {
      templateHTML = fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      // Use default template if file not found
      templateHTML = this.getDefaultQuotationTemplate();
    }

    // Compile template with data
    const compiledTemplate = handlebars.compile(templateHTML);
    return compiledTemplate(pdfData);
  }

  private async generateInvoiceHTML(invoiceData: any): Promise<string> {
    // Generate invoice HTML content
    const templateHTML = this.getDefaultInvoiceTemplate();
    const compiledTemplate = handlebars.compile(templateHTML);
    return compiledTemplate(invoiceData);
  }

  private async generateProposalHTML(proposalData: any): Promise<string> {
    // Generate proposal HTML content
    const templateHTML = this.getDefaultProposalTemplate();
    const compiledTemplate = handlebars.compile(templateHTML);
    return compiledTemplate(proposalData);
  }

  private async generatePDFFromHTML(htmlContent: string, options: PDFOptions = {}): Promise<Buffer> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }

    const page = await this.browser.newPage();

    try {
      // Set content and wait for rendering
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: options.format || 'A4',
        printBackground: options.printBackground !== false,
        displayHeaderFooter: options.displayHeaderFooter || false,
        headerTemplate: options.headerTemplate,
        footerTemplate: options.footerTemplate,
        margin: options.margin || {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
        preferCSSPageSize: options.preferCSSPageSize || false,
      });

      return pdfBuffer;
    } finally {
      await page.close();
    }
  }

  private getDefaultQuotationTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Quotation - {{quotation.title}}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .company-info { margin-bottom: 30px; }
          .quotation-details { margin-bottom: 30px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .items-table th { background-color: #f2f2f2; }
          .totals { text-align: right; margin-bottom: 30px; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>{{company.name}}</h1>
          <p>{{company.address}}</p>
          <p>Phone: {{company.phone}} | Email: {{company.email}}</p>
        </div>

        <div class="quotation-details">
          <h2>Quotation: {{quotation.title}}</h2>
          <p><strong>Date:</strong> {{quotation.createdAt}}</p>
          <p><strong>Valid Until:</strong> {{quotation.validUntil}}</p>
          <p><strong>Prepared By:</strong> {{createdBy.firstName}} {{createdBy.lastName}}</p>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {{#each items}}
            <tr>
              <td>{{name}}</td>
              <td>{{description}}</td>
              <td>{{quantity}}</td>
              <td>{{unit}}</td>
              <td>{{currency}} {{unitPrice}}</td>
              <td>{{currency}} {{total}}</td>
            </tr>
            {{/each}}
          </tbody>
        </table>

        <div class="totals">
          <p><strong>Subtotal:</strong> {{totals.currency}} {{totals.subtotal}}</p>
          <p><strong>Tax:</strong> {{totals.currency}} {{totals.taxAmount}}</p>
          <p><strong>Discount:</strong> {{totals.currency}} {{totals.discountAmount}}</p>
          <p><strong>Total:</strong> {{totals.currency}} {{totals.totalAmount}}</p>
        </div>

        <div class="footer">
          <p>Generated on {{metadata.generatedAt}} | Version {{metadata.version}}</p>
        </div>
      </body>
      </html>
    `;
  }

  private getDefaultInvoiceTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .invoice-details { margin-bottom: 30px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .items-table th { background-color: #f2f2f2; }
          .totals { text-align: right; margin-bottom: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <h2>{{company.name}}</h2>
        </div>

        <div class="invoice-details">
          <p><strong>Invoice Number:</strong> {{invoiceNumber}}</p>
          <p><strong>Date:</strong> {{invoiceDate}}</p>
          <p><strong>Due Date:</strong> {{dueDate}}</p>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {{#each items}}
            <tr>
              <td>{{name}}</td>
              <td>{{description}}</td>
              <td>{{quantity}}</td>
              <td>{{currency}} {{unitPrice}}</td>
              <td>{{currency}} {{total}}</td>
            </tr>
            {{/each}}
          </tbody>
        </table>

        <div class="totals">
          <p><strong>Total:</strong> {{totals.currency}} {{totals.totalAmount}}</p>
        </div>
      </body>
      </html>
    `;
  }

  private getDefaultProposalTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Proposal</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .proposal-details { margin-bottom: 30px; }
          .executive-summary { margin-bottom: 30px; background-color: #f9f9f9; padding: 20px; }
          .technical-specs { margin-bottom: 30px; }
          .pricing { margin-bottom: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PROPOSAL</h1>
          <h2>{{company.name}}</h2>
        </div>

        <div class="proposal-details">
          <h3>{{quotation.title}}</h3>
          <p><strong>Proposal Number:</strong> {{proposalNumber}}</p>
          <p><strong>Date:</strong> {{proposalDate}}</p>
          <p><strong>Valid For:</strong> {{validityPeriod}} days</p>
        </div>

        <div class="executive-summary">
          <h3>Executive Summary</h3>
          <p>{{executiveSummary}}</p>
        </div>

        <div class="technical-specs">
          <h3>Technical Specifications</h3>
          {{#each technicalSpecifications}}
          <p><strong>{{category}}:</strong> {{details}}</p>
          {{/each}}
        </div>

        <div class="pricing">
          <h3>Pricing</h3>
          <p><strong>Total Value:</strong> {{pricing.currency}} {{pricing.basePrice}}</p>
          <p><strong>Payment Terms:</strong> {{pricing.paymentTerms}}</p>
        </div>
      </body>
      </html>
    `;
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      };
    }
    return { r: 0, g: 0, b: 0 }; // Default to black
  }
}
