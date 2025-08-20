import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EmailService, EmailOptions } from '../services/email.service';

export interface EmailJobData extends EmailOptions {
  trackingId: string;
  timestamp: Date;
}

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {}

  @Process('send-email')
  async handleSendEmail(job: Job<EmailJobData>): Promise<void> {
    const { trackingId, timestamp, ...emailOptions } = job.data;
    
    this.logger.log('Processing email job', { 
      jobId: job.id, 
      trackingId, 
      to: emailOptions.to 
    });

    try {
      // Send email immediately
      const result = await this.emailService.sendEmailImmediate({
        ...emailOptions,
        trackingId,
      });

      if (result.success) {
        this.logger.log('Email sent successfully', { 
          jobId: job.id, 
          trackingId, 
          to: emailOptions.to 
        });
      } else {
        this.logger.error('Email failed to send', { 
          jobId: job.id, 
          trackingId, 
          error: result.error 
        });
        
        // Mark job as failed
        throw new Error(result.error || 'Email sending failed');
      }
    } catch (error) {
      this.logger.error('Email job processing failed', { 
        jobId: job.id, 
        trackingId, 
        error: error.message 
      });
      
      // Re-throw to mark job as failed
      throw error;
    }
  }

  @Process('send-bulk-emails')
  async handleSendBulkEmails(job: Job<{
    recipients: Array<{ email: string; context?: Record<string, any> }>;
    template: string;
    subject: string;
    category: string;
    scheduledAt?: Date;
    priority?: 'low' | 'normal' | 'high';
  }>): Promise<void> {
    const { recipients, template, subject, category, scheduledAt, priority } = job.data;
    
    this.logger.log('Processing bulk email job', { 
      jobId: job.id, 
      recipientCount: recipients.length,
      template,
      category 
    });

    try {
      const result = await this.emailService.sendBulkEmails({
        recipients,
        template,
        subject,
        category,
        scheduledAt,
        priority,
      });

      if (result.success) {
        this.logger.log('Bulk emails sent successfully', { 
          jobId: job.id, 
          total: result.total,
          successful: result.successful 
        });
      } else {
        this.logger.warn('Some bulk emails failed', { 
          jobId: job.id, 
          total: result.total,
          successful: result.successful,
          failed: result.failed,
          errors: result.errors.slice(0, 5) // Log first 5 errors
        });
      }
    } catch (error) {
      this.logger.error('Bulk email job processing failed', { 
        jobId: job.id, 
        error: error.message 
      });
      
      throw error;
    }
  }

  @Process('retry-failed-emails')
  async handleRetryFailedEmails(job: Job<{ trackingIds: string[] }>): Promise<void> {
    const { trackingIds } = job.data;
    
    this.logger.log('Processing retry failed emails job', { 
      jobId: job.id, 
      trackingCount: trackingIds.length 
    });

    try {
      let retryCount = 0;
      let successCount = 0;

      for (const trackingId of trackingIds) {
        try {
          const tracking = await this.emailService.getEmailTracking(trackingId);
          if (tracking && tracking.status === 'failed') {
            // Re-queue the email for retry
            await this.emailService.sendEmail({
              to: tracking.email,
              subject: tracking.subject,
              template: tracking.template,
              priority: 'high', // High priority for retries
            });
            retryCount++;
          }
        } catch (error) {
          this.logger.error('Failed to retry email', { 
            trackingId, 
            error: error.message 
          });
        }
      }

      this.logger.log('Retry job completed', { 
        jobId: job.id, 
        retryCount,
        successCount 
      });
    } catch (error) {
      this.logger.error('Retry failed emails job processing failed', { 
        jobId: job.id, 
        error: error.message 
      });
      
      throw error;
    }
  }

  @Process('cleanup-old-emails')
  async handleCleanupOldEmails(job: Job<{ daysOld: number }>): Promise<void> {
    const { daysOld } = job.data;
    
    this.logger.log('Processing cleanup old emails job', { 
      jobId: job.id, 
      daysOld 
    });

    try {
      // This would typically clean up old email tracking records
      // For now, just log the cleanup operation
      this.logger.log('Email cleanup job completed', { 
        jobId: job.id, 
        daysOld 
      });
    } catch (error) {
      this.logger.error('Cleanup old emails job processing failed', { 
        jobId: job.id, 
        error: error.message 
      });
      
      throw error;
    }
  }
}
