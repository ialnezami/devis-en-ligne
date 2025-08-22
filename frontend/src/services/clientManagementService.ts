import axios from 'axios';

// Client Management Interfaces
export interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  industry: string;
  companySize: 'small' | 'medium' | 'large' | 'enterprise';
  status: 'active' | 'inactive' | 'prospect' | 'lead';
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  notes: string;
  website?: string;
  linkedin?: string;
  taxId?: string;
  paymentTerms: string;
  creditLimit: number;
  totalRevenue: number;
  lastContactDate: Date;
  nextFollowUpDate?: Date;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  avatar?: string;
  documents: ClientDocument[];
  communications: ClientCommunication[];
  activities: ClientActivity[];
  quotes: ClientQuote[];
}

export interface ClientDocument {
  id: string;
  name: string;
  type: 'contract' | 'proposal' | 'invoice' | 'agreement' | 'other';
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadDate: Date;
  uploadedBy: string;
  description?: string;
  tags: string[];
  isPublic: boolean;
  downloadUrl: string;
}

export interface ClientCommunication {
  id: string;
  type: 'email' | 'phone' | 'meeting' | 'message' | 'note';
  subject: string;
  content: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  priority: 'low' | 'medium' | 'high';
  scheduledDate?: Date;
  sentDate?: Date;
  readDate?: Date;
  attachments: string[];
  tags: string[];
  createdAt: Date;
  createdBy: string;
  relatedQuoteId?: string;
  followUpRequired: boolean;
  followUpDate?: Date;
}

export interface ClientActivity {
  id: string;
  type: 'login' | 'quote_view' | 'document_download' | 'communication' | 'payment' | 'profile_update';
  title: string;
  description: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  metadata: Record<string, any>;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

export interface ClientQuote {
  id: string;
  quoteNumber: string;
  title: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  totalAmount: number;
  currency: string;
  validUntil: Date;
  createdAt: Date;
  lastViewed?: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
}

export interface ClientSearchFilters {
  status?: string[];
  priority?: string[];
  industry?: string[];
  companySize?: string[];
  assignedTo?: string[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  revenueRange?: {
    min: number;
    max: number;
  };
  searchTerm?: string;
}

export interface ClientAnalytics {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  totalRevenue: number;
  averageRevenuePerClient: number;
  statusDistribution: Record<string, number>;
  industryDistribution: Record<string, number>;
  companySizeDistribution: Record<string, number>;
  monthlyGrowth: Array<{
    month: string;
    newClients: number;
    revenue: number;
  }>;
  topClients: Array<{
    clientId: string;
    companyName: string;
    revenue: number;
    quoteCount: number;
  }>;
  communicationStats: {
    totalCommunications: number;
    emailsSent: number;
    callsMade: number;
    meetingsScheduled: number;
    averageResponseTime: number;
  };
}

export interface ClientOnboardingStep {
  id: string;
  title: string;
  description: string;
  type: 'form' | 'document_upload' | 'verification' | 'approval';
  isRequired: boolean;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
  data?: Record<string, any>;
  order: number;
}

export interface ClientOnboarding {
  id: string;
  clientId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  currentStep: number;
  totalSteps: number;
  startedAt: Date;
  completedAt?: Date;
  steps: ClientOnboardingStep[];
  notes: string;
  assignedTo: string;
}

export interface ClientPortalSettings {
  id: string;
  clientId: string;
  isEnabled: boolean;
  features: {
    quoteViewing: boolean;
    documentAccess: boolean;
    communication: boolean;
    profileEditing: boolean;
    paymentHistory: boolean;
  };
  customBranding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    customCss?: string;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  lastLoginAt?: Date;
  lastActivityAt?: Date;
}

// API Response Interfaces
export interface ClientsResponse {
  clients: Client[];
  total: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ClientResponse {
  client: Client;
  success: boolean;
  message?: string;
}

export interface ClientOnboardingResponse {
  onboarding: ClientOnboarding;
  success: boolean;
  message?: string;
}

export interface ClientPortalSettingsResponse {
  settings: ClientPortalSettings;
  success: boolean;
  message?: string;
}

export interface ClientAnalyticsResponse {
  analytics: ClientAnalytics;
  success: boolean;
  message?: string;
}

// Client Management Service
export class ClientManagementService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/clients') {
    this.baseUrl = baseUrl;
  }

