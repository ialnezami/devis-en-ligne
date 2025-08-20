import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  PaymentIntegration, 
  IntegrationConfig, 
  IntegrationResponse, 
  IntegrationType,
  PaymentData,
  PaymentResult,
  PaymentIntentResult,
  RefundResult,
  CustomerData,
  CustomerResult,
  PaymentMethodData,
  PaymentMethodResult
} from '../../interfaces/integration.interface';

@Injectable()
export class StripeIntegration implements PaymentIntegration {
  public readonly name = 'Stripe Payments';
  public readonly type: IntegrationType & { category: 'payment' } = {
    category: 'payment',
    provider: 'stripe',
    version: '1.0',
    capabilities: ['payments', 'subscriptions', 'invoices', 'customers', 'refunds'],
  };

  private readonly logger = new Logger(StripeIntegration.name);
  private config: IntegrationConfig | null = null;
  private stripe: any = null;

  constructor(private configService: ConfigService) {}

  async initialize(config: IntegrationConfig): Promise<void> {
    try {
      this.config = config;
      this.logger.log('Stripe integration initialized', { id: config.id });
      
      // Validate credentials
      if (!config.credentials.secretKey) {
        throw new Error('Invalid Stripe credentials');
      }

      // Initialize Stripe SDK
      const Stripe = require('stripe');
      this.stripe = new Stripe(config.credentials.secretKey, {
        apiVersion: '2023-10-16',
      });
    } catch (error) {
      this.logger.error('Error initializing Stripe integration', { error: error.message });
      throw error;
    }
  }

