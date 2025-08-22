import axios from 'axios';

export interface Quote {
  id: string;
  title: string;
  quotationNumber: string;
  clientName: string;
  clientEmail: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'expired' | 'archived';
  total: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  validUntil: Date;
  version: string;
  templateId: string;
  createdBy: string;
  assignedTo?: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  industry: string;
  estimatedHours?: number;
  actualHours?: number;
  profitMargin?: number;
  notes?: string;
  attachments: string[];
  collaborators: string[];
  lastActivity: Date;
  isArchived: boolean;
  archiveDate?: Date;
  backupId?: string;
}

export interface QuoteSearchFilters {
  status?: string[];
  priority?: string[];
  category?: string[];
  industry?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  assignedTo?: string[];
  tags?: string[];
  search?: string;
  createdBy?: string;
}

export interface QuoteAnalytics {
  totalQuotes: number;
  totalValue: number;
  averageValue: number;
  conversionRate: number;
  statusDistribution: {
    status: string;
    count: number;
    percentage: number;
    value: number;
  }[];
  monthlyTrends: {
    month: string;
    count: number;
    value: number;
  }[];
  topClients: {
    clientName: string;
    quoteCount: number;
    totalValue: number;
  }[];
  performanceMetrics: {
    averageResponseTime: number;
    approvalRate: number;
    rejectionRate: number;
    averageValidUntil: number;
  };
}

export interface QuoteVersion {
  id: string;
  quoteId: string;
  version: string;
  changes: string[];
  createdAt: Date;
  createdBy: string;
  previousVersion?: string;
  isMajorVersion: boolean;
  changeLog: string;
}

export interface QuoteCollaboration {
  id: string;
  quoteId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'viewer' | 'editor' | 'approver' | 'admin';
  permissions: {
    view: boolean;
    edit: boolean;
    approve: boolean;
    delete: boolean;
    share: boolean;
  };
  addedAt: Date;
  lastAccess: Date;
  isActive: boolean;
}

export interface QuoteBackup {
  id: string;
  quoteId: string;
  backupType: 'manual' | 'auto' | 'version';
  createdAt: Date;
  createdBy: string;
  size: number;
  format: 'json' | 'xml' | 'pdf';
  location: string;
  checksum: string;
  isCompressed: boolean;
  retentionDays: number;
}

class QuoteManagementService {
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
   * Get all quotes with advanced filtering and search
   */
  async getQuotes(filters: QuoteSearchFilters = {}, page = 1, limit = 20): Promise<{
    quotes: Quote[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/quotes`, {
        headers: this.getHeaders(),
        params: {
          ...filters,
          page,
          limit,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
      throw error;
    }
  }

  /**
   * Get a single quote by ID
   */
  async getQuote(id: string): Promise<Quote> {
    try {
      const response = await axios.get(`${this.baseURL}/quotes/${id}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch quote:', error);
      throw error;
    }
  }

