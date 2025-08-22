import axios from 'axios';

export interface QuoteTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  industry: string;
  tags: string[];
  content: string;
  htmlContent: string;
  cssStyles: string;
  variables: TemplateVariable[];
  thumbnail?: string;
  isPublic: boolean;
  isDefault: boolean;
  version: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  rating: number;
  ratingCount: number;
  isActive: boolean;
  metadata: {
    pageSize: 'A4' | 'A3' | 'Letter' | 'Legal';
    orientation: 'portrait' | 'landscape';
    margins: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    headerHeight?: number;
    footerHeight?: number;
  };
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'array';
  label: string;
  description?: string;
  defaultValue?: any;
  required: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    pattern?: string;
    options?: string[];
  };
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  subcategories: TemplateSubcategory[];
  templateCount: number;
  isActive: boolean;
}

export interface TemplateSubcategory {
  id: string;
  name: string;
  description: string;
  templateCount: number;
  isActive: boolean;
}

export interface TemplateVersion {
  id: string;
  templateId: string;
  version: string;
  content: string;
  htmlContent: string;
  cssStyles: string;
  variables: TemplateVariable[];
  changeLog: string;
  createdAt: Date;
  createdBy: string;
  isMajorVersion: boolean;
  previousVersion?: string;
}

export interface TemplateShare {
  id: string;
  templateId: string;
  sharedWith: string;
  sharedBy: string;
  permissions: 'view' | 'edit' | 'use';
  sharedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface TemplateSearchFilters {
  category?: string;
  subcategory?: string;
  industry?: string;
  tags?: string[];
  isPublic?: boolean;
  isDefault?: boolean;
  createdBy?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  rating?: number;
  usageCount?: {
    min: number;
    max: number;
  };
  search?: string;
}

export interface TemplateAnalytics {
  totalTemplates: number;
  totalUsage: number;
  averageRating: number;
  categoryDistribution: {
    category: string;
    count: number;
    percentage: number;
  }[];
  topTemplates: {
    templateId: string;
    templateName: string;
    usageCount: number;
    rating: number;
  }[];
  monthlyUsage: {
    month: string;
    usageCount: number;
  }[];
}

class TemplateManagementService {
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
   * Get all templates with filtering and search
   */
  async getTemplates(filters: TemplateSearchFilters = {}, page = 1, limit = 20): Promise<{
    templates: QuoteTemplate[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/templates`, {
        headers: this.getHeaders(),
        params: {
          ...filters,
          page,
          limit,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      throw error;
    }
  }

  /**
   * Get a single template by ID
   */
  async getTemplate(id: string): Promise<QuoteTemplate> {
    try {
      const response = await axios.get(`${this.baseURL}/templates/${id}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch template:', error);
      throw error;
    }
  }

  /**
   * Create a new template
   */
  async createTemplate(templateData: Partial<QuoteTemplate>): Promise<QuoteTemplate> {
    try {
      const response = await axios.post(`${this.baseURL}/templates`, templateData, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create template:', error);
      throw error;
    }
  }

  /**
   * Update an existing template
   */
  async updateTemplate(id: string, templateData: Partial<QuoteTemplate>): Promise<QuoteTemplate> {
    try {
      const response = await axios.put(`${this.baseURL}/templates/${id}`, templateData, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update template:', error);
      throw error;
    }
  }

  /**
   * Delete a template
   */
  async deleteTemplate(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/templates/${id}`, {
        headers: this.getHeaders(),
      });
    } catch (error) {
      console.error('Failed to delete template:', error);
      throw error;
    }
  }

  /**
   * Duplicate a template
   */
  async duplicateTemplate(id: string, newName: string): Promise<QuoteTemplate> {
    try {
      const response = await axios.post(`${this.baseURL}/templates/${id}/duplicate`, {
        name: newName,
      }, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to duplicate template:', error);
      throw error;
    }
  }

  /**
   * Get template categories
   */
  async getTemplateCategories(): Promise<TemplateCategory[]> {
    try {
      const response = await axios.get(`${this.baseURL}/templates/categories`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch template categories:', error);
      throw error;
    }
  }

  /**
   * Create a new template category
   */
  async createTemplateCategory(categoryData: Partial<TemplateCategory>): Promise<TemplateCategory> {
    try {
      const response = await axios.post(`${this.baseURL}/templates/categories`, categoryData, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create template category:', error);
      throw error;
    }
  }

  /**
   * Update template category
   */
  async updateTemplateCategory(id: string, categoryData: Partial<TemplateCategory>): Promise<TemplateCategory> {
    try {
      const response = await axios.put(`${this.baseURL}/templates/categories/${id}`, categoryData, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update template category:', error);
      throw error;
    }
  }

  /**
   * Delete template category
   */
  async deleteTemplateCategory(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/templates/categories/${id}`, {
        headers: this.getHeaders(),
      });
    } catch (error) {
      console.error('Failed to delete template category:', error);
      throw error;
    }
  }

