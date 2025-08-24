import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IntegrationManagerService } from './services/integration-manager.service';
import { IntegrationsController } from './integrations.controller';

// CRM Integrations
import { SalesforceIntegration } from './providers/crm/salesforce.integration';
import { HubSpotIntegration } from './providers/crm/hubspot.integration';

// Accounting Integrations
import { QuickBooksIntegration } from './providers/accounting/quickbooks.integration';
// import { XeroIntegration } from './providers/accounting/xero.integration';

// Payment Integrations
// import { StripeIntegration } from './providers/payment/stripe.integration';
// import { PayPalIntegration } from './providers/payment/paypal.integration';

// Email Integrations
// import { MailchimpIntegration } from './providers/email/mailchimp.integration';
// import { SendGridIntegration } from './providers/email/sendgrid.integration';

// Calendar Integrations
import { GoogleCalendarIntegration } from './providers/calendar/google-calendar.integration';
// import { OutlookCalendarIntegration } from './providers/calendar/outlook-calendar.integration';

@Module({
  imports: [ConfigModule],
  controllers: [IntegrationsController],
  providers: [
    IntegrationManagerService,
    
    // CRM Integrations
    SalesforceIntegration,
    HubSpotIntegration,
    
    // Accounting Integrations
    QuickBooksIntegration,
    XeroIntegration,
    
    // Payment Integrations
    StripeIntegration,
    PayPalIntegration,
    
    // Email Integrations
    MailchimpIntegration,
    SendGridIntegration,
    
    // Calendar Integrations
    GoogleCalendarIntegration,
    OutlookCalendarIntegration,
  ],
  exports: [IntegrationManagerService],
})
export class IntegrationsModule {}