  /**
   * Create a new quote
   */
  async createQuote(quoteData: Partial<Quote>): Promise<Quote> {
    try {
      const response = await axios.post(`${this.baseURL}/quotes`, quoteData, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create quote:', error);
      throw error;
    }
  }

  /**
   * Update an existing quote
   */
  async updateQuote(id: string, quoteData: Partial<Quote>): Promise<Quote> {
    try {
      const response = await axios.put(`${this.baseURL}/quotes/${id}`, quoteData, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update quote:', error);
      throw error;
    }
  }

  /**
   * Delete a quote
   */
  async deleteQuote(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/quotes/${id}`, {
        headers: this.getHeaders(),
      });
    } catch (error) {
      console.error('Failed to delete quote:', error);
      throw error;
    }
  }

  /**
   * Archive a quote
   */
  async archiveQuote(id: string, reason?: string): Promise<Quote> {
    try {
      const response = await axios.post(`${this.baseURL}/quotes/${id}/archive`, {
        reason,
        archiveDate: new Date(),
      }, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to archive quote:', error);
      throw error;
    }
  }

  /**
   * Restore an archived quote
   */
  async restoreQuote(id: string): Promise<Quote> {
    try {
      const response = await axios.post(`${this.baseURL}/quotes/${id}/restore`, {}, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to restore quote:', error);
      throw error;
    }
  }

  /**
   * Get quote versions
   */
  async getQuoteVersions(quoteId: string): Promise<QuoteVersion[]> {
    try {
      const response = await axios.get(`${this.baseURL}/quotes/${quoteId}/versions`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch quote versions:', error);
      throw error;
    }
  }

  /**
   * Create a new version of a quote
   */
  async createQuoteVersion(quoteId: string, versionData: Partial<QuoteVersion>): Promise<QuoteVersion> {
    try {
      const response = await axios.post(`${this.baseURL}/quotes/${quoteId}/versions`, versionData, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create quote version:', error);
      throw error;
    }
  }

  /**
   * Get quote analytics
   */
  async getQuoteAnalytics(filters: QuoteSearchFilters = {}): Promise<QuoteAnalytics> {
    try {
      const response = await axios.get(`${this.baseURL}/quotes/analytics`, {
        headers: this.getHeaders(),
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch quote analytics:', error);
      throw error;
    }
  }

  /**
   * Get quote collaborators
   */
  async getQuoteCollaborators(quoteId: string): Promise<QuoteCollaboration[]> {
    try {
      const response = await axios.get(`${this.baseURL}/quotes/${quoteId}/collaborators`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch quote collaborators:', error);
      throw error;
    }
  }

  /**
   * Add a collaborator to a quote
   */
  async addCollaborator(quoteId: string, collaboratorData: Partial<QuoteCollaboration>): Promise<QuoteCollaboration> {
    try {
      const response = await axios.post(`${this.baseURL}/quotes/${quoteId}/collaborators`, collaboratorData, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add collaborator:', error);
      throw error;
    }
  }

  /**
   * Update collaborator permissions
   */
  async updateCollaborator(quoteId: string, collaboratorId: string, updateData: Partial<QuoteCollaboration>): Promise<QuoteCollaboration> {
    try {
      const response = await axios.put(`${this.baseURL}/quotes/${quoteId}/collaborators/${collaboratorId}`, updateData, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update collaborator:', error);
      throw error;
    }
  }

  /**
   * Remove a collaborator from a quote
   */
  async removeCollaborator(quoteId: string, collaboratorId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/quotes/${quoteId}/collaborators/${collaboratorId}`, {
        headers: this.getHeaders(),
      });
    } catch (error) {
      console.error('Failed to remove collaborator:', error);
      throw error;
    }
  }

  /**
   * Get quote backups
   */
  async getQuoteBackups(quoteId: string): Promise<QuoteBackup[]> {
    try {
      const response = await axios.get(`${this.baseURL}/quotes/${quoteId}/backups`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch quote backups:', error);
      throw error;
    }
  }

  /**
   * Create a manual backup of a quote
   */
  async createQuoteBackup(quoteId: string, backupType: 'manual' | 'auto' = 'manual'): Promise<QuoteBackup> {
    try {
      const response = await axios.post(`${this.baseURL}/quotes/${quoteId}/backups`, {
        backupType,
        createdAt: new Date(),
      }, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create quote backup:', error);
      throw error;
    }
  }

  /**
   * Restore a quote from backup
   */
  async restoreFromBackup(quoteId: string, backupId: string): Promise<Quote> {
    try {
      const response = await axios.post(`${this.baseURL}/quotes/${quoteId}/restore-backup`, {
        backupId,
      }, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      throw error;
    }
  }

  /**
   * Bulk operations on quotes
   */
  async bulkUpdateQuotes(quoteIds: string[], updates: Partial<Quote>): Promise<Quote[]> {
    try {
      const response = await axios.put(`${this.baseURL}/quotes/bulk-update`, {
        quoteIds,
        updates,
      }, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk update quotes:', error);
      throw error;
    }
  }

  async bulkDeleteQuotes(quoteIds: string[]): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/quotes/bulk-delete`, {
        headers: this.getHeaders(),
        data: { quoteIds },
      });
    } catch (error) {
      console.error('Failed to bulk delete quotes:', error);
      throw error;
    }
  }

  async bulkArchiveQuotes(quoteIds: string[], reason?: string): Promise<Quote[]> {
    try {
      const response = await axios.post(`${this.baseURL}/quotes/bulk-archive`, {
        quoteIds,
        reason,
        archiveDate: new Date(),
      }, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk archive quotes:', error);
      throw error;
    }
  }

  /**
   * Export quotes data
   */
  async exportQuotes(filters: QuoteSearchFilters = {}, format: 'csv' | 'json' | 'xlsx' = 'csv'): Promise<Blob> {
    try {
      const response = await axios.get(`${this.baseURL}/quotes/export`, {
        headers: this.getHeaders(),
        params: {
          ...filters,
          format,
        },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export quotes:', error);
      throw error;
    }
  }

  /**
   * Get available filters and options
   */
  async getFilterOptions(): Promise<{
    statuses: string[];
    priorities: string[];
    categories: string[];
    industries: string[];
    tags: string[];
    users: Array<{ id: string; name: string; email: string }>;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/quotes/filter-options`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
      throw error;
    }
  }
}

export const quoteManagementService = new QuoteManagementService();
export default quoteManagementService;
