export interface IntegrationConfig {
  id: string;
  name: string;
  type: IntegrationType;
  isActive: boolean;
  credentials: Record<string, any>;
  settings: Record<string, any>;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationType {
  category: 'crm' | 'accounting' | 'payment' | 'email' | 'calendar' | 'other';
  provider: string;
  version: string;
  capabilities: string[];
}

export interface IntegrationResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    requestId: string;
    timestamp: Date;
    duration: number;
    rateLimit?: {
      remaining: number;
      reset: Date;
    };
  };
}

export interface IntegrationProvider {
  readonly name: string;
  readonly type: IntegrationType;
  
  initialize(config: IntegrationConfig): Promise<void>;
  testConnection(): Promise<IntegrationResponse>;
  getCapabilities(): string[];
  isFeatureSupported(feature: string): boolean;
}

export interface CRMINtegration extends IntegrationProvider {
  readonly type: IntegrationType & { category: 'crm' };
  
  createContact(contact: ContactData): Promise<IntegrationResponse<ContactResult>>;
  updateContact(contactId: string, updates: Partial<ContactData>): Promise<IntegrationResponse<ContactResult>>;
  getContact(contactId: string): Promise<IntegrationResponse<ContactResult>>;
  searchContacts(query: string): Promise<IntegrationResponse<ContactResult[]>>;
  createDeal(deal: DealData): Promise<IntegrationResponse<DealResult>>;
  updateDeal(dealId: string, updates: Partial<DealData>): Promise<IntegrationResponse<DealResult>>;
  getDeal(dealId: string): Promise<IntegrationResponse<DealResult>>;
}

export interface AccountingIntegration extends IntegrationProvider {
  readonly type: IntegrationType & { category: 'accounting' };
  
  createInvoice(invoice: InvoiceData): Promise<IntegrationResponse<InvoiceResult>>;
  updateInvoice(invoiceId: string, updates: Partial<InvoiceData>): Promise<IntegrationResponse<InvoiceResult>>;
  getInvoice(invoiceId: string): Promise<IntegrationResponse<InvoiceResult>>;
  createCustomer(customer: CustomerData): Promise<IntegrationResponse<CustomerResult>>;
  updateCustomer(customerId: string, updates: Partial<CustomerData>): Promise<IntegrationResponse<CustomerResult>>;
  getCustomer(customerId: string): Promise<IntegrationResponse<CustomerResult>>;
  syncChartOfAccounts(): Promise<IntegrationResponse<AccountResult[]>>;
}

export interface PaymentIntegration extends IntegrationProvider {
  readonly type: IntegrationType & { category: 'payment' };
  
  createPaymentIntent(amount: number, currency: string, metadata?: Record<string, any>): Promise<IntegrationResponse<PaymentIntentResult>>;
  processPayment(paymentData: PaymentData): Promise<IntegrationResponse<PaymentResult>>;
  refundPayment(paymentId: string, amount?: number): Promise<IntegrationResponse<RefundResult>>;
  getPayment(paymentId: string): Promise<IntegrationResponse<PaymentResult>>;
  createCustomer(customer: CustomerData): Promise<IntegrationResponse<CustomerResult>>;
  attachPaymentMethod(customerId: string, paymentMethod: PaymentMethodData): Promise<IntegrationResponse<PaymentMethodResult>>;
}

export interface EmailIntegration extends IntegrationProvider {
  readonly type: IntegrationType & { category: 'email' };
  
  sendEmail(email: EmailData): Promise<IntegrationResponse<EmailResult>>;
  sendBulkEmail(emails: EmailData[]): Promise<IntegrationResponse<BulkEmailResult>>;
  createCampaign(campaign: CampaignData): Promise<IntegrationResponse<CampaignResult>>;
  getEmailStats(campaignId?: string): Promise<IntegrationResponse<EmailStatsResult>>;
  addSubscriber(listId: string, subscriber: SubscriberData): Promise<IntegrationResponse<SubscriberResult>>;
  removeSubscriber(listId: string, email: string): Promise<IntegrationResponse<void>>;
}

export interface CalendarIntegration extends IntegrationProvider {
  readonly type: IntegrationType & { category: 'calendar' };
  
