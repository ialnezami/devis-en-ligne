import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

export interface PushNotificationOptions {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  icon?: string;
  badge?: string;
  sound?: string;
  clickAction?: string;
  priority?: 'normal' | 'high';
  timeToLive?: number;
  collapseKey?: string;
  android?: {
    channelId?: string;
    priority?: 'normal' | 'high';
    sound?: string;
    icon?: string;
    color?: string;
    clickAction?: string;
    tag?: string;
    bodyLocKey?: string;
    bodyLocArgs?: string[];
    titleLocKey?: string;
    titleLocArgs?: string[];
  };
  apns?: {
    alert?: {
      title?: string;
      body?: string;
      subtitle?: string;
    };
    badge?: number;
    sound?: string;
    category?: string;
    threadId?: string;
    contentAvailable?: boolean;
    mutableContent?: boolean;
  };
  webpush?: {
    headers?: Record<string, string>;
    data?: Record<string, string>;
    actions?: Array<{
      action: string;
      title: string;
      icon?: string;
    }>;
    badge?: string;
    icon?: string;
    image?: string;
    tag?: string;
    requireInteraction?: boolean;
    silent?: boolean;
  };
}

export interface DeviceToken {
  id: string;
  userId: string;
  companyId: string;
  token: string;
  platform: 'android' | 'ios' | 'web';
  deviceId: string;
  deviceName?: string;
  appVersion?: string;
  osVersion?: string;
  isActive: boolean;
  lastUsed: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  category: string;
  isActive: boolean;
  variables: string[];
  platforms: ('android' | 'ios' | 'web')[];
  priority: 'low' | 'normal' | 'high';
  sound?: string;
  icon?: string;
  imageUrl?: string;
  clickAction?: string;
  data?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSchedule {
  id: string;
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
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  sentCount: number;
  failedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private firebaseApp: admin.app.App;
  private messaging: admin.messaging.Messaging;

  constructor(
    private configService: ConfigService,
    @InjectQueue('push-notifications') private pushNotificationQueue: Queue,
  ) {
    this.initializeFirebase();
  }

  private initializeFirebase(): void {
    try {
      // Initialize Firebase Admin SDK
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
          clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
          privateKey: this.configService.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
        }),
        projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
      });

      this.messaging = this.firebaseApp.messaging();
      this.logger.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', error);
      throw error;
    }
  }

  /**
   * Send push notification to a single device
   */
  async sendToDevice(
    token: string,
    options: PushNotificationOptions,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const message: admin.messaging.Message = {
        token,
        notification: {
          title: options.title,
          body: options.body,
          imageUrl: options.imageUrl,
        },
        data: options.data,
        android: options.android ? {
          priority: options.android.priority || 'normal',
          notification: {
            channelId: options.android.channelId || 'default',
            sound: options.android.sound,
            icon: options.android.icon,
            color: options.android.color,
            clickAction: options.android.clickAction,
            tag: options.android.tag,
            bodyLocKey: options.android.bodyLocKey,
            bodyLocArgs: options.android.bodyLocArgs,
            titleLocKey: options.android.titleLocKey,
            titleLocArgs: options.android.titleLocArgs,
          },
        } : undefined,
                 apns: options.apns ? {
           payload: {
             aps: {
               alert: options.apns.alert,
               badge: options.apns.badge,
               sound: options.apns.sound,
               category: options.apns.category,
             },
           },
         } : undefined,
                 webpush: options.webpush ? {
           headers: options.webpush.headers,
           data: options.webpush.data,
         } : undefined,
      };

      const response = await this.messaging.send(message);
      
      this.logger.log('Push notification sent successfully', { 
        messageId: response, 
        token: token.substring(0, 20) + '...' 
      });

      return { success: true, messageId: response };
    } catch (error) {
      this.logger.error('Failed to send push notification', { 
        token: token.substring(0, 20) + '...', 
        error: error.message 
      });

      // Handle specific Firebase errors
      if (error.code === 'messaging/invalid-registration-token') {
        // Token is invalid, should be removed
        await this.markTokenInvalid(token);
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Send push notification to multiple devices
   */
  async sendToMultipleDevices(
    tokens: string[],
    options: PushNotificationOptions,
  ): Promise<{ success: boolean; successCount: number; failureCount: number; errors: string[] }> {
    try {
      if (tokens.length === 0) {
        return { success: true, successCount: 0, failureCount: 0, errors: [] };
      }

      if (tokens.length === 1) {
        const result = await this.sendToDevice(tokens[0], options);
        return {
          success: result.success,
          successCount: result.success ? 1 : 0,
          failureCount: result.success ? 0 : 1,
          errors: result.success ? [] : [result.error || 'Unknown error'],
        };
      }

      // For multiple tokens, use Firebase's sendMulticast
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: options.title,
          body: options.body,
          imageUrl: options.imageUrl,
        },
        data: options.data,
        android: options.android ? {
          priority: options.android.priority || 'normal',
          notification: {
            channelId: options.android.channelId || 'default',
            sound: options.android.sound,
            icon: options.android.icon,
            color: options.android.color,
            clickAction: options.android.clickAction,
            tag: options.android.tag,
          },
        } : undefined,
        apns: options.apns ? {
          payload: {
            aps: {
              alert: options.apns.alert,
              badge: options.apns.badge,
              sound: options.apns.sound,
              category: options.apns.category,
            },
          },
        } : undefined,
                 webpush: options.webpush ? {
           headers: options.webpush.headers,
           data: options.webpush.data,
         } : undefined,
      };

      const response = await this.messaging.sendMulticast(message);
      
      this.logger.log('Multicast push notification sent', { 
        successCount: response.successCount, 
        failureCount: response.failureCount 
      });

      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
            if (resp.error?.code === 'messaging/invalid-registration-token') {
              this.markTokenInvalid(tokens[idx]);
            }
          }
        });

        // Remove failed tokens
        await this.removeInvalidTokens(failedTokens);
      }

      return {
        success: response.successCount > 0,
        successCount: response.successCount,
        failureCount: response.failureCount,
        errors: response.responses
          .map((resp, idx) => resp.success ? null : resp.error?.message || 'Unknown error')
          .filter(Boolean) as string[],
      };
    } catch (error) {
      this.logger.error('Failed to send multicast push notification', error);
      return {
        success: false,
        successCount: 0,
        failureCount: tokens.length,
        errors: [error.message],
      };
    }
  }

  /**
   * Send push notification to a topic
   */
  async sendToTopic(
    topic: string,
    options: PushNotificationOptions,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title: options.title,
          body: options.body,
          imageUrl: options.imageUrl,
        },
        data: options.data,
        android: options.android,
        webpush: options.webpush,
      };

      const response = await this.messaging.send(message);
      
      this.logger.log('Topic push notification sent successfully', { 
        messageId: response, 
        topic 
      });

      return { success: true, messageId: response };
    } catch (error) {
      this.logger.error('Failed to send topic push notification', { topic, error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Subscribe device to a topic
   */
  async subscribeToTopic(tokens: string[], topic: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.messaging.subscribeToTopic(tokens, topic);
      
      this.logger.log('Devices subscribed to topic successfully', { 
        successCount: response.successCount, 
        failureCount: response.failureCount, 
        topic 
      });

      return { success: true };
    } catch (error) {
      this.logger.error('Failed to subscribe devices to topic', { topic, error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Unsubscribe device from a topic
   */
  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.messaging.unsubscribeFromTopic(tokens, topic);
      
      this.logger.log('Devices unsubscribed from topic successfully', { 
        successCount: response.successCount, 
        failureCount: response.failureCount, 
        topic 
      });

      return { success: true };
    } catch (error) {
      this.logger.error('Failed to unsubscribe devices from topic', { topic, error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Schedule a push notification
   */
  async scheduleNotification(
    schedule: Omit<NotificationSchedule, 'id' | 'status' | 'sentCount' | 'failedCount' | 'createdAt' | 'updatedAt'>,
  ): Promise<{ success: boolean; scheduleId?: string; error?: string }> {
    try {
      const scheduleId = uuidv4();
      const jobData = {
        scheduleId,
        ...schedule,
      };

      // Calculate delay in milliseconds
      const now = new Date();
      const scheduledTime = new Date(schedule.scheduledAt);
      const delay = Math.max(0, scheduledTime.getTime() - now.getTime());

      // Add job to queue
      await this.pushNotificationQueue.add(
        'send-scheduled-notification',
        jobData,
        {
          delay,
          jobId: scheduleId,
          removeOnComplete: true,
          removeOnFail: false,
        },
      );

      this.logger.log('Push notification scheduled successfully', { 
        scheduleId, 
        scheduledAt: schedule.scheduledAt 
      });

      return { success: true, scheduleId };
    } catch (error) {
      this.logger.error('Failed to schedule push notification', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelScheduledNotification(scheduleId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const job = await this.pushNotificationQueue.getJob(scheduleId);
      if (job) {
        await job.remove();
        this.logger.log('Scheduled notification cancelled successfully', { scheduleId });
        return { success: true };
      } else {
        return { success: false, error: 'Scheduled notification not found' };
      }
    } catch (error) {
      this.logger.error('Failed to cancel scheduled notification', { scheduleId, error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(timeRange: { start: Date; end: Date }): Promise<{
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    deliveryRate: number;
    averageDeliveryTime: number;
    platformStats: Record<string, { sent: number; delivered: number; failed: number }>;
  }> {
    try {
      // This would typically query a database for actual statistics
      // For now, return mock data
      const stats = {
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        deliveryRate: 0,
        averageDeliveryTime: 0,
        platformStats: {
          android: { sent: 0, delivered: 0, failed: 0 },
          ios: { sent: 0, delivered: 0, failed: 0 },
          web: { sent: 0, delivered: 0, failed: 0 },
        },
      };

      return stats;
    } catch (error) {
      this.logger.error('Failed to get notification statistics', error);
      throw error;
    }
  }

  /**
   * Mark a token as invalid (to be removed)
   */
  private async markTokenInvalid(token: string): Promise<void> {
    try {
      // This would typically update the database to mark the token as invalid
      this.logger.warn('Token marked as invalid', { token: token.substring(0, 20) + '...' });
    } catch (error) {
      this.logger.error('Failed to mark token as invalid', error);
    }
  }

  /**
   * Remove invalid tokens
   */
  private async removeInvalidTokens(tokens: string[]): Promise<void> {
    try {
      // This would typically remove the tokens from the database
      this.logger.warn('Invalid tokens removed', { count: tokens.length });
    } catch (error) {
      this.logger.error('Failed to remove invalid tokens', error);
    }
  }

  /**
   * Clean up Firebase resources
   */
  async onModuleDestroy(): Promise<void> {
    try {
      if (this.firebaseApp) {
        await this.firebaseApp.delete();
        this.logger.log('Firebase Admin SDK cleaned up successfully');
      }
    } catch (error) {
      this.logger.error('Failed to cleanup Firebase Admin SDK', error);
    }
  }
}
