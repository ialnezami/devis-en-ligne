import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  CRMINtegration, 
  IntegrationConfig, 
  IntegrationResponse, 
  IntegrationType,
  ContactData,
  ContactResult,
  DealData,
  DealResult
} from '../../interfaces/integration.interface';

@Injectable()
export class SalesforceIntegration implements CRMINtegration {
  public readonly name = 'Salesforce CRM';
  public readonly type: IntegrationType & { category: 'crm' } = {
    category: 'crm',
    provider: 'salesforce',
    version: '1.0',
    capabilities: ['contacts', 'deals', 'companies', 'leads', 'opportunities'],
  };

  private readonly logger = new Logger(SalesforceIntegration.name);
  private config: IntegrationConfig | null = null;
  private accessToken: string | null = null;
  private instanceUrl: string | null = null;

  constructor(private configService: ConfigService) {}

  async initialize(config: IntegrationConfig): Promise<void> {
    try {
      this.config = config;
      this.logger.log('Salesforce integration initialized', { id: config.id });
      
      // Validate credentials
      if (!config.credentials.clientId || !config.credentials.clientSecret) {
        throw new Error('Invalid Salesforce credentials');
      }
    } catch (error) {
      this.logger.error('Error initializing Salesforce integration', { error: error.message });
      throw error;
    }
  }

