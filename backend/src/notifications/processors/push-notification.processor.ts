import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PushNotificationService, PushNotificationOptions } from '../services/push-notification.service';
import { DeviceTokenService } from '../services/device-token.service';
import { NotificationTemplateService } from '../services/notification-template.service';

export interface ScheduledNotificationJobData {
  scheduleId: string;
  templateId: string;
  recipients: string[];
  scheduledAt: Date;
  timezone: string;
  repeat?: 'once' | 'daily' | 'weekly' | 'monthly';
  repeatConfig?: {
    interval?: number;
    endDate?: Date;
    daysOfWeek?: number[];
    dayOfMonth?: number;
  };
}

export interface BulkNotificationJobData {
  templateId: string;
  recipients: string[];
  companyId: string;
  variables: Record<string, string>;
  priority?: 'low' | 'normal' | 'high';
  scheduledAt?: Date;
}

export interface TopicNotificationJobData {
  topic: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  companyId: string;
}

@Processor('push-notifications')
export class PushNotificationProcessor {
  private readonly logger = new Logger(PushNotificationProcessor.name);

  constructor(
    private readonly pushNotificationService: PushNotificationService,
    private readonly deviceTokenService: DeviceTokenService,
    private readonly notificationTemplateService: NotificationTemplateService,
  ) {}

  @Process('send-scheduled-notification')
  async handleScheduledNotification(job: Job<ScheduledNotificationJobData>): Promise<void> {
    try {
      const { scheduleId, templateId, recipients, scheduledAt, timezone, repeat, repeatConfig } = job.data;

      this.logger.log('Processing scheduled notification', { scheduleId, templateId, recipients: recipients.length });

      // Get the notification template
      const template = await this.notificationTemplateService.findOne(templateId);
      if (!template.isActive) {
        this.logger.warn('Template is not active, skipping scheduled notification', { templateId });
        return;
      }

      // Get device tokens for recipients
      const deviceTokens: string[] = [];
      for (const userId of recipients) {
        const userTokens = await this.deviceTokenService.getUserDeviceTokens(userId, 'company-id'); // TODO: Get actual company ID
        deviceTokens.push(...userTokens.map(t => t.token));
      }

      if (deviceTokens.length === 0) {
        this.logger.warn('No device tokens found for recipients', { recipients });
        return;
      }

      // Send the notification
      const result = await this.pushNotificationService.sendToMultipleDevices(deviceTokens, {
        title: template.title,
        body: template.body,
        priority: template.priority,
        sound: template.sound,
        icon: template.icon,
        imageUrl: template.imageUrl,
        clickAction: template.clickAction,
        data: template.data,
      });

      this.logger.log('Scheduled notification sent successfully', {
        scheduleId,
        successCount: result.successCount,
        failureCount: result.failureCount,
      });

      // Handle repeat scheduling if needed
      if (repeat && repeat !== 'once') {
        await this.scheduleNextRepeat(job.data);
      }
    } catch (error) {
      this.logger.error('Failed to process scheduled notification', { 
        scheduleId: job.data.scheduleId, 
        error: error.message 
      });
      throw error;
    }
  }

  @Process('send-bulk-notification')
  async handleBulkNotification(job: Job<BulkNotificationJobData>): Promise<void> {
    try {
      const { templateId, recipients, companyId, variables, priority, scheduledAt } = job.data;

      this.logger.log('Processing bulk notification', { templateId, recipients: recipients.length, companyId });

      // Get the notification template
      const template = await this.notificationTemplateService.findOne(templateId);
      if (!template.isActive) {
        this.logger.warn('Template is not active, skipping bulk notification', { templateId });
        return;
      }

      // Render template with variables
      const renderedContent = this.notificationTemplateService.renderTemplate(template, variables);

      // Get device tokens for recipients
      const deviceTokens: string[] = [];
      for (const userId of recipients) {
        const userTokens = await this.deviceTokenService.getUserDeviceTokens(userId, companyId);
        deviceTokens.push(...userTokens.map(t => t.token));
      }

      if (deviceTokens.length === 0) {
        this.logger.warn('No device tokens found for recipients', { recipients });
        return;
      }

      // Send the notification
      const result = await this.pushNotificationService.sendToMultipleDevices(deviceTokens, {
        title: renderedContent.title,
        body: renderedContent.body,
        priority: priority || template.priority,
        sound: template.sound,
        icon: template.icon,
        imageUrl: template.imageUrl,
        clickAction: template.clickAction,
        data: template.data,
      });

      this.logger.log('Bulk notification sent successfully', {
        templateId,
        successCount: result.successCount,
        failureCount: result.failureCount,
      });
    } catch (error) {
      this.logger.error('Failed to process bulk notification', { 
        templateId: job.data.templateId, 
        error: error.message 
      });
      throw error;
    }
  }

  @Process('send-topic-notification')
  async handleTopicNotification(job: Job<TopicNotificationJobData>): Promise<void> {
    try {
      const { topic, title, body, data, companyId } = job.data;

      this.logger.log('Processing topic notification', { topic, companyId });

      // Send the notification to the topic
      const result = await this.pushNotificationService.sendToTopic(topic, {
        title,
        body,
        data,
      });

      this.logger.log('Topic notification sent successfully', { topic, messageId: result.messageId });
    } catch (error) {
      this.logger.error('Failed to process topic notification', { 
        topic: job.data.topic, 
        error: error.message 
      });
      throw error;
    }
  }