  async testConnection(): Promise<IntegrationResponse> {
    try {
      if (!this.stripe) {
        return { success: false, error: 'Integration not initialized' };
      }

      // Test Stripe connection by making a simple API call
      const account = await this.stripe.accounts.retrieve();
      
      if (account && account.id) {
        this.logger.log('Stripe connection test successful', { accountId: account.id });
        return { success: true };
      } else {
        return { success: false, error: 'Connection test failed' };
      }
    } catch (error) {
      this.logger.error('Stripe connection test failed', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  getCapabilities(): string[] {
    return this.type.capabilities;
  }

  isFeatureSupported(feature: string): boolean {
    return this.type.capabilities.includes(feature);
  }

  async createPaymentIntent(amount: number, currency: string, metadata?: Record<string, any>): Promise<IntegrationResponse<PaymentIntentResult>> {
    try {
      if (!this.isFeatureSupported('payments')) {
        return { success: false, error: 'Payments feature not supported' };
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      const result: PaymentIntentResult = {
        id: paymentIntent.id,
        amount: amount,
        currency: currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
        createdAt: new Date(paymentIntent.created * 1000),
      };

      this.logger.log('Payment intent created in Stripe', { paymentIntentId: result.id });
      return { success: true, data: result };
    } catch (error) {
      this.logger.error('Error creating payment intent in Stripe', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async processPayment(paymentData: PaymentData): Promise<IntegrationResponse<PaymentResult>> {
    try {
      if (!this.isFeatureSupported('payments')) {
        return { success: false, error: 'Payments feature not supported' };
      }

      // Create payment intent first
      const paymentIntentResponse = await this.createPaymentIntent(
        paymentData.amount,
        paymentData.currency,
        paymentData.metadata
      );

      if (!paymentIntentResponse.success || !paymentIntentResponse.data) {
        return { success: false, error: 'Failed to create payment intent' };
      }

      const paymentIntent = paymentIntentResponse.data;

      // If payment method is provided, confirm the payment
      if (paymentData.paymentMethodId) {
        const confirmedPayment = await this.stripe.paymentIntents.confirm(paymentIntent.id, {
          payment_method: paymentData.paymentMethodId,
        });

        if (confirmedPayment.status === 'succeeded') {
          const result: PaymentResult = {
            id: confirmedPayment.id,
            externalId: confirmedPayment.id,
            amount: paymentData.amount,
            currency: paymentData.currency,
            status: confirmedPayment.status,
            paymentMethodId: paymentData.paymentMethodId,
            createdAt: new Date(confirmedPayment.created * 1000),
          };

          this.logger.log('Payment processed successfully in Stripe', { paymentId: result.id });
          return { success: true, data: result };
        } else {
          return { success: false, error: `Payment failed with status: ${confirmedPayment.status}` };
        }
      }

      // Return payment intent for client-side confirmation
      return { success: true, data: {
        id: paymentIntent.id,
        externalId: paymentIntent.id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: 'requires_payment_method',
        createdAt: paymentIntent.createdAt,
      }};
    } catch (error) {
      this.logger.error('Error processing payment in Stripe', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<IntegrationResponse<RefundResult>> {
    try {
      if (!this.isFeatureSupported('refunds')) {
        return { success: false, error: 'Refunds feature not supported' };
      }

      const refundData: any = {
        payment_intent: paymentId,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await this.stripe.refunds.create(refundData);

      const result: RefundResult = {
        id: refund.id,
        amount: amount || 0,
        status: refund.status,
        createdAt: new Date(refund.created * 1000),
      };

      this.logger.log('Payment refunded in Stripe', { refundId: result.id, paymentId });
      return { success: true, data: result };
    } catch (error) {
      this.logger.error('Error refunding payment in Stripe', { paymentId, error: error.message });
      return { success: false, error: error.message };
    }
  }

  async getPayment(paymentId: string): Promise<IntegrationResponse<PaymentResult>> {
    try {
      if (!this.isFeatureSupported('payments')) {
        return { success: false, error: 'Payments feature not supported' };
      }

      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);

      const result: PaymentResult = {
        id: paymentIntent.id,
        externalId: paymentIntent.id,
        amount: paymentIntent.amount / 100, // Convert from cents
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        paymentMethodId: paymentIntent.payment_method,
        createdAt: new Date(paymentIntent.created * 1000),
      };

      return { success: true, data: result };
    } catch (error) {
      this.logger.error('Error getting payment from Stripe', { paymentId, error: error.message });
      return { success: false, error: error.message };
    }
  }

  async createCustomer(customer: CustomerData): Promise<IntegrationResponse<CustomerResult>> {
    try {
      if (!this.isFeatureSupported('customers')) {
        return { success: false, error: 'Customers feature not supported' };
      }

      const stripeCustomer = await this.stripe.customers.create({
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        metadata: {
          taxId: customer.taxId,
          ...customer.customFields,
        },
      });

      const result: CustomerResult = {
        id: stripeCustomer.id,
        externalId: stripeCustomer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        createdAt: new Date(stripeCustomer.created * 1000),
        updatedAt: new Date(stripeCustomer.created * 1000),
      };

      this.logger.log('Customer created in Stripe', { customerId: result.id });
      return { success: true, data: result };
    } catch (error) {
      this.logger.error('Error creating customer in Stripe', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async attachPaymentMethod(customerId: string, paymentMethod: PaymentMethodData): Promise<IntegrationResponse<PaymentMethodResult>> {
    try {
      if (!this.isFeatureSupported('payments')) {
        return { success: false, error: 'Payments feature not supported' };
      }

      // Attach payment method to customer
      await this.stripe.paymentMethods.attach(paymentMethod.token, {
        customer: customerId,
      });

      // Set as default payment method
      await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethod.token,
        },
      });

      // Get payment method details
      const paymentMethodDetails = await this.stripe.paymentMethods.retrieve(paymentMethod.token);

      const result: PaymentMethodResult = {
        id: paymentMethodDetails.id,
        type: paymentMethodDetails.type,
        last4: paymentMethodDetails.card?.last4,
        brand: paymentMethodDetails.card?.brand,
        createdAt: new Date(paymentMethodDetails.created * 1000),
      };

      this.logger.log('Payment method attached to customer in Stripe', { 
        customerId, 
        paymentMethodId: result.id 
      });
      return { success: true, data: result };
    } catch (error) {
      this.logger.error('Error attaching payment method in Stripe', { 
        customerId, 
        error: error.message 
      });
      return { success: false, error: error.message };
    }
  }

  // Additional Stripe-specific methods

  async createSubscription(customerId: string, priceId: string, metadata?: Record<string, any>): Promise<IntegrationResponse<any>> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata,
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      this.logger.log('Subscription created in Stripe', { subscriptionId: subscription.id });
      return { success: true, data: subscription };
    } catch (error) {
      this.logger.error('Error creating subscription in Stripe', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async createInvoice(customerId: string, amount: number, currency: string, description?: string): Promise<IntegrationResponse<any>> {
    try {
      const invoice = await this.stripe.invoices.create({
        customer: customerId,
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        description,
        auto_advance: false, // Don't automatically finalize
      });

      this.logger.log('Invoice created in Stripe', { invoiceId: invoice.id });
      return { success: true, data: invoice };
    } catch (error) {
      this.logger.error('Error creating invoice in Stripe', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async finalizeInvoice(invoiceId: string): Promise<IntegrationResponse<any>> {
    try {
      const invoice = await this.stripe.invoices.finalizeInvoice(invoiceId);
      
      this.logger.log('Invoice finalized in Stripe', { invoiceId: invoice.id });
      return { success: true, data: invoice };
    } catch (error) {
      this.logger.error('Error finalizing invoice in Stripe', { invoiceId, error: error.message });
      return { success: false, error: error.message };
    }
  }
}
