import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface EmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  template?: string;
  context?: Record<string, any>;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  priority?: 'low' | 'normal' | 'high';
  scheduledAt?: Date;
  trackingId?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlTemplate: string;
  textTemplate: string;
  variables: string[];
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailTracking {
  id: string;
  trackingId: string;
  email: string;
  subject: string;
  template?: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bouncedAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnsubscribeRecord {
  id: string;
  email: string;
  category?: string;
  reason?: string;
  unsubscribedAt: Date;
  isActive: boolean;
}

export interface BulkEmailOptions {
  recipients: Array<{
    email: string;
    context?: Record<string, any>;
    metadata?: Record<string, any>;
  }>;
  template: string;
  subject: string;
  category: string;
  scheduledAt?: Date;
  priority?: 'low' | 'normal' | 'high';
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private templates: Map<string, EmailTemplate> = new Map();
  private trackingRecords: Map<string, EmailTracking> = new Map();
  private unsubscribeRecords: Map<string, UnsubscribeRecord> = new Map();

  constructor(
    private configService: ConfigService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {
    this.initializeTransporter();
    this.loadEmailTemplates();
  }

  /**
   * Initialize email transporter
   */
  private async initializeTransporter(): Promise<void> {
    try {
      const emailConfig = {
        host: this.configService.get('email.host', 'smtp.gmail.com'),
        port: this.configService.get('email.port', 587),
        secure: this.configService.get('email.secure', false),
        auth: {
          user: this.configService.get('email.user'),
          pass: this.configService.get('email.password'),
        },
        tls: {
          rejectUnauthorized: this.configService.get('email.tls.rejectUnauthorized', false),
        },
      };

      this.transporter = nodemailer.createTransporter(emailConfig);

      // Verify connection
      await this.transporter.verify();
      this.logger.log('Email transporter initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize email transporter', error);
      throw error;
    }
  }

  /**
   * Load email templates from storage
   */
  private async loadEmailTemplates(): Promise<void> {
    try {
      // Load default templates
      const defaultTemplates: EmailTemplate[] = [
        {
          id: 'welcome',
          name: 'Welcome Email',
          subject: 'Welcome to {{companyName}}',
          htmlTemplate: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Welcome</title>
            </head>
            <body>
              <h1>Welcome {{firstName}}!</h1>
              <p>Thank you for joining {{companyName}}.</p>
              <p>We're excited to have you on board!</p>
            </body>
            </html>
          `,
          textTemplate: 'Welcome {{firstName}}! Thank you for joining {{companyName}}.',
          variables: ['firstName', 'companyName'],
          category: 'account',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'password-reset',
          name: 'Password Reset',
          subject: 'Password Reset Request',
          htmlTemplate: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Password Reset</title>
            </head>
            <body>
              <h1>Password Reset Request</h1>
              <p>Hello {{firstName}},</p>
              <p>You requested a password reset. Click the link below to reset your password:</p>
              <a href="{{resetLink}}">Reset Password</a>
              <p>This link will expire in {{expiryHours}} hours.</p>
            </body>
            </html>
          `,
          textTemplate: 'Hello {{firstName}}, You requested a password reset. Click {{resetLink}} to reset your password. This link expires in {{expiryHours}} hours.',
          variables: ['firstName', 'resetLink', 'expiryHours'],
          category: 'security',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'quotation-created',
          name: 'Quotation Created',
          subject: 'New Quotation: {{quotationNumber}}',
          htmlTemplate: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Quotation Created</title>
            </head>
            <body>
              <h1>Quotation Created</h1>
              <p>Hello {{clientName}},</p>
              <p>A new quotation has been created for you:</p>
              <ul>
                <li><strong>Quotation Number:</strong> {{quotationNumber}}</li>
                <li><strong>Amount:</strong> {{amount}}</li>
                <li><strong>Valid Until:</strong> {{validUntil}}</li>
              </ul>
              <p>View your quotation: <a href="{{quotationLink}}">Click here</a></p>
            </body>
            </html>
          `,
          textTemplate: 'Hello {{clientName}}, A new quotation {{quotationNumber}} has been created for you. Amount: {{amount}}, Valid until: {{validUntil}}. View at: {{quotationLink}}',
          variables: ['clientName', 'quotationNumber', 'amount', 'validUntil', 'quotationLink'],
          category: 'business',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'approval-request',
          name: 'Approval Request',
          subject: 'Approval Required: {{quotationNumber}}',
          htmlTemplate: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Approval Request</title>
            </head>
            <body>
              <h1>Approval Required</h1>
              <p>Hello {{approverName}},</p>
              <p>A quotation requires your approval:</p>
              <ul>
                <li><strong>Quotation Number:</strong> {{quotationNumber}}</li>
                <li><strong>Client:</strong> {{clientName}}</li>
                <li><strong>Amount:</strong> {{amount}}</li>
                <li><strong>Requested By:</strong> {{requestedBy}}</li>
              </ul>
              <p>Please review and approve: <a href="{{approvalLink}}">Click here</a></p>
            </body>
            </html>
          `,
          textTemplate: 'Hello {{approverName}}, Quotation {{quotationNumber}} for {{clientName}} ({{amount}}) requires your approval. Review at: {{approvalLink}}',
          variables: ['approverName', 'quotationNumber', 'clientName', 'amount', 'requestedBy', 'approvalLink'],
          category: 'business',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Store templates
      defaultTemplates.forEach(template => {
        this.templates.set(template.id, template);
      });

      this.logger.log(`Loaded ${defaultTemplates.length} email templates`);
    } catch (error) {
      this.logger.error('Failed to load email templates', error);
    }
  }

  /**
   * Send email using template
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; trackingId?: string; error?: string }> {
    try {
      // Check if email is unsubscribed
      if (await this.isEmailUnsubscribed(options.to as string, options.template)) {
        this.logger.log(`Email ${options.to} is unsubscribed from ${options.template}`);
        return { success: false, error: 'Email unsubscribed' };
      }

      // Generate tracking ID
      const trackingId = options.trackingId || this.generateTrackingId();

      // Add email to queue for processing
      await this.emailQueue.add('send-email', {
        ...options,
        trackingId,
        timestamp: new Date(),
      }, {
        priority: this.getPriorityValue(options.priority),
        delay: options.scheduledAt ? options.scheduledAt.getTime() - Date.now() : 0,
      });

      // Create tracking record
      await this.createTrackingRecord(trackingId, options);

      this.logger.log('Email queued successfully', { 
        to: options.to, 
        subject: options.subject, 
        trackingId 
      });

      return { success: true, trackingId };
    } catch (error) {
      this.logger.error('Failed to queue email', { 
        to: options.to, 
        error: error.message 
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Send email immediately (bypass queue)
   */
  async sendEmailImmediate(options: EmailOptions): Promise<{ success: boolean; trackingId?: string; error?: string }> {
    try {
      // Check if email is unsubscribed
      if (await this.isEmailUnsubscribed(options.to as string, options.template)) {
        this.logger.log(`Email ${options.to} is unsubscribed from ${options.template}`);
        return { success: false, error: 'Email unsubscribed' };
      }

      // Generate tracking ID
      const trackingId = options.trackingId || this.generateTrackingId();

      // Create tracking record
      await this.createTrackingRecord(trackingId, options);

      // Prepare email content
      const emailContent = await this.prepareEmailContent(options);

      // Send email
      const result = await this.transporter.sendMail({
        from: this.configService.get('email.from', 'noreply@company.com'),
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        attachments: options.attachments,
        headers: {
          'X-Tracking-ID': trackingId,
          'List-Unsubscribe': `<mailto:unsubscribe@company.com?subject=unsubscribe-${options.template || 'general'}>`,
        },
      });

      // Update tracking record
      await this.updateTrackingStatus(trackingId, 'sent', { messageId: result.messageId });

      this.logger.log('Email sent successfully', { 
        to: options.to, 
        subject: options.subject, 
        trackingId,
        messageId: result.messageId 
      });

      return { success: true, trackingId };
    } catch (error) {
      this.logger.error('Failed to send email', { 
        to: options.to, 
        error: error.message 
      });

      // Update tracking record
      if (options.trackingId) {
        await this.updateTrackingStatus(options.trackingId, 'failed', { errorMessage: error.message });
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(options: BulkEmailOptions): Promise<{ success: boolean; total: number; successful: number; failed: number; errors: string[] }> {
    try {
      const { recipients, template, subject, category, scheduledAt, priority } = options;
      const results = [];
      const errors = [];

      for (const recipient of recipients) {
        try {
          const emailOptions: EmailOptions = {
            to: recipient.email,
            subject,
            template,
            context: recipient.context,
            metadata: recipient.metadata,
            scheduledAt,
            priority,
          };

          const result = await this.sendEmail(emailOptions);
          results.push({ email: recipient.email, ...result });

          if (!result.success) {
            errors.push(`${recipient.email}: ${result.error}`);
          }
        } catch (error) {
          errors.push(`${recipient.email}: ${error.message}`);
          results.push({ email: recipient.email, success: false, error: error.message });
        }
      }

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      this.logger.log('Bulk email operation completed', { 
        total: recipients.length, 
        successful, 
        failed 
      });

      return {
        success: failed === 0,
        total: recipients.length,
        successful,
        failed,
        errors,
      };
    } catch (error) {
      this.logger.error('Failed to send bulk emails', error);
      return {
        success: false,
        total: 0,
        successful: 0,
        failed: 0,
        errors: [error.message],
      };
    }
  }

  /**
   * Prepare email content from template
   */
  private async prepareEmailContent(options: EmailOptions): Promise<{ subject: string; html: string; text: string }> {
    let subject = options.subject;
    let html = options.html;
    let text = options.text;

    if (options.template) {
      const template = this.templates.get(options.template);
      if (!template) {
        throw new Error(`Template ${options.template} not found`);
      }

      const context = options.context || {};
      
      // Compile templates
      const htmlTemplate = handlebars.compile(template.htmlTemplate);
      const textTemplate = handlebars.compile(template.textTemplate);
      const subjectTemplate = handlebars.compile(template.subject);

      // Render templates
      subject = subjectTemplate(context);
      html = htmlTemplate(context);
      text = textTemplate(context);
    }

    return { subject, html, text };
  }

  /**
   * Create email template
   */
  async createEmailTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> {
    try {
      const newTemplate: EmailTemplate = {
        ...template,
        id: this.generateTemplateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.templates.set(newTemplate.id, newTemplate);
      this.logger.log('Email template created', { templateId: newTemplate.id, name: newTemplate.name });

      return newTemplate;
    } catch (error) {
      this.logger.error('Failed to create email template', error);
      throw error;
    }
  }

  /**
   * Update email template
   */
  async updateEmailTemplate(templateId: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        return null;
      }

      const updatedTemplate: EmailTemplate = {
        ...template,
        ...updates,
        updatedAt: new Date(),
      };

      this.templates.set(templateId, updatedTemplate);
      this.logger.log('Email template updated', { templateId, name: updatedTemplate.name });

      return updatedTemplate;
    } catch (error) {
      this.logger.error('Failed to update email template', error);
      throw error;
    }
  }

  /**
   * Get email template
   */
  async getEmailTemplate(templateId: string): Promise<EmailTemplate | null> {
    return this.templates.get(templateId) || null;
  }

  /**
   * List all email templates
   */
  async listEmailTemplates(category?: string): Promise<EmailTemplate[]> {
    let templates = Array.from(this.templates.values());
    
    if (category) {
      templates = templates.filter(t => t.category === category);
    }

    return templates;
  }

  /**
   * Delete email template
   */
  async deleteEmailTemplate(templateId: string): Promise<boolean> {
    try {
      const deleted = this.templates.delete(templateId);
      if (deleted) {
        this.logger.log('Email template deleted', { templateId });
      }
      return deleted;
    } catch (error) {
      this.logger.error('Failed to delete email template', error);
      throw error;
    }
  }

  /**
   * Track email open
   */
  async trackEmailOpen(trackingId: string): Promise<void> {
    try {
      await this.updateTrackingStatus(trackingId, 'opened');
      this.logger.log('Email opened tracked', { trackingId });
    } catch (error) {
      this.logger.error('Failed to track email open', error);
    }
  }

  /**
   * Track email click
   */
  async trackEmailClick(trackingId: string, url: string): Promise<void> {
    try {
      await this.updateTrackingStatus(trackingId, 'clicked', { clickedUrl: url });
      this.logger.log('Email click tracked', { trackingId, url });
    } catch (error) {
      this.logger.error('Failed to track email click', error);
    }
  }

  /**
   * Get email tracking information
   */
  async getEmailTracking(trackingId: string): Promise<EmailTracking | null> {
    return this.trackingRecords.get(trackingId) || null;
  }

  /**
   * Get email statistics
   */
  async getEmailStats(timeRange: { start: Date; end: Date }): Promise<{
    total: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    failed: number;
    openRate: number;
    clickRate: number;
  }> {
    try {
      const records = Array.from(this.trackingRecords.values()).filter(
        record => record.createdAt >= timeRange.start && record.createdAt <= timeRange.end
      );

      const total = records.length;
      const sent = records.filter(r => r.status === 'sent').length;
      const delivered = records.filter(r => r.status === 'delivered').length;
      const opened = records.filter(r => r.status === 'opened').length;
      const clicked = records.filter(r => r.status === 'clicked').length;
      const bounced = records.filter(r => r.status === 'bounced').length;
      const failed = records.filter(r => r.status === 'failed').length;

      const openRate = delivered > 0 ? (opened / delivered) * 100 : 0;
      const clickRate = opened > 0 ? (clicked / opened) * 100 : 0;

      return {
        total,
        sent,
        delivered,
        opened,
        clicked,
        bounced,
        failed,
        openRate: Math.round(openRate * 100) / 100,
        clickRate: Math.round(clickRate * 100) / 100,
      };
    } catch (error) {
      this.logger.error('Failed to get email stats', error);
      return {
        total: 0,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        failed: 0,
        openRate: 0,
        clickRate: 0,
      };
    }
  }

  /**
   * Unsubscribe email from category
   */
  async unsubscribeEmail(email: string, category?: string, reason?: string): Promise<void> {
    try {
      const unsubscribeRecord: UnsubscribeRecord = {
        id: this.generateUnsubscribeId(),
        email,
        category,
        reason,
        unsubscribedAt: new Date(),
        isActive: true,
      };

      this.unsubscribeRecords.set(unsubscribeRecord.id, unsubscribeRecord);
      this.logger.log('Email unsubscribed', { email, category, reason });
    } catch (error) {
      this.logger.error('Failed to unsubscribe email', error);
      throw error;
    }
  }

  /**
   * Resubscribe email
   */
  async resubscribeEmail(email: string, category?: string): Promise<void> {
    try {
      const records = Array.from(this.unsubscribeRecords.values()).filter(
        record => record.email === email && record.isActive
      );

      if (category) {
        records.filter(r => r.category === category).forEach(r => {
          r.isActive = false;
        });
      } else {
        records.forEach(r => {
          r.isActive = false;
        });
      }

      this.logger.log('Email resubscribed', { email, category });
    } catch (error) {
      this.logger.error('Failed to resubscribe email', error);
      throw error;
    }
  }

  /**
   * Check if email is unsubscribed
   */
  async isEmailUnsubscribed(email: string, category?: string): Promise<boolean> {
    try {
      const records = Array.from(this.unsubscribeRecords.values()).filter(
        record => record.email === email && record.isActive
      );

      if (category) {
        return records.some(r => r.category === category || r.category === undefined);
      }

      return records.some(r => r.category === undefined);
    } catch (error) {
      this.logger.error('Failed to check unsubscribe status', error);
      return false;
    }
  }

  /**
   * Get unsubscribe list
   */
  async getUnsubscribeList(category?: string): Promise<UnsubscribeRecord[]> {
    try {
      let records = Array.from(this.unsubscribeRecords.values()).filter(r => r.isActive);

      if (category) {
        records = records.filter(r => r.category === category || r.category === undefined);
      }

      return records;
    } catch (error) {
      this.logger.error('Failed to get unsubscribe list', error);
      return [];
    }
  }

  // Private helper methods

  private generateTrackingId(): string {
    return `track_${Date.now()}_${uuidv4().substr(0, 8)}`;
  }

  private generateTemplateId(): string {
    return `tpl_${Date.now()}_${uuidv4().substr(0, 8)}`;
  }

  private generateUnsubscribeId(): string {
    return `unsub_${Date.now()}_${uuidv4().substr(0, 8)}`;
  }

  private getPriorityValue(priority?: 'low' | 'normal' | 'high'): number {
    switch (priority) {
      case 'high': return 1;
      case 'low': return 10;
      default: return 5;
    }
  }

  private async createTrackingRecord(trackingId: string, options: EmailOptions): Promise<void> {
    const tracking: EmailTracking = {
      id: this.generateTrackingId(),
      trackingId,
      email: Array.isArray(options.to) ? options.to[0] : options.to,
      subject: options.subject,
      template: options.template,
      status: 'pending',
      metadata: {
        cc: options.cc,
        bcc: options.bcc,
        priority: options.priority,
        scheduledAt: options.scheduledAt,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.trackingRecords.set(trackingId, tracking);
  }

  private async updateTrackingStatus(trackingId: string, status: EmailTracking['status'], additionalData?: Record<string, any>): Promise<void> {
    const tracking = this.trackingRecords.get(trackingId);
    if (tracking) {
      tracking.status = status;
      tracking.updatedAt = new Date();

      // Set timestamp based on status
      switch (status) {
        case 'sent':
          tracking.sentAt = new Date();
          break;
        case 'delivered':
          tracking.deliveredAt = new Date();
          break;
        case 'opened':
          tracking.openedAt = new Date();
          break;
        case 'clicked':
          tracking.clickedAt = new Date();
          break;
        case 'bounced':
          tracking.bouncedAt = new Date();
          break;
        case 'failed':
          tracking.failedAt = new Date();
          break;
      }

      // Add additional data
      if (additionalData) {
        Object.assign(tracking, additionalData);
      }
    }
  }
}
