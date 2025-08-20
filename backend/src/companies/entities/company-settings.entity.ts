import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';

@Entity('company_settings')
export class CompanySettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @OneToOne(() => Company, company => company.settings)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  // Regional Settings
  @Column({ type: 'varchar', length: 50, default: 'UTC' })
  timezone: string;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', length: 20, default: 'MM/DD/YYYY' })
  dateFormat: string;

  @Column({ type: 'varchar', length: 20, default: 'HH:mm:ss' })
  timeFormat: string;

  @Column({ type: 'varchar', length: 10, default: 'en' })
  language: string;

  @Column({ type: 'varchar', length: 10, default: 'en-US' })
  locale: string;

  // Notification Settings
  @Column({ type: 'jsonb', default: {
    email: true,
    push: true,
    sms: false,
    inApp: true,
    webhook: false,
  }})
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
    webhook: boolean;
  };

  @Column({ type: 'jsonb', default: {
    quotationCreated: true,
    quotationUpdated: true,
    quotationApproved: true,
    quotationRejected: true,
    paymentReceived: true,
    invoiceGenerated: true,
    userInvited: true,
    userRemoved: true,
  }})
  notificationPreferences: {
    quotationCreated: boolean;
    quotationUpdated: boolean;
    quotationApproved: boolean;
    quotationRejected: boolean;
    paymentReceived: boolean;
    invoiceGenerated: boolean;
    userInvited: boolean;
    userRemoved: boolean;
  };

  // Security Settings
  @Column({ type: 'jsonb', default: {
    requireMFA: false,
    sessionTimeout: 3600,
    maxLoginAttempts: 5,
    passwordPolicy: 'medium',
    ipWhitelist: [],
    allowedDomains: [],
  }})
  security: {
    requireMFA: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordPolicy: 'low' | 'medium' | 'high';
    ipWhitelist: string[];
    allowedDomains: string[];
  };

  // Integration Settings
  @Column({ type: 'jsonb', default: {
    crm: false,
    accounting: false,
    payment: false,
    email: false,
    calendar: false,
    storage: false,
  }})
  integrations: {
    crm: boolean;
    accounting: boolean;
    payment: boolean;
    email: boolean;
    calendar: boolean;
    storage: boolean;
  };

  // Business Settings
  @Column({ type: 'jsonb', default: {
    quotationExpiryDays: 30,
    autoArchiveDays: 90,
    requireApproval: false,
    approvalLevels: 1,
    allowDiscounts: true,
    maxDiscountPercentage: 20,
    taxIncluded: false,
    defaultTaxRate: 0,
  }})
  business: {
    quotationExpiryDays: number;
    autoArchiveDays: number;
    requireApproval: boolean;
    approvalLevels: number;
    allowDiscounts: boolean;
    maxDiscountPercentage: number;
    taxIncluded: boolean;
    defaultTaxRate: number;
  };

  // Workflow Settings
  @Column({ type: 'jsonb', default: {
    autoAssignQuotations: false,
    requireClientApproval: false,
    allowClientComments: true,
    requireManagerApproval: false,
    autoNotifyOnStatusChange: true,
  }})
  workflow: {
    autoAssignQuotations: boolean;
    requireClientApproval: boolean;
    allowClientComments: boolean;
    requireManagerApproval: boolean;
    autoNotifyOnStatusChange: boolean;
  };

  // Display Settings
  @Column({ type: 'jsonb', default: {
    showLogo: true,
    showCompanyInfo: true,
    showTerms: true,
    showFooter: true,
    customHeader: null,
    customFooter: null,
    theme: 'light',
    sidebarCollapsed: false,
  }})
  display: {
    showLogo: boolean;
    showCompanyInfo: boolean;
    showTerms: boolean;
    showFooter: boolean;
    customHeader: string | null;
    customFooter: string | null;
    theme: 'light' | 'dark' | 'auto';
    sidebarCollapsed: boolean;
  };

  // API Settings
  @Column({ type: 'jsonb', default: {
    enabled: false,
    rateLimit: 1000,
    webhookUrl: null,
    webhookSecret: null,
    allowedOrigins: [],
  }})
  api: {
    enabled: boolean;
    rateLimit: number;
    webhookUrl: string | null;
    webhookSecret: string | null;
    allowedOrigins: string[];
  };

  // Backup Settings
  @Column({ type: 'jsonb', default: {
    autoBackup: true,
    backupFrequency: 'daily',
    retentionDays: 30,
    includeFiles: true,
    includeDatabase: true,
  }})
  backup: {
    autoBackup: boolean;
    backupFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
    retentionDays: number;
    includeFiles: boolean;
    includeDatabase: boolean;
  };

  // Custom Fields
  @Column({ type: 'jsonb', default: [] })
  customFields: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'boolean' | 'select';
    required: boolean;
    options?: string[];
    defaultValue?: any;
    entity: 'quotation' | 'client' | 'user' | 'company';
  }>;

  // Advanced Settings
  @Column({ type: 'jsonb', default: {
    debugMode: false,
    logLevel: 'info',
    performanceMonitoring: true,
    errorReporting: true,
    analytics: true,
  }})
  advanced: {
    debugMode: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    performanceMonitoring: boolean;
    errorReporting: boolean;
    analytics: boolean;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