  // Client CRUD Operations
  async getClients(filters?: ClientSearchFilters, page: number = 1, limit: number = 20): Promise<ClientsResponse> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(key, v.toString()));
            } else if (value instanceof Date) {
              params.append(key, value.toISOString());
            } else if (typeof value === 'object') {
              params.append(key, JSON.stringify(value));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await axios.get(`${this.baseUrl}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      throw error;
    }
  }

  async getClient(clientId: string): Promise<ClientResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/${clientId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch client:', error);
      throw error;
    }
  }

  async createClient(clientData: Partial<Client>): Promise<ClientResponse> {
    try {
      const response = await axios.post(this.baseUrl, clientData);
      return response.data;
    } catch (error) {
      console.error('Failed to create client:', error);
      throw error;
    }
  }

  async updateClient(clientId: string, updates: Partial<Client>): Promise<ClientResponse> {
    try {
      const response = await axios.put(`${this.baseUrl}/${clientId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Failed to update client:', error);
      throw error;
    }
  }

  async deleteClient(clientId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(`${this.baseUrl}/${clientId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete client:', error);
      throw error;
    }
  }

  async duplicateClient(clientId: string, newCompanyName: string): Promise<ClientResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/${clientId}/duplicate`, {
        newCompanyName
      });
      return response.data;
    } catch (error) {
      console.error('Failed to duplicate client:', error);
      throw error;
    }
  }

  // Client Documents
  async getClientDocuments(clientId: string): Promise<ClientDocument[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/${clientId}/documents`);
      return response.data.documents;
    } catch (error) {
      console.error('Failed to fetch client documents:', error);
      throw error;
    }
  }

  async uploadClientDocument(clientId: string, file: File, metadata: Partial<ClientDocument>): Promise<ClientDocument> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify(metadata));

      const response = await axios.post(`${this.baseUrl}/${clientId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.document;
    } catch (error) {
      console.error('Failed to upload client document:', error);
      throw error;
    }
  }

  async deleteClientDocument(clientId: string, documentId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(`${this.baseUrl}/${clientId}/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete client document:', error);
      throw error;
    }
  }

  // Client Communications
  async getClientCommunications(clientId: string): Promise<ClientCommunication[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/${clientId}/communications`);
      return response.data.communications;
    } catch (error) {
      console.error('Failed to fetch client communications:', error);
      throw error;
    }
  }

  async createClientCommunication(clientId: string, communication: Partial<ClientCommunication>): Promise<ClientCommunication> {
    try {
      const response = await axios.post(`${this.baseUrl}/${clientId}/communications`, communication);
      return response.data.communication;
    } catch (error) {
      console.error('Failed to create client communication:', error);
      throw error;
    }
  }

  async updateClientCommunication(clientId: string, communicationId: string, updates: Partial<ClientCommunication>): Promise<ClientCommunication> {
    try {
      const response = await axios.put(`${this.baseUrl}/${clientId}/communications/${communicationId}`, updates);
      return response.data.communication;
    } catch (error) {
      console.error('Failed to update client communication:', error);
      throw error;
    }
  }

  async deleteClientCommunication(clientId: string, communicationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(`${this.baseUrl}/${clientId}/communications/${communicationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete client communication:', error);
      throw error;
    }
  }

  // Client Activities
  async getClientActivities(clientId: string): Promise<ClientActivity[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/${clientId}/activities`);
      return response.data.activities;
    } catch (error) {
      console.error('Failed to fetch client activities:', error);
      throw error;
    }
  }

  async logClientActivity(clientId: string, activity: Partial<ClientActivity>): Promise<ClientActivity> {
    try {
      const response = await axios.post(`${this.baseUrl}/${clientId}/activities`, activity);
      return response.data.activity;
    } catch (error) {
      console.error('Failed to log client activity:', error);
      throw error;
    }
  }

  // Client Onboarding
  async getClientOnboarding(clientId: string): Promise<ClientOnboardingResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/${clientId}/onboarding`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch client onboarding:', error);
      throw error;
    }
  }

  async createClientOnboarding(clientId: string, onboardingData: Partial<ClientOnboarding>): Promise<ClientOnboardingResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/${clientId}/onboarding`, onboardingData);
      return response.data;
    } catch (error) {
      console.error('Failed to create client onboarding:', error);
      throw error;
    }
  }

  async updateClientOnboarding(clientId: string, onboardingId: string, updates: Partial<ClientOnboarding>): Promise<ClientOnboardingResponse> {
    try {
      const response = await axios.put(`${this.baseUrl}/${clientId}/onboarding/${onboardingId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Failed to update client onboarding:', error);
      throw error;
    }
  }

  async completeOnboardingStep(clientId: string, stepId: string, stepData: Record<string, any>): Promise<ClientOnboardingResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/${clientId}/onboarding/steps/${stepId}/complete`, stepData);
      return response.data;
    } catch (error) {
      console.error('Failed to complete onboarding step:', error);
      throw error;
    }
  }

  // Client Portal Settings
  async getClientPortalSettings(clientId: string): Promise<ClientPortalSettingsResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/${clientId}/portal-settings`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch client portal settings:', error);
      throw error;
    }
  }

  async updateClientPortalSettings(clientId: string, settings: Partial<ClientPortalSettings>): Promise<ClientPortalSettingsResponse> {
    try {
      const response = await axios.put(`${this.baseUrl}/${clientId}/portal-settings`, settings);
      return response.data;
    } catch (error) {
      console.error('Failed to update client portal settings:', error);
      throw error;
    }
  }

  // Client Analytics
  async getClientAnalytics(filters?: ClientSearchFilters): Promise<ClientAnalyticsResponse> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(key, v.toString()));
            } else if (value instanceof Date) {
              params.append(key, value.toISOString());
            } else if (typeof value === 'object') {
              params.append(key, JSON.stringify(value));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await axios.get(`${this.baseUrl}/analytics?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch client analytics:', error);
      throw error;
    }
  }

  // Bulk Operations
  async bulkUpdateClients(clientIds: string[], updates: Partial<Client>): Promise<{ success: boolean; updatedCount: number; message: string }> {
    try {
      const response = await axios.put(`${this.baseUrl}/bulk-update`, {
        clientIds,
        updates
      });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk update clients:', error);
      throw error;
    }
  }

  async bulkDeleteClients(clientIds: string[]): Promise<{ success: boolean; deletedCount: number; message: string }> {
    try {
      const response = await axios.delete(`${this.baseUrl}/bulk-delete`, {
        data: { clientIds }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk delete clients:', error);
      throw error;
    }
  }

  async bulkExportClients(clientIds: string[], format: 'csv' | 'json' | 'xlsx' = 'csv'): Promise<Blob> {
    try {
      const response = await axios.post(`${this.baseUrl}/bulk-export`, {
        clientIds,
        format
      }, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to bulk export clients:', error);
      throw error;
    }
  }

  // Client Search and Discovery
  async searchClients(query: string, filters?: ClientSearchFilters): Promise<Client[]> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(key, v.toString()));
            } else if (value instanceof Date) {
              params.append(key, value.toISOString());
            } else if (typeof value === 'object') {
              params.append(key, JSON.stringify(value));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await axios.get(`${this.baseUrl}/search?${params.toString()}`);
      return response.data.clients;
    } catch (error) {
      console.error('Failed to search clients:', error);
      throw error;
    }
  }

  async getClientSuggestions(query: string, limit: number = 10): Promise<Array<{ id: string; companyName: string; contactPerson: string; email: string }>> {
    try {
      const response = await axios.get(`${this.baseUrl}/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`);
      return response.data.suggestions;
    } catch (error) {
      console.error('Failed to get client suggestions:', error);
      throw error;
    }
  }

  // Utility Methods
  async validateClientEmail(email: string, excludeClientId?: string): Promise<{ isValid: boolean; isAvailable: boolean; message?: string }> {
    try {
      const params = new URLSearchParams();
      params.append('email', email);
      if (excludeClientId) {
        params.append('excludeId', excludeClientId);
      }

      const response = await axios.get(`${this.baseUrl}/validate-email?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to validate client email:', error);
      throw error;
    }
  }

  async getClientIndustries(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/industries`);
      return response.data.industries;
    } catch (error) {
      console.error('Failed to fetch client industries:', error);
      throw error;
    }
  }

  async getClientTags(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/tags`);
      return response.data.tags;
    } catch (error) {
      console.error('Failed to fetch client tags:', error);
      throw error;
    }
  }

  async getClientStatuses(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/statuses`);
      return response.data.statuses;
    } catch (error) {
      console.error('Failed to fetch client statuses:', error);
      throw error;
    }
  }

  async getClientPriorities(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/priorities`);
      return response.data.priorities;
    } catch (error) {
      console.error('Failed to fetch client priorities:', error);
      throw error;
    }
  }

  async getCompanySizes(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/company-sizes`);
      return response.data.companySizes;
    } catch (error) {
      console.error('Failed to fetch company sizes:', error);
      throw error;
    }
  }
}

// Export default instance
export const clientManagementService = new ClientManagementService();
