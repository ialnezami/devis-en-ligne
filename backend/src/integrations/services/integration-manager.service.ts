import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  IntegrationConfig, 
  IntegrationProvider, 
  IntegrationResponse,
  IntegrationType,
  CRMINtegration,
  AccountingIntegration,
  PaymentIntegration,
  EmailIntegration,
  CalendarIntegration
} from '../interfaces/integration.interface';
import { SalesforceIntegration } from '../providers/crm/salesforce.integration';
import { HubSpotIntegration } from '../providers/crm/hubspot.integration';
import { QuickBooksIntegration } from '../providers/accounting/quickbooks.integration';
// import { XeroIntegration } from '../providers/accounting/xero.integration';
// import { StripeIntegration } from '../providers/payment/stripe.integration';
// import { PayPalIntegration } from '../providers/payment/paypal.integration';
// import { MailchimpIntegration } from '../providers/email/mailchimp.integration';
// import { SendGridIntegration } from '../providers/email/sendgrid.integration';
import { GoogleCalendarIntegration } from '../providers/calendar/google-calendar.integration';
// import { OutlookCalendarIntegration } from '../providers/calendar/outlook-calendar.integration';

@Injectable()
export class IntegrationManagerService {
  private readonly logger = new Logger(IntegrationManagerService.name);
  private readonly integrations: Map<string, IntegrationProvider> = new Map();
  private readonly configs: Map<string, IntegrationConfig> = new Map();

  constructor(
    private configService: ConfigService,
    private salesforceIntegration: SalesforceIntegration,
    private hubspotIntegration: HubSpotIntegration,
    private quickbooksIntegration: QuickBooksIntegration,
    // private xeroIntegration: XeroIntegration,
    // private stripeIntegration: StripeIntegration,
    // private paypalIntegration: PayPalIntegration,
    // private mailchimpIntegration: MailchimpIntegration,
    // private sendgridIntegration: SendGridIntegration,
    private googleCalendarIntegration: GoogleCalendarIntegration,
    // private outlookCalendarIntegration: OutlookCalendarIntegration,
  ) {}

