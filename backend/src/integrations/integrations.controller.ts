import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { IntegrationManagerService } from './services/integration-manager.service';
import { 
  IntegrationConfig, 
  IntegrationType,
  IntegrationResponse 
} from './interfaces/integration.interface';

@ApiTags('Integrations')
@Controller('integrations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class IntegrationsController {
  constructor(private readonly integrationManager: IntegrationManagerService) {}

  @Get('types')
  @ApiOperation({ summary: 'Get all available integration types' })
  @ApiResponse({ status: 200, description: 'List of available integration types' })
  async getAvailableTypes(): Promise<IntegrationType[]> {
    return this.integrationManager.getAvailableIntegrationTypes();
  }

  @Get('company/:companyId/status')
  @ApiOperation({ summary: 'Get integration status for a company' })
  @ApiResponse({ status: 200, description: 'Integration status information' })
  async getCompanyIntegrationStatus(@Param('companyId') companyId: string) {
    return this.integrationManager.getCompanyIntegrationStatus(companyId);
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get all integrations for a company' })
  @ApiResponse({ status: 200, description: 'List of company integrations' })
  async getCompanyIntegrations(@Param('companyId') companyId: string) {
    const integrations = this.integrationManager.getCompanyIntegrations(companyId);
    return {
      count: integrations.length,
      integrations: integrations.map(integration => ({
        name: integration.name,
        type: integration.type,
        capabilities: integration.getCapabilities(),
      })),
    };
  }

  @Post('company/:companyId/initialize')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Initialize integrations for a company' })
  @ApiResponse({ status: 200, description: 'Integrations initialized successfully' })
  async initializeCompanyIntegrations(@Param('companyId') companyId: string) {
    await this.integrationManager.initializeCompanyIntegrations(companyId);
    return { message: 'Company integrations initialized successfully' };
  }

  @Post(':integrationId/test')
  @ApiOperation({ summary: 'Test integration connection' })
  @ApiResponse({ status: 200, description: 'Connection test result' })
  async testIntegrationConnection(@Param('integrationId') integrationId: string): Promise<IntegrationResponse> {
    return this.integrationManager.testIntegrationConnection(integrationId);
  }

  @Get(':integrationId/capabilities')
  @ApiOperation({ summary: 'Get integration capabilities' })
  @ApiResponse({ status: 200, description: 'List of integration capabilities' })
  async getIntegrationCapabilities(@Param('integrationId') integrationId: string) {
    const capabilities = this.integrationManager.getIntegrationCapabilities(integrationId);
    return { capabilities };
  }

  @Get(':integrationId/supports/:feature')
  @ApiOperation({ summary: 'Check if integration supports a specific feature' })
  @ApiResponse({ status: 200, description: 'Feature support status' })
  async checkFeatureSupport(
    @Param('integrationId') integrationId: string,
    @Param('feature') feature: string,
  ) {
    const isSupported = this.integrationManager.isFeatureSupported(integrationId, feature);
    return { feature, isSupported };
  }

  // CRM Integration endpoints
  @Get('crm/:provider/contacts')
  @ApiOperation({ summary: 'Search contacts in CRM' })
  @ApiResponse({ status: 200, description: 'List of contacts' })
  async searchCRMContacts(
    @Param('provider') provider: string,
    @Query('query') query: string,
  ) {
    const crmIntegration = this.integrationManager.getCRMINtegration(provider);
    if (!crmIntegration) {
      return { success: false, error: 'CRM integration not found' };
    }
    return crmIntegration.searchContacts(query);
  }

  @Post('crm/:provider/contacts')
  @ApiOperation({ summary: 'Create contact in CRM' })
  @ApiResponse({ status: 201, description: 'Contact created successfully' })
  async createCRMContact(
    @Param('provider') provider: string,
    @Body() contactData: any,
  ) {
    const crmIntegration = this.integrationManager.getCRMINtegration(provider);
    if (!crmIntegration) {
      return { success: false, error: 'CRM integration not found' };
    }
    return crmIntegration.createContact(contactData);
  }

  // Payment Integration endpoints
  @Post('payment/:provider/payment-intent')
  @ApiOperation({ summary: 'Create payment intent' })
  @ApiResponse({ status: 201, description: 'Payment intent created successfully' })
  async createPaymentIntent(
    @Param('provider') provider: string,
    @Body() paymentData: { amount: number; currency: string; metadata?: Record<string, any> },
  ) {
    const paymentIntegration = this.integrationManager.getPaymentIntegration(provider);
    if (!paymentIntegration) {
      return { success: false, error: 'Payment integration not found' };
    }
    return paymentIntegration.createPaymentIntent(
      paymentData.amount,
      paymentData.currency,
      paymentData.metadata,
    );
  }

  @Post('payment/:provider/process')
  @ApiOperation({ summary: 'Process payment' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully' })
  async processPayment(
    @Param('provider') provider: string,
    @Body() paymentData: any,
  ) {
    const paymentIntegration = this.integrationManager.getPaymentIntegration(provider);
    if (!paymentIntegration) {
      return { success: false, error: 'Payment integration not found' };
    }
    return paymentIntegration.processPayment(paymentData);
  }

  // Calendar Integration endpoints
  @Get('calendar/:provider/events')
  @ApiOperation({ summary: 'List calendar events' })
  @ApiResponse({ status: 200, description: 'List of events' })
  async listCalendarEvents(
    @Param('provider') provider: string,
    @Query('calendarId') calendarId: string,
    @Query('timeMin') timeMin?: string,
    @Query('timeMax') timeMax?: string,
  ) {
    const calendarIntegration = this.integrationManager.getCalendarIntegration(provider);
    if (!calendarIntegration) {
      return { success: false, error: 'Calendar integration not found' };
    }

    const startDate = timeMin ? new Date(timeMin) : undefined;
    const endDate = timeMax ? new Date(timeMax) : undefined;

    return calendarIntegration.listEvents(calendarId, startDate, endDate);
  }

  @Post('calendar/:provider/events')
  @ApiOperation({ summary: 'Create calendar event' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  async createCalendarEvent(
    @Param('provider') provider: string,
    @Body() eventData: any,
  ) {
    const calendarIntegration = this.integrationManager.getCalendarIntegration(provider);
    if (!calendarIntegration) {
      return { success: false, error: 'Calendar integration not found' };
    }
    return calendarIntegration.createEvent(eventData);
  }

  @Get('calendar/:provider/availability')
  @ApiOperation({ summary: 'Get available time slots' })
  @ApiResponse({ status: 200, description: 'Available time slots' })
  async getAvailableSlots(
    @Param('provider') provider: string,
    @Query('calendarId') calendarId: string,
    @Query('duration') duration: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const calendarIntegration = this.integrationManager.getCalendarIntegration(provider);
    if (!calendarIntegration) {
      return { success: false, error: 'Calendar integration not found' };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    return calendarIntegration.getAvailableSlots(calendarId, duration, start, end);
  }

  // Email Integration endpoints
  @Post('email/:provider/send')
  @ApiOperation({ summary: 'Send email' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  async sendEmail(
    @Param('provider') provider: string,
    @Body() emailData: any,
  ) {
    const emailIntegration = this.integrationManager.getEmailIntegration(provider);
    if (!emailIntegration) {
      return { success: false, error: 'Email integration not found' };
    }
    return emailIntegration.sendEmail(emailData);
  }

  @Post('email/:provider/bulk')
  @ApiOperation({ summary: 'Send bulk emails' })
  @ApiResponse({ status: 200, description: 'Bulk emails sent successfully' })
  async sendBulkEmails(
    @Param('provider') provider: string,
    @Body() emailsData: any,
  ) {
    const emailIntegration = this.integrationManager.getEmailIntegration(provider);
    if (!emailIntegration) {
      return { success: false, error: 'Email integration not found' };
    }
    return emailIntegration.sendBulkEmail(emailsData.emails);
  }

  // Accounting Integration endpoints
  @Post('accounting/:provider/invoices')
  @ApiOperation({ summary: 'Create invoice in accounting system' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  async createAccountingInvoice(
    @Param('provider') provider: string,
    @Body() invoiceData: any,
  ) {
    const accountingIntegration = this.integrationManager.getAccountingIntegration(provider);
    if (!accountingIntegration) {
      return { success: false, error: 'Accounting integration not found' };
    }
    return accountingIntegration.createInvoice(invoiceData);
  }

  @Get('accounting/:provider/accounts')
  @ApiOperation({ summary: 'Sync chart of accounts' })
  @ApiResponse({ status: 200, description: 'Chart of accounts synced successfully' })
  async syncChartOfAccounts(@Param('provider') provider: string) {
    const accountingIntegration = this.integrationManager.getAccountingIntegration(provider);
    if (!accountingIntegration) {
      return { success: false, error: 'Accounting integration not found' };
    }
    return accountingIntegration.syncChartOfAccounts();
  }

  // Integration management endpoints
  @Post('sync/:integrationId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Sync integration data' })
  @ApiResponse({ status: 200, description: 'Integration synced successfully' })
  async syncIntegration(@Param('integrationId') integrationId: string) {
    // This would trigger a sync job for the specific integration
    return { message: 'Integration sync initiated', integrationId };
  }

  @Post('webhook/:integrationId/:provider')
  @ApiOperation({ summary: 'Handle integration webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(
    @Param('integrationId') integrationId: string,
    @Param('provider') provider: string,
    @Body() webhookData: any,
  ) {
    // This would process webhooks from external services
    return { message: 'Webhook processed successfully', integrationId, provider };
  }
}
