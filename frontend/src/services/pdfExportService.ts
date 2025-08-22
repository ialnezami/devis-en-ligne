import axios from 'axios';

export interface PDFExportOptions {
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
  watermark?: string;
  digitalSignature?: {
    certificate: string;
    reason: string;
    location: string;
    contactInfo: string;
  };
  branding?: {
    logo?: string;
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
    fonts?: {
      heading?: string;
      body?: string;
    };
  };
  security?: {
    password?: string;
    permissions?: {
      print?: boolean;
      copy?: boolean;
      modify?: boolean;
      annotate?: boolean;
    };
    encryption?: 'AES-128' | 'AES-256';
  };
}

export interface QuotationPDFData {
  quotationId: string;
  templateId?: string;
  documentType: 'quotation' | 'invoice' | 'proposal';
  options?: PDFExportOptions;
}

export interface BatchExportRequest {
  quotationIds: string[];
  templateId?: string;
  documentType: 'quotation' | 'invoice' | 'proposal';
  options?: PDFExportOptions;
  outputFormat?: 'individual' | 'combined' | 'zip';
}

export interface PDFExportResult {
  success: boolean;
  filename: string;
  size: number;
  url?: string;
  error?: string;
  metadata?: {
    pageCount: number;
    generatedAt: Date;
    version: string;
    template: string;
  };
}

export interface ExportHistoryItem {
  id: string;
  quotationId: string;
  filename: string;
  size: number;
  status: 'completed' | 'failed' | 'processing';
  createdAt: Date;
  completedAt?: Date;
  error?: string;
  metadata?: {
    pageCount: number;
    template: string;
    options: PDFExportOptions;
  };
}

class PDFExportService {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
    this.apiKey = localStorage.getItem('authToken') || '';
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Generate a single PDF document
   */
  async generatePDF(data: QuotationPDFData): Promise<PDFExportResult> {
    try {
      const response = await axios.post(
        `${this.baseURL}/pdf/generate`,
        data,
        {
          headers: this.getHeaders(),
          responseType: 'blob',
        }
      );

      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Extract filename from response headers
      const contentDisposition = response.headers['content-disposition'];
      const filename = this.extractFilename(contentDisposition) || `document_${Date.now()}.pdf`;

      // Get file size
      const size = blob.size;

      return {
        success: true,
        filename,
        size,
        url,
        metadata: {
          pageCount: this.extractPageCount(response.headers),
          generatedAt: new Date(),
          version: '1.0',
          template: data.templateId || 'default',
        },
      };
    } catch (error) {
      console.error('PDF generation failed:', error);
      return {
        success: false,
        filename: '',
        size: 0,
        error: error instanceof Error ? error.message : 'PDF generation failed',
      };
    }
  }

  /**
   * Generate multiple PDFs in batch
   */
  async batchExport(request: BatchExportRequest): Promise<PDFExportResult[]> {
    try {
      const response = await axios.post(
        `${this.baseURL}/pdf/batch-export`,
        request,
        {
          headers: this.getHeaders(),
          responseType: 'blob',
        }
      );

      if (request.outputFormat === 'zip') {
        // Handle ZIP file response
        const blob = new Blob([response.data], { type: 'application/zip' });
        const url = window.URL.createObjectURL(blob);
        
        return [{
          success: true,
          filename: `batch_export_${Date.now()}.zip`,
          size: blob.size,
          url,
        }];
      } else {
        // Handle individual PDFs
        const results: PDFExportResult[] = [];
        for (const quotationId of request.quotationIds) {
          const individualResult = await this.generatePDF({
            quotationId,
            templateId: request.templateId,
            documentType: request.documentType,
            options: request.options,
          });
          results.push(individualResult);
        }
        return results;
      }
    } catch (error) {
      console.error('Batch export failed:', error);
      return request.quotationIds.map(() => ({
        success: false,
        filename: '',
        size: 0,
        error: error instanceof Error ? error.message : 'Batch export failed',
      }));
    }
  }

  /**
   * Preview PDF without downloading
   */
  async previewPDF(data: QuotationPDFData): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseURL}/pdf/preview`,
        data,
        {
          headers: this.getHeaders(),
          responseType: 'blob',
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      return window.URL.createObjectURL(blob);
    } catch (error) {
      console.error('PDF preview failed:', error);
      throw new Error('PDF preview failed');
    }
  }

  /**
   * Get export history
   */
  async getExportHistory(quotationId?: string): Promise<ExportHistoryItem[]> {
    try {
      const params = quotationId ? { quotationId } : {};
      const response = await axios.get(
        `${this.baseURL}/pdf/export-history`,
        {
          headers: this.getHeaders(),
          params,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to fetch export history:', error);
      return [];
    }
  }

  /**
   * Download PDF from URL
   */
  downloadPDF(url: string, filename: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    window.URL.revokeObjectURL(url);
  }

  /**
   * Open PDF in new tab
   */
  openPDFInNewTab(url: string): void {
    window.open(url, '_blank');
  }

  /**
   * Print PDF
   */
  async printPDF(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const printUrl = window.URL.createObjectURL(blob);
      
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = printUrl;
      
      document.body.appendChild(iframe);
      iframe.contentWindow?.print();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(iframe);
        window.URL.revokeObjectURL(printUrl);
      }, 1000);
    } catch (error) {
      console.error('Print failed:', error);
      throw new Error('Print failed');
    }
  }

  /**
   * Validate PDF export options
   */
  validateExportOptions(options: PDFExportOptions): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate format
    if (options.format && !['A4', 'A3', 'Letter', 'Legal'].includes(options.format)) {
      errors.push('Invalid PDF format');
    }

    // Validate orientation
    if (options.orientation && !['portrait', 'landscape'].includes(options.orientation)) {
      errors.push('Invalid orientation');
    }

    // Validate margins
    if (options.margin) {
      const marginValues = Object.values(options.margin);
      if (marginValues.some(value => value && parseFloat(value) < 0)) {
        errors.push('Margins cannot be negative');
      }
    }

    // Validate security options
    if (options.security) {
      if (options.security.password && options.security.password.length < 6) {
        errors.push('Password must be at least 6 characters');
      }
      
      if (options.security.encryption && !['AES-128', 'AES-256'].includes(options.security.encryption)) {
        errors.push('Invalid encryption type');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get available PDF templates
   */
  async getAvailableTemplates(): Promise<Array<{ id: string; name: string; description: string }>> {
    try {
      const response = await axios.get(
        `${this.baseURL}/pdf/templates`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      return [];
    }
  }

  /**
   * Get default export options
   */
  getDefaultExportOptions(): PDFExportOptions {
    return {
      format: 'A4',
      orientation: 'portrait',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
      printBackground: true,
      preferCSSPageSize: true,
      branding: {
        colors: {
          primary: '#2563eb',
          secondary: '#64748b',
          accent: '#f59e0b',
        },
        fonts: {
          heading: 'Arial, sans-serif',
          body: 'Arial, sans-serif',
        },
      },
      security: {
        permissions: {
          print: true,
          copy: true,
          modify: false,
          annotate: false,
        },
      },
    };
  }

  private extractFilename(contentDisposition: string): string | null {
    if (!contentDisposition) return null;
    
    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
    return filenameMatch ? filenameMatch[1] : null;
  }

  private extractPageCount(headers: any): number {
    const pageCountHeader = headers['x-page-count'];
    return pageCountHeader ? parseInt(pageCountHeader, 10) : 1;
  }
}

export const pdfExportService = new PDFExportService();
export default pdfExportService;