  @Process('cleanup-inactive-tokens')
  async handleCleanupInactiveTokens(job: Job<{ daysInactive: number }>): Promise<void> {
    try {
      const { daysInactive } = job.data;

      this.logger.log('Processing cleanup of inactive tokens', { daysInactive });

      // Clean up inactive tokens
      const result = await this.deviceTokenService.cleanupInactiveTokens(daysInactive);

      this.logger.log('Inactive tokens cleanup completed', {
        removed: result.removed,
        errors: result.errors.length,
      });
    } catch (error) {
      this.logger.error('Failed to cleanup inactive tokens', error);
      throw error;
    }
  }

  @Process('retry-failed-notifications')
  async handleRetryFailedNotifications(job: Job<{ notificationIds: string[] }>): Promise<void> {
    try {
      const { notificationIds } = job.data;

      this.logger.log('Processing retry of failed notifications', { count: notificationIds.length });

      // This would typically involve retrying failed notifications
      // For now, just log the attempt
      this.logger.log('Retry attempt completed', { notificationIds });
    } catch (error) {
      this.logger.error('Failed to retry failed notifications', error);
      throw error;
    }
  }

  @Process('send-welcome-notification')
  async handleWelcomeNotification(job: Job<{ userId: string; companyId: string; userName: string }>): Promise<void> {
    try {
      const { userId, companyId, userName } = job.data;

      this.logger.log('Processing welcome notification', { userId, companyId, userName });

      // Get the welcome template
      const template = await this.notificationTemplateService.findByName('user_invited');
      if (!template || !template.isActive) {
        this.logger.warn('Welcome template not found or inactive, skipping notification');
        return;
      }

      // Get user's device tokens
      const userTokens = await this.deviceTokenService.getUserDeviceTokens(userId, companyId);
      if (userTokens.length === 0) {
        this.logger.warn('No device tokens found for user', { userId });
        return;
      }

      // Render template with variables
      const renderedContent = this.notificationTemplateService.renderTemplate(template, {
        inviterName: 'System',
        companyName: 'Your Company', // TODO: Get actual company name
      });

      // Send the notification
      const result = await this.pushNotificationService.sendToMultipleDevices(
        userTokens.map(t => t.token),
        {
          title: renderedContent.title,
          body: renderedContent.body,
          priority: template.priority,
          sound: template.sound,
          icon: template.icon,
          imageUrl: template.imageUrl,
          clickAction: template.clickAction,
          data: template.data,
        }
      );

      this.logger.log('Welcome notification sent successfully', {
        userId,
        successCount: result.successCount,
        failureCount: result.failureCount,
      });
    } catch (error) {
      this.logger.error('Failed to process welcome notification', { 
        userId: job.data.userId, 
        error: error.message 
      });
      throw error;
    }
  }

  @Process('send-quotation-notification')
  async handleQuotationNotification(job: Job<{
    templateName: string;
    userId: string;
    companyId: string;
    variables: Record<string, string>;
  }>): Promise<void> {
    try {
      const { templateName, userId, companyId, variables } = job.data;

      this.logger.log('Processing quotation notification', { templateName, userId, companyId });

      // Get the quotation template
      const template = await this.notificationTemplateService.findByName(templateName);
      if (!template || !template.isActive) {
        this.logger.warn('Quotation template not found or inactive', { templateName });
        return;
      }

      // Get user's device tokens
      const userTokens = await this.deviceTokenService.getUserDeviceTokens(userId, companyId);
      if (userTokens.length === 0) {
        this.logger.warn('No device tokens found for user', { userId });
        return;
      }

      // Render template with variables
      const renderedContent = this.notificationTemplateService.renderTemplate(template, variables);

      // Send the notification
      const result = await this.pushNotificationService.sendToMultipleDevices(
        userTokens.map(t => t.token),
        {
          title: renderedContent.title,
          body: renderedContent.body,
          priority: template.priority,
          sound: template.sound,
          icon: template.icon,
          imageUrl: template.imageUrl,
          clickAction: template.clickAction,
          data: template.data,
        }
      );

      this.logger.log('Quotation notification sent successfully', {
        templateName,
        userId,
        successCount: result.successCount,
        failureCount: result.failureCount,
      });
    } catch (error) {
      this.logger.error('Failed to process quotation notification', { 
        templateName: job.data.templateName, 
        userId: job.data.userId,
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Schedule the next repeat notification
   */
  private async scheduleNextRepeat(scheduleData: ScheduledNotificationJobData): Promise<void> {
    try {
      const { repeat, repeatConfig, scheduledAt } = scheduleData;
      
      if (!repeat || repeat === 'once') {
        return;
      }

      let nextScheduledAt: Date;

      switch (repeat) {
        case 'daily':
          nextScheduledAt = new Date(scheduledAt);
          nextScheduledAt.setDate(nextScheduledAt.getDate() + (repeatConfig?.interval || 1));
          break;

        case 'weekly':
          nextScheduledAt = new Date(scheduledAt);
          nextScheduledAt.setDate(nextScheduledAt.getDate() + 7 * (repeatConfig?.interval || 1));
          break;

        case 'monthly':
          nextScheduledAt = new Date(scheduledAt);
          nextScheduledAt.setMonth(nextScheduledAt.getMonth() + (repeatConfig?.interval || 1));
          break;

        default:
          return;
      }

      // Check if we've reached the end date
      if (repeatConfig?.endDate && nextScheduledAt > repeatConfig.endDate) {
        this.logger.log('Reached end date for repeat notification', { scheduleId: scheduleData.scheduleId });
        return;
      }

      // Schedule the next notification
      await this.pushNotificationService.scheduleNotification({
        ...scheduleData,
        scheduledAt: nextScheduledAt,
      });

      this.logger.log('Next repeat notification scheduled', {
        scheduleId: scheduleData.scheduleId,
        nextScheduledAt,
      });
    } catch (error) {
      this.logger.error('Failed to schedule next repeat notification', error);
    }
  }
}