  /**
   * Initialize all integrations for a company
   */
  async initializeCompanyIntegrations(companyId: string): Promise<void> {
    try {
      this.logger.log('Initializing integrations for company', { companyId });
      
      // Load integration configurations from database or config
      const configs = await this.loadCompanyIntegrationConfigs(companyId);
      
      for (const config of configs) {
        await this.initializeIntegration(config);
      }
      
      this.logger.log('Company integrations initialized successfully', { 
        companyId, 
        count: configs.length 
      });
    } catch (error) {
      this.logger.error('Error initializing company integrations', { 
        companyId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Initialize a specific integration
   */
  async initializeIntegration(config: IntegrationConfig): Promise<void> {
    try {
      const provider = this.createIntegrationProvider(config.type);
      
      if (provider) {
        await provider.initialize(config);
        this.integrations.set(config.id, provider);
        this.configs.set(config.id, config);
        
        this.logger.log('Integration initialized successfully', { 
          id: config.id, 
          name: config.name, 
          type: config.type.provider 
        });
      }
    } catch (error) {
      this.logger.error('Error initializing integration', { 
        id: config.id, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Get integration by ID
   */
  getIntegration(id: string): IntegrationProvider | null {
    return this.integrations.get(id) || null;
  }

  /**
   * Get integration by type and provider
   */
  getIntegrationByType(category: string, provider: string): IntegrationProvider | null {
    for (const [id, integration] of this.integrations) {
      const config = this.configs.get(id);
      if (config && 
          config.type.category === category && 
          config.type.provider === provider) {
        return integration;
      }
    }
    return null;
  }

  /**
   * Get all active integrations for a company
   */
  getCompanyIntegrations(companyId: string): IntegrationProvider[] {
    const companyIntegrations: IntegrationProvider[] = [];
    
    for (const [id, integration] of this.integrations) {
      const config = this.configs.get(id);
      if (config && config.companyId === companyId && config.isActive) {
        companyIntegrations.push(integration);
      }
    }
    
    return companyIntegrations;
  }

  /**
   * Test connection for an integration
   */
  async testIntegrationConnection(id: string): Promise<IntegrationResponse> {
    try {
      const integration = this.getIntegration(id);
      if (!integration) {
        return {
          success: false,
          error: 'Integration not found',
        };
      }

      return await integration.testConnection();
    } catch (error) {
      this.logger.error('Error testing integration connection', { id, error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get integration capabilities
   */
  getIntegrationCapabilities(id: string): string[] {
    const integration = this.getIntegration(id);
    return integration ? integration.getCapabilities() : [];
  }

  /**
   * Check if integration supports a specific feature
   */
  isFeatureSupported(id: string, feature: string): boolean {
    const integration = this.getIntegration(id);
    return integration ? integration.isFeatureSupported(feature) : false;
  }

  /**
   * Get CRM integration
   */
  getCRMINtegration(provider: string): CRMINtegration | null {
    const integration = this.getIntegrationByType('crm', provider);
    return integration as CRMINtegration;
  }

  /**
   * Get accounting integration
   */
  getAccountingIntegration(provider: string): AccountingIntegration | null {
    const integration = this.getIntegrationByType('accounting', provider);
    return integration as AccountingIntegration;
  }

  /**
   * Get payment integration
   */
  getPaymentIntegration(provider: string): PaymentIntegration | null {
    const integration = this.getIntegrationByType('payment', provider);
    return integration as PaymentIntegration;
  }

  /**
   * Get email integration
   */
  getEmailIntegration(provider: string): EmailIntegration | null {
    const integration = this.getIntegrationByType('email', provider);
    return integration as EmailIntegration;
  }

  /**
   * Get calendar integration
   */
  getCalendarIntegration(provider: string): CalendarIntegration | null {
    const integration = this.getIntegrationByType('calendar', provider);
    return integration as CalendarIntegration;
  }

  /**
   * Get all available integration types
   */
  getAvailableIntegrationTypes(): IntegrationType[] {
    return [
      {
        category: 'crm',
        provider: 'salesforce',
        version: '1.0',
        capabilities: ['contacts', 'deals', 'companies', 'leads', 'opportunities'],
      },
      {
        category: 'crm',
        provider: 'hubspot',
        version: '1.0',
        capabilities: ['contacts', 'deals', 'companies', 'leads', 'pipelines'],
      },
      {
        category: 'accounting',
        provider: 'quickbooks',
        version: '1.0',
        capabilities: ['invoices', 'customers', 'accounts', 'payments', 'reports'],
      },
      {
        category: 'accounting',
        provider: 'xero',
        version: '1.0',
        capabilities: ['invoices', 'customers', 'accounts', 'payments', 'reports'],
      },
      {
        category: 'payment',
        provider: 'stripe',
        version: '1.0',
        capabilities: ['payments', 'subscriptions', 'invoices', 'customers', 'refunds'],
      },
      {
        category: 'payment',
        provider: 'paypal',
        version: '1.0',
        capabilities: ['payments', 'subscriptions', 'invoices', 'customers', 'refunds'],
      },
      {
        category: 'email',
        provider: 'mailchimp',
        version: '1.0',
        capabilities: ['emails', 'campaigns', 'subscribers', 'automation', 'templates'],
      },
      {
        category: 'email',
        provider: 'sendgrid',
        version: '1.0',
        capabilities: ['emails', 'campaigns', 'templates', 'analytics', 'webhooks'],
      },
      {
        category: 'calendar',
        provider: 'google',
        version: '1.0',
        capabilities: ['events', 'calendars', 'availability', 'scheduling', 'reminders'],
      },
      {
        category: 'calendar',
        provider: 'outlook',
        version: '1.0',
        capabilities: ['events', 'calendars', 'availability', 'scheduling', 'reminders'],
      },
    ];
  }

  /**
   * Get integration status for a company
   */
  async getCompanyIntegrationStatus(companyId: string): Promise<{
    total: number;
    active: number;
    connected: number;
    integrations: Array<{
      id: string;
      name: string;
      type: string;
      provider: string;
      status: 'active' | 'inactive' | 'error';
      lastSync?: Date;
    }>;
  }> {
    try {
      const integrations = this.getCompanyIntegrations(companyId);
      const status = {
        total: integrations.length,
        active: 0,
        connected: 0,
        integrations: [],
      };

      for (const integration of integrations) {
        const config = this.findConfigByIntegration(integration);
        if (config) {
          const connectionTest = await integration.testConnection();
          const isConnected = connectionTest.success;
          
          if (isConnected) status.connected++;
          if (config.isActive) status.active++;

          status.integrations.push({
            id: config.id,
            name: config.name,
            type: config.type.category,
            provider: config.type.provider,
            status: config.isActive ? (isConnected ? 'active' : 'error') : 'inactive',
            lastSync: config.updatedAt,
          });
        }
      }

      return status;
    } catch (error) {
      this.logger.error('Error getting company integration status', { 
        companyId, 
        error: error.message 
      });
      throw error;
    }
  }

  // Private methods

  private createIntegrationProvider(type: IntegrationType): IntegrationProvider | null {
    switch (type.provider.toLowerCase()) {
      case 'salesforce':
        return this.salesforceIntegration;
      case 'hubspot':
        return this.hubspotIntegration;
      case 'quickbooks':
        return this.quickbooksIntegration;
      // case 'xero':
      //   return this.xeroIntegration;
      // case 'stripe':
      //   return this.stripeIntegration;
      // case 'paypal':
      //   return this.paypalIntegration;
      // case 'mailchimp':
      //   return this.mailchimpIntegration;
      // case 'sendgrid':
      //   return this.sendgridIntegration;
      case 'google':
        return this.googleCalendarIntegration;
      // case 'outlook':
      //   return this.outlookCalendarIntegration;
      default:
        this.logger.warn('Unknown integration provider', { provider: type.provider });
        return null;
    }
  }

  private async loadCompanyIntegrationConfigs(companyId: string): Promise<IntegrationConfig[]> {
    // This would typically load from a database
    // For now, return empty array - will be implemented when we add the database layer
    return [];
  }

  private findConfigByIntegration(integration: IntegrationProvider): IntegrationConfig | null {
    for (const [id, config] of this.configs) {
      if (this.integrations.get(id) === integration) {
        return config;
      }
    }
    return null;
  }
}