  async testConnection(): Promise<IntegrationResponse> {
    try {
      if (!this.config) {
        return { success: false, error: 'Integration not initialized' };
      }

      // Test Salesforce connection by making a simple API call
      const response = await this.makeSalesforceRequest('/services/data/v58.0/sobjects');
      
      if (response.success) {
        this.logger.log('Salesforce connection test successful');
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Connection test failed' };
      }
    } catch (error) {
      this.logger.error('Salesforce connection test failed', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  getCapabilities(): string[] {
    return this.type.capabilities;
  }

  isFeatureSupported(feature: string): boolean {
    return this.type.capabilities.includes(feature);
  }

  async createContact(contact: ContactData): Promise<IntegrationResponse<ContactResult>> {
    try {
      if (!this.isFeatureSupported('contacts')) {
        return { success: false, error: 'Contacts feature not supported' };
      }

      const salesforceContact = this.mapContactToSalesforce(contact);
      const response = await this.makeSalesforceRequest('/services/data/v58.0/sobjects/Contact', {
        method: 'POST',
        body: salesforceContact,
      });

      if (response.success && response.data) {
        const result: ContactResult = {
          id: response.data.id,
          externalId: response.data.id,
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone,
          company: contact.company,
          title: contact.title,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        this.logger.log('Contact created in Salesforce', { contactId: result.id });
        return { success: true, data: result };
      } else {
        return { success: false, error: response.error || 'Failed to create contact' };
      }
    } catch (error) {
      this.logger.error('Error creating contact in Salesforce', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async updateContact(contactId: string, updates: Partial<ContactData>): Promise<IntegrationResponse<ContactResult>> {
    try {
      if (!this.isFeatureSupported('contacts')) {
        return { success: false, error: 'Contacts feature not supported' };
      }

      const salesforceUpdates = this.mapContactToSalesforce(updates);
      const response = await this.makeSalesforceRequest(`/services/data/v58.0/sobjects/Contact/${contactId}`, {
        method: 'PATCH',
        body: salesforceUpdates,
      });

      if (response.success) {
        // Get updated contact
        return await this.getContact(contactId);
      } else {
        return { success: false, error: response.error || 'Failed to update contact' };
      }
    } catch (error) {
      this.logger.error('Error updating contact in Salesforce', { contactId, error: error.message });
      return { success: false, error: error.message };
    }
  }

  async getContact(contactId: string): Promise<IntegrationResponse<ContactResult>> {
    try {
      if (!this.isFeatureSupported('contacts')) {
        return { success: false, error: 'Contacts feature not supported' };
      }

      const response = await this.makeSalesforceRequest(`/services/data/v58.0/sobjects/Contact/${contactId}`);
      
      if (response.success && response.data) {
        const result: ContactResult = {
          id: response.data.Id,
          externalId: response.data.Id,
          firstName: response.data.FirstName,
          lastName: response.data.LastName,
          email: response.data.Email,
          phone: response.data.Phone,
          company: response.data.Company,
          title: response.data.Title,
          createdAt: new Date(response.data.CreatedDate),
          updatedAt: new Date(response.data.LastModifiedDate),
        };

        return { success: true, data: result };
      } else {
        return { success: false, error: response.error || 'Failed to get contact' };
      }
    } catch (error) {
      this.logger.error('Error getting contact from Salesforce', { contactId, error: error.message });
      return { success: false, error: error.message };
    }
  }

  async searchContacts(query: string): Promise<IntegrationResponse<ContactResult[]>> {
    try {
      if (!this.isFeatureSupported('contacts')) {
        return { success: false, error: 'Contacts feature not supported' };
      }

      const soql = `SELECT Id, FirstName, LastName, Email, Phone, Company, Title, CreatedDate, LastModifiedDate 
                    FROM Contact 
                    WHERE FirstName LIKE '%${query}%' OR LastName LIKE '%${query}%' OR Email LIKE '%${query}%'
                    LIMIT 50`;

      const response = await this.makeSalesforceRequest(`/services/data/v58.0/query?q=${encodeURIComponent(soql)}`);
      
      if (response.success && response.data?.records) {
        const results: ContactResult[] = response.data.records.map((record: any) => ({
          id: record.Id,
          externalId: record.Id,
          firstName: record.FirstName,
          lastName: record.LastName,
          email: record.Email,
          phone: record.Phone,
          company: record.Company,
          title: record.Title,
          createdAt: new Date(record.CreatedDate),
          updatedAt: new Date(record.LastModifiedDate),
        }));

        return { success: true, data: results };
      } else {
        return { success: false, error: response.error || 'Failed to search contacts' };
      }
    } catch (error) {
      this.logger.error('Error searching contacts in Salesforce', { query, error: error.message });
      return { success: false, error: error.message };
    }
  }

  async createDeal(deal: DealData): Promise<IntegrationResponse<DealResult>> {
    try {
      if (!this.isFeatureSupported('deals')) {
        return { success: false, error: 'Deals feature not supported' };
      }

      const salesforceOpportunity = this.mapDealToSalesforce(deal);
      const response = await this.makeSalesforceRequest('/services/data/v58.0/sobjects/Opportunity', {
        method: 'POST',
        body: salesforceOpportunity,
      });

      if (response.success && response.data) {
        const result: DealResult = {
          id: response.data.id,
          externalId: response.data.id,
          name: deal.name,
          amount: deal.amount,
          currency: deal.currency,
          stage: deal.stage,
          closeDate: deal.closeDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        this.logger.log('Deal created in Salesforce', { dealId: result.id });
        return { success: true, data: result };
      } else {
        return { success: false, error: response.error || 'Failed to create deal' };
      }
    } catch (error) {
      this.logger.error('Error creating deal in Salesforce', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async updateDeal(dealId: string, updates: Partial<DealData>): Promise<IntegrationResponse<DealResult>> {
    try {
      if (!this.isFeatureSupported('deals')) {
        return { success: false, error: 'Deals feature not supported' };
      }

      const salesforceUpdates = this.mapDealToSalesforce(updates);
      const response = await this.makeSalesforceRequest(`/services/data/v58.0/sobjects/Opportunity/${dealId}`, {
        method: 'PATCH',
        body: salesforceUpdates,
      });

      if (response.success) {
        // Get updated deal
        return await this.getDeal(dealId);
      } else {
        return { success: false, error: response.error || 'Failed to update deal' };
      }
    } catch (error) {
      this.logger.error('Error updating deal in Salesforce', { dealId, error: error.message });
      return { success: false, error: error.message };
    }
  }

  async getDeal(dealId: string): Promise<IntegrationResponse<DealResult>> {
    try {
      if (!this.isFeatureSupported('deals')) {
        return { success: false, error: 'Deals feature not supported' };
      }

      const response = await this.makeSalesforceRequest(`/services/data/v58.0/sobjects/Opportunity/${dealId}`);
      
      if (response.success && response.data) {
        const result: DealResult = {
          id: response.data.Id,
          externalId: response.data.Id,
          name: response.data.Name,
          amount: response.data.Amount,
          currency: response.data.CurrencyIsoCode,
          stage: response.data.StageName,
          closeDate: response.data.CloseDate ? new Date(response.data.CloseDate) : undefined,
          createdAt: new Date(response.data.CreatedDate),
          updatedAt: new Date(response.data.LastModifiedDate),
        };

        return { success: true, data: result };
      } else {
        return { success: false, error: response.error || 'Failed to get deal' };
      }
    } catch (error) {
      this.logger.error('Error getting deal from Salesforce', { dealId, error: error.message });
      return { success: false, error: error.message };
    }
  }

  // Private helper methods

  private mapContactToSalesforce(contact: Partial<ContactData>): any {
    const salesforceContact: any = {};
    
    if (contact.firstName) salesforceContact.FirstName = contact.firstName;
    if (contact.lastName) salesforceContact.LastName = contact.lastName;
    if (contact.email) salesforceContact.Email = contact.email;
    if (contact.phone) salesforceContact.Phone = contact.phone;
    if (contact.company) salesforceContact.Company = contact.company;
    if (contact.title) salesforceContact.Title = contact.title;
    
    return salesforceContact;
  }

  private mapDealToSalesforce(deal: Partial<DealData>): any {
    const salesforceOpportunity: any = {};
    
    if (deal.name) salesforceOpportunity.Name = deal.name;
    if (deal.amount) salesforceOpportunity.Amount = deal.amount;
    if (deal.currency) salesforceOpportunity.CurrencyIsoCode = deal.currency;
    if (deal.stage) salesforceOpportunity.StageName = deal.stage;
    if (deal.closeDate) salesforceOpportunity.CloseDate = deal.closeDate.toISOString().split('T')[0];
    if (deal.description) salesforceOpportunity.Description = deal.description;
    
    return salesforceOpportunity;
  }

  private async makeSalesforceRequest(endpoint: string, options: {
    method?: string;
    body?: any;
  } = {}): Promise<IntegrationResponse> {
    try {
      if (!this.config) {
        return { success: false, error: 'Integration not initialized' };
      }

      // Ensure we have a valid access token
      if (!this.accessToken) {
        await this.authenticate();
      }

      const url = `${this.instanceUrl}${endpoint}`;
      const requestOptions: RequestInit = {
        method: options.method || 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      };

      if (options.body) {
        requestOptions.body = JSON.stringify(options.body);
      }

      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try to refresh
          await this.authenticate();
          return this.makeSalesforceRequest(endpoint, options);
        }
        
        const errorText = await response.text();
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      this.logger.error('Salesforce API request failed', { endpoint, error: error.message });
      return { success: false, error: error.message };
    }
  }

  private async authenticate(): Promise<void> {
    try {
      if (!this.config) {
        throw new Error('Integration not initialized');
      }

      const { clientId, clientSecret, refreshToken } = this.config.credentials;
      
      if (!clientId || !clientSecret || !refreshToken) {
        throw new Error('Missing authentication credentials');
      }

      // Use refresh token to get new access token
      const tokenResponse = await fetch('https://login.salesforce.com/services/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Authentication failed: ${tokenResponse.statusText}`);
      }

      const tokenData = await tokenResponse.json();
      this.accessToken = tokenData.access_token;
      this.instanceUrl = tokenData.instance_url;

      this.logger.log('Salesforce authentication successful');
    } catch (error) {
      this.logger.error('Salesforce authentication failed', { error: error.message });
      throw error;
    }
  }
}