  createEvent(event: EventData): Promise<IntegrationResponse<EventResult>>;
  updateEvent(eventId: string, updates: Partial<EventData>): Promise<IntegrationResponse<EventResult>>;
  deleteEvent(eventId: string): Promise<IntegrationResponse<void>>;
  getEvent(eventId: string): Promise<IntegrationResponse<EventResult>>;
  listEvents(calendarId: string, timeMin?: Date, timeMax?: Date): Promise<IntegrationResponse<EventResult[]>>;
  getAvailableSlots(calendarId: string, duration: number, startDate: Date, endDate: Date): Promise<IntegrationResponse<TimeSlotResult[]>>;
  createCalendar(calendar: CalendarData): Promise<IntegrationResponse<CalendarResult>>;
}

// Data interfaces
export interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  address?: AddressData;
  customFields?: Record<string, any>;
}

export interface DealData {
  name: string;
  amount: number;
  currency: string;
  stage: string;
  contactId?: string;
  companyId?: string;
  closeDate?: Date;
  description?: string;
  customFields?: Record<string, any>;
}

export interface InvoiceData {
  number: string;
  customerId: string;
  amount: number;
  currency: string;
  dueDate: Date;
  items: InvoiceItemData[];
  notes?: string;
  customFields?: Record<string, any>;
}

export interface CustomerData {
  name: string;
  email: string;
  phone?: string;
  address?: AddressData;
  taxId?: string;
  customFields?: Record<string, any>;
}

export interface PaymentData {
  amount: number;
  currency: string;
  customerId: string;
  paymentMethodId?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface EmailData {
  to: string | string[];
  subject: string;
  body: string;
  from?: string;
  replyTo?: string;
  attachments?: AttachmentData[];
  templateId?: string;
  variables?: Record<string, any>;
}

export interface EventData {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees?: string[];
  location?: string;
  calendarId?: string;
  reminders?: ReminderData[];
}

export interface AddressData {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface InvoiceItemData {
  name: string;
  quantity: number;
  unitPrice: number;
  description?: string;
}

export interface PaymentMethodData {
  type: 'card' | 'bank_account' | 'paypal';
  token: string;
  metadata?: Record<string, any>;
}

export interface CampaignData {
  name: string;
  subject: string;
  listId: string;
  templateId?: string;
  variables?: Record<string, any>;
}

export interface SubscriberData {
  email: string;
  firstName?: string;
  lastName?: string;
  customFields?: Record<string, any>;
}

export interface CalendarData {
  name: string;
  description?: string;
  timezone?: string;
  color?: string;
}

export interface ReminderData {
  type: 'email' | 'popup';
  minutes: number;
}

export interface AttachmentData {
  filename: string;
  content: Buffer;
  contentType: string;
}

// Result interfaces
export interface ContactResult {
  id: string;
  externalId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DealResult {
  id: string;
  externalId: string;
  name: string;
  amount: number;
  currency: string;
  stage: string;
  closeDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceResult {
  id: string;
  externalId: string;
  number: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerResult {
  id: string;
  externalId: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentIntentResult {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret?: string;
  createdAt: Date;
}

export interface PaymentResult {
  id: string;
  externalId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethodId?: string;
  createdAt: Date;
}

export interface RefundResult {
  id: string;
  amount: number;
  status: string;
  createdAt: Date;
}

export interface PaymentMethodResult {
  id: string;
  type: string;
  last4?: string;
  brand?: string;
  createdAt: Date;
}

export interface EmailResult {
  id: string;
  externalId: string;
  status: string;
  sentAt: Date;
}

export interface BulkEmailResult {
  batchId: string;
  totalSent: number;
  totalFailed: number;
  results: EmailResult[];
}

export interface CampaignResult {
  id: string;
  externalId: string;
  name: string;
  status: string;
  createdAt: Date;
}

export interface EmailStatsResult {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
}

export interface SubscriberResult {
  id: string;
  email: string;
  status: string;
  subscribedAt: Date;
}

export interface EventResult {
  id: string;
  externalId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlotResult {
  startTime: Date;
  endTime: Date;
  available: boolean;
}

export interface CalendarResult {
  id: string;
  externalId: string;
  name: string;
  description?: string;
  timezone?: string;
  createdAt: Date;
}

export interface AccountResult {
  id: string;
  externalId: string;
  name: string;
  type: string;
  number?: string;
  balance?: number;
  currency?: string;
}
