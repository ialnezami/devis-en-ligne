import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

export interface PDFTemplate {
  id: string;
  name: string;
  type: 'quotation' | 'invoice' | 'proposal' | 'custom';
  description?: string;
  htmlContent: string;
  cssContent?: string;
  variables: string[];
  isDefault: boolean;
  isActive: boolean;
  companyId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
  };
}

@Injectable()
export class PDFTemplateService {
  private readonly logger = new Logger(PDFTemplateService.name);
  private readonly templatesPath: string;
  private readonly defaultTemplates: Map<string, PDFTemplate> = new Map();

  constructor(private configService: ConfigService) {
    this.templatesPath = this.configService.get<string>('PDF_TEMPLATES_PATH', './src/pdf/templates');
    this.initializeDefaultTemplates();
  }

  /**
   * Get a template by ID
   */
  async getTemplate(id: string): Promise<PDFTemplate | null> {
    try {
      // Check default templates first
      if (this.defaultTemplates.has(id)) {
        return this.defaultTemplates.get(id)!;
      }

      // Check custom templates
      const customTemplatePath = path.join(this.templatesPath, 'custom', `${id}.json`);
      if (fs.existsSync(customTemplatePath)) {
        const templateData = await fs.promises.readFile(customTemplatePath, 'utf8');
        return JSON.parse(templateData);
      }

      return null;
    } catch (error) {
      this.logger.error('Error retrieving template', { id, error: error.message });
      return null;
    }
  }

  /**
   * Get all templates for a specific type
   */
  async getTemplatesByType(type: string, companyId?: string): Promise<PDFTemplate[]> {
    try {
      const templates: PDFTemplate[] = [];

      // Add default templates
      for (const template of this.defaultTemplates.values()) {
        if (template.type === type) {
          templates.push(template);
        }
      }

      // Add custom templates
      const customTemplatesDir = path.join(this.templatesPath, 'custom');
      if (fs.existsSync(customTemplatesDir)) {
        const files = await fs.promises.readdir(customTemplatesDir);
        
        for (const file of files) {
          if (file.endsWith('.json')) {
            const templatePath = path.join(customTemplatesDir, file);
            const templateData = await fs.promises.readFile(templatePath, 'utf8');
            const template: PDFTemplate = JSON.parse(templateData);
            
            if (template.type === type && template.isActive) {
              if (!companyId || template.companyId === companyId) {
                templates.push(template);
              }
            }
          }
        }
      }

      return templates;
    } catch (error) {
      this.logger.error('Error retrieving templates by type', { type, error: error.message });
      return [];
    }
  }