  /**
   * Get template versions
   */
  async getTemplateVersions(templateId: string): Promise<TemplateVersion[]> {
    try {
      const response = await axios.get(`${this.baseURL}/templates/${templateId}/versions`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch template versions:', error);
      throw error;
    }
  }

  /**
   * Create a new template version
   */
  async createTemplateVersion(templateId: string, versionData: Partial<TemplateVersion>): Promise<TemplateVersion> {
    try {
      const response = await axios.post(`${this.baseURL}/templates/${templateId}/versions`, versionData, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create template version:', error);
      throw error;
    }
  }

  /**
   * Restore template to a specific version
   */
  async restoreTemplateVersion(templateId: string, versionId: string): Promise<QuoteTemplate> {
    try {
      const response = await axios.post(`${this.baseURL}/templates/${templateId}/restore-version`, {
        versionId,
      }, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to restore template version:', error);
      throw error;
    }
  }

  /**
   * Get template shares
   */
  async getTemplateShares(templateId: string): Promise<TemplateShare[]> {
    try {
      const response = await axios.get(`${this.baseURL}/templates/${templateId}/shares`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch template shares:', error);
      throw error;
    }
  }

  /**
   * Share template with user
   */
  async shareTemplate(templateId: string, shareData: Partial<TemplateShare>): Promise<TemplateShare> {
    try {
      const response = await axios.post(`${this.baseURL}/templates/${templateId}/shares`, shareData, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to share template:', error);
      throw error;
    }
  }

  /**
   * Update template share permissions
   */
  async updateTemplateShare(templateId: string, shareId: string, updateData: Partial<TemplateShare>): Promise<TemplateShare> {
    try {
      const response = await axios.put(`${this.baseURL}/templates/${templateId}/shares/${shareId}`, updateData, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update template share:', error);
      throw error;
    }
  }

  /**
   * Remove template share
   */
  async removeTemplateShare(templateId: string, shareId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/templates/${templateId}/shares/${shareId}`, {
        headers: this.getHeaders(),
      });
    } catch (error) {
      console.error('Failed to remove template share:', error);
      throw error;
    }
  }

  /**
   * Get shared templates
   */
  async getSharedTemplates(): Promise<QuoteTemplate[]> {
    try {
      const response = await axios.get(`${this.baseURL}/templates/shared`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch shared templates:', error);
      throw error;
    }
  }

  /**
   * Get public templates
   */
  async getPublicTemplates(page = 1, limit = 20): Promise<{
    templates: QuoteTemplate[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/templates/public`, {
        headers: this.getHeaders(),
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch public templates:', error);
      throw error;
    }
  }

  /**
   * Rate a template
   */
  async rateTemplate(templateId: string, rating: number): Promise<QuoteTemplate> {
    try {
      const response = await axios.post(`${this.baseURL}/templates/${templateId}/rate`, {
        rating,
      }, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to rate template:', error);
      throw error;
    }
  }

  /**
   * Use a template (increment usage count)
   */
  async useTemplate(templateId: string): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/templates/${templateId}/use`, {}, {
        headers: this.getHeaders(),
      });
    } catch (error) {
      console.error('Failed to use template:', error);
      throw error;
    }
  }

  /**
   * Get template analytics
   */
  async getTemplateAnalytics(filters: TemplateSearchFilters = {}): Promise<TemplateAnalytics> {
    try {
      const response = await axios.get(`${this.baseURL}/templates/analytics`, {
        headers: this.getHeaders(),
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch template analytics:', error);
      throw error;
    }
  }

  /**
   * Export templates
   */
  async exportTemplates(filters: TemplateSearchFilters = {}, format: 'json' | 'zip' = 'json'): Promise<Blob> {
    try {
      const response = await axios.get(`${this.baseURL}/templates/export`, {
        headers: this.getHeaders(),
        params: {
          ...filters,
          format,
        },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export templates:', error);
      throw error;
    }
  }

  /**
   * Import templates from file
   */
  async importTemplates(file: File, options: {
    overwrite?: boolean;
    category?: string;
  } = {}): Promise<{
    imported: number;
    errors: string[];
  }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('overwrite', String(options.overwrite || false));
      if (options.category) {
        formData.append('category', options.category);
      }

      const response = await axios.post(`${this.baseURL}/templates/import`, formData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to import templates:', error);
      throw error;
    }
  }

  /**
   * Get template preview HTML
   */
  async getTemplatePreview(templateId: string, variables: Record<string, any> = {}): Promise<{
    html: string;
    css: string;
  }> {
    try {
      const response = await axios.post(`${this.baseURL}/templates/${templateId}/preview`, {
        variables,
      }, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get template preview:', error);
      throw error;
    }
  }

  /**
   * Validate template content
   */
  async validateTemplate(templateData: Partial<QuoteTemplate>): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      const response = await axios.post(`${this.baseURL}/templates/validate`, templateData, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to validate template:', error);
      throw error;
    }
  }

  /**
   * Get available template variables
   */
  async getAvailableVariables(): Promise<{
    system: TemplateVariable[];
    custom: TemplateVariable[];
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/templates/variables`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch available variables:', error);
      throw error;
    }
  }

  /**
   * Bulk operations on templates
   */
  async bulkUpdateTemplates(templateIds: string[], updates: Partial<QuoteTemplate>): Promise<QuoteTemplate[]> {
    try {
      const response = await axios.put(`${this.baseURL}/templates/bulk-update`, {
        templateIds,
        updates,
      }, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk update templates:', error);
      throw error;
    }
  }

  async bulkDeleteTemplates(templateIds: string[]): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/templates/bulk-delete`, {
        headers: this.getHeaders(),
        data: { templateIds },
      });
    } catch (error) {
      console.error('Failed to bulk delete templates:', error);
      throw error;
    }
  }

  async bulkExportTemplates(templateIds: string[], format: 'json' | 'zip' = 'json'): Promise<Blob> {
    try {
      const response = await axios.post(`${this.baseURL}/templates/bulk-export`, {
        templateIds,
        format,
      }, {
        headers: this.getHeaders(),
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk export templates:', error);
      throw error;
    }
  }
}

export const templateManagementService = new TemplateManagementService();
export default templateManagementService;