  /**
   * Create a custom template
   */
  async createTemplate(template: Omit<PDFTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<PDFTemplate> {
    try {
      const templateId = `custom_${Date.now()}`;
      const now = new Date();

      const newTemplate: PDFTemplate = {
        ...template,
        id: templateId,
        createdAt: now,
        updatedAt: now,
      };

      // Validate template
      this.validateTemplate(newTemplate);

      // Save template
      const templatePath = path.join(this.templatesPath, 'custom', `${templateId}.json`);
      await this.ensureDirectoryExists(path.dirname(templatePath));
      await fs.promises.writeFile(templatePath, JSON.stringify(newTemplate, null, 2));

      this.logger.log('Custom template created successfully', { id: templateId, name: template.name });

      return newTemplate;
    } catch (error) {
      this.logger.error('Error creating custom template', { error: error.message });
      throw error;
    }
  }

  /**
   * Update a custom template
   */
  async updateTemplate(id: string, updates: Partial<PDFTemplate>): Promise<PDFTemplate | null> {
    try {
      const template = await this.getTemplate(id);
      if (!template) {
        throw new Error(`Template with ID ${id} not found`);
      }

      if (template.isDefault) {
        throw new Error('Cannot modify default templates');
      }

      const updatedTemplate: PDFTemplate = {
        ...template,
        ...updates,
        updatedAt: new Date(),
      };

      // Validate template
      this.validateTemplate(updatedTemplate);

      // Save updated template
      const templatePath = path.join(this.templatesPath, 'custom', `${id}.json`);
      await fs.promises.writeFile(templatePath, JSON.stringify(updatedTemplate, null, 2));

      this.logger.log('Template updated successfully', { id, name: updatedTemplate.name });

      return updatedTemplate;
    } catch (error) {
      this.logger.error('Error updating template', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Delete a custom template
   */
  async deleteTemplate(id: string): Promise<void> {
    try {
      const template = await this.getTemplate(id);
      if (!template) {
        throw new Error(`Template with ID ${id} not found`);
      }

      if (template.isDefault) {
        throw new Error('Cannot delete default templates');
      }

      const templatePath = path.join(this.templatesPath, 'custom', `${id}.json`);
      if (fs.existsSync(templatePath)) {
        await fs.promises.unlink(templatePath);
      }

      this.logger.log('Template deleted successfully', { id, name: template.name });
    } catch (error) {
      this.logger.error('Error deleting template', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Compile a template with data
   */
  async compileTemplate(templateId: string, data: any): Promise<string> {
    try {
      const template = await this.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template with ID ${templateId} not found`);
      }

      // Compile Handlebars template
      const compiledTemplate = handlebars.compile(template.htmlContent);
      let htmlContent = compiledTemplate(data);

      // Apply custom CSS if provided
      if (template.cssContent) {
        const styleTag = `<style>${template.cssContent}</style>`;
        htmlContent = htmlContent.replace('</head>', `${styleTag}\n</head>`);
      }

      return htmlContent;
    } catch (error) {
      this.logger.error('Error compiling template', { templateId, error: error.message });
      throw error;
    }
  }

  /**
   * Get available template variables
   */
  getTemplateVariables(type: string): TemplateVariable[] {
    const baseVariables: TemplateVariable[] = [
      {
        name: 'company',
        type: 'object',
        description: 'Company information',
        required: true,
      },
      {
        name: 'quotation',
        type: 'object',
        description: 'Quotation details',
        required: true,
      },
      {
        name: 'items',
        type: 'array',
        description: 'Quotation items',
        required: true,
      },
      {
        name: 'totals',
        type: 'object',
        description: 'Calculation totals',
        required: true,
      },
      {
        name: 'metadata',
        type: 'object',
        description: 'Generation metadata',
        required: false,
      },
    ];

    // Add type-specific variables
    switch (type) {
      case 'invoice':
        baseVariables.push(
          {
            name: 'invoiceNumber',
            type: 'string',
            description: 'Invoice number',
            required: true,
          },
          {
            name: 'dueDate',
            type: 'date',
            description: 'Payment due date',
            required: true,
          }
        );
        break;

      case 'proposal':
        baseVariables.push(
          {
            name: 'executiveSummary',
            type: 'string',
            description: 'Executive summary',
            required: false,
          },
          {
            name: 'technicalSpecifications',
            type: 'array',
            description: 'Technical specifications',
            required: false,
          }
        );
        break;
    }

    return baseVariables;
  }

  /**
   * Validate template data against variables
   */
  validateTemplateData(templateId: string, data: any): { isValid: boolean; errors: string[] } {
    try {
      const template = this.defaultTemplates.get(templateId);
      if (!template) {
        return { isValid: false, errors: ['Template not found'] };
      }

      const variables = this.getTemplateVariables(template.type);
      const errors: string[] = [];

      for (const variable of variables) {
        if (variable.required && !data[variable.name]) {
          errors.push(`Required variable '${variable.name}' is missing`);
        }

        if (data[variable.name] && variable.validation) {
          const value = data[variable.name];
          
          if (variable.validation.min !== undefined && value < variable.validation.min) {
            errors.push(`Variable '${variable.name}' value ${value} is below minimum ${variable.validation.min}`);
          }

          if (variable.validation.max !== undefined && value > variable.validation.max) {
            errors.push(`Variable '${variable.name}' value ${value} is above maximum ${variable.validation.max}`);
          }

          if (variable.validation.pattern && !new RegExp(variable.validation.pattern).test(value)) {
            errors.push(`Variable '${variable.name}' value does not match required pattern`);
          }

          if (variable.validation.enum && !variable.validation.enum.includes(value)) {
            errors.push(`Variable '${variable.name}' value must be one of: ${variable.validation.enum.join(', ')}`);
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      return { isValid: false, errors: [error.message] };
    }
  }

  // Private methods

  private initializeDefaultTemplates(): void {
    // Quotation template
    this.defaultTemplates.set('quotation-default', {
      id: 'quotation-default',
      name: 'Default Quotation Template',
      type: 'quotation',
      description: 'Standard quotation template with company branding',
      htmlContent: this.getDefaultQuotationHTML(),
      variables: ['company', 'quotation', 'items', 'totals', 'metadata'],
      isDefault: true,
      isActive: true,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Invoice template
    this.defaultTemplates.set('invoice-default', {
      id: 'invoice-default',
      name: 'Default Invoice Template',
      type: 'invoice',
      description: 'Professional invoice template',
      htmlContent: this.getDefaultInvoiceHTML(),
      variables: ['company', 'quotation', 'items', 'totals', 'invoiceNumber', 'dueDate'],
      isDefault: true,
      isActive: true,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Proposal template
    this.defaultTemplates.set('proposal-default', {
      id: 'proposal-default',
      name: 'Default Proposal Template',
      type: 'proposal',
      description: 'Comprehensive proposal template',
      htmlContent: this.getDefaultProposalHTML(),
      variables: ['company', 'quotation', 'executiveSummary', 'technicalSpecifications', 'pricing'],
      isDefault: true,
      isActive: true,
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private validateTemplate(template: PDFTemplate): void {
    if (!template.name || template.name.trim().length === 0) {
      throw new Error('Template name is required');
    }

    if (!template.htmlContent || template.htmlContent.trim().length === 0) {
      throw new Error('Template HTML content is required');
    }

    if (!template.type || !['quotation', 'invoice', 'proposal', 'custom'].includes(template.type)) {
      throw new Error('Invalid template type');
    }

    // Validate HTML content
    try {
      handlebars.compile(template.htmlContent);
    } catch (error) {
      throw new Error(`Invalid Handlebars template: ${error.message}`);
    }
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    if (!fs.existsSync(dirPath)) {
      await fs.promises.mkdir(dirPath, { recursive: true });
    }
  }

  private getDefaultQuotationHTML(): string {
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

  private getDefaultInvoiceHTML(): string {
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

  private getDefaultProposalHTML(): string {
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
}
