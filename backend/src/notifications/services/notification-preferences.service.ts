import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationPreferences } from '../entities/notification-preferences.entity';
import { CreateNotificationPreferencesDto } from '../dto/create-notification-preferences.dto';
import { UpdateNotificationPreferencesDto } from '../dto/update-notification-preferences.dto';
import { NotificationType, NotificationChannel } from '../entities/notification.entity';

@Injectable()
export class NotificationPreferencesService {
  private readonly logger = new Logger(NotificationPreferencesService.name);

  constructor(
    @InjectRepository(NotificationPreferences)
    private readonly preferencesRepository: Repository<NotificationPreferences>,
  ) {}

  /**
   * Create notification preferences for a user
   */
  async createPreferences(
    userId: string,
    createPreferencesDto: CreateNotificationPreferencesDto,
  ): Promise<NotificationPreferences> {
    try {
      // Check if preferences already exist
      const existingPreferences = await this.preferencesRepository.findOne({
        where: { userId },
      });

      if (existingPreferences) {
        throw new BadRequestException('Notification preferences already exist for this user');
      }

      const preferences = this.preferencesRepository.create({
        userId,
        ...createPreferencesDto,
      });

      const savedPreferences = await this.preferencesRepository.save(preferences);
      
      this.logger.log('Notification preferences created successfully', { userId });

      return savedPreferences;
    } catch (error) {
      this.logger.error('Failed to create notification preferences', error);
      throw error;
    }
  }

  /**
   * Get notification preferences for a user
   */
  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      let preferences = await this.preferencesRepository.findOne({
        where: { userId },
      });

      if (!preferences) {
        // Create default preferences if they don't exist
        preferences = await this.createDefaultPreferences(userId);
      }

      return preferences;
    } catch (error) {
      this.logger.error('Failed to get user notification preferences', error);
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(
    userId: string,
    updatePreferencesDto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferences> {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      Object.assign(preferences, updatePreferencesDto);
      preferences.updatedAt = new Date();

      const updatedPreferences = await this.preferencesRepository.save(preferences);
      
      this.logger.log('Notification preferences updated successfully', { userId });

      return updatedPreferences;
    } catch (error) {
      this.logger.error('Failed to update notification preferences', error);
      throw error;
    }
  }

  /**
   * Toggle specific notification type
   */
  async toggleNotificationType(
    userId: string,
    type: NotificationType,
    enabled: boolean,
  ): Promise<NotificationPreferences> {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      if (preferences.typeSettings[type] !== undefined) {
        preferences.typeSettings[type] = enabled;
        preferences.updatedAt = new Date();

        const updatedPreferences = await this.preferencesRepository.save(preferences);
        
        this.logger.log('Notification type toggled', { userId, type, enabled });

        return updatedPreferences;
      } else {
        throw new BadRequestException(`Invalid notification type: ${type}`);
      }
    } catch (error) {
      this.logger.error('Failed to toggle notification type', error);
      throw error;
    }
  }

  /**
   * Toggle specific notification channel
   */
  async toggleNotificationChannel(
    userId: string,
    channel: string,
    enabled: boolean,
  ): Promise<NotificationPreferences> {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      switch (channel) {
        case 'email':
          preferences.emailNotifications = enabled;
          break;
        case 'push':
          preferences.pushNotifications = enabled;
          break;
        case 'in_app':
          preferences.inAppNotifications = enabled;
          break;
        case 'sms':
          preferences.smsNotifications = enabled;
          break;
        case 'webhook':
          preferences.webhookNotifications = enabled;
          break;
        default:
          throw new BadRequestException(`Invalid notification channel: ${channel}`);
      }

      preferences.updatedAt = new Date();

      const updatedPreferences = await this.preferencesRepository.save(preferences);
      
      this.logger.log('Notification channel toggled', { userId, channel, enabled });

      return updatedPreferences;
    } catch (error) {
      this.logger.error('Failed to toggle notification channel', error);
      throw error;
    }
  }

  /**
   * Update quiet hours settings
   */
  async updateQuietHours(
    userId: string,
    enabled: boolean,
    startTime?: string,
    endTime?: string,
    timezone?: string,
  ): Promise<NotificationPreferences> {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      preferences.quietHoursEnabled = enabled;
      
      if (startTime) preferences.quietHoursStart = startTime;
      if (endTime) preferences.quietHoursEnd = endTime;
      if (timezone) preferences.quietHoursTimezone = timezone;
      
      preferences.updatedAt = new Date();

      const updatedPreferences = await this.preferencesRepository.save(preferences);
      
      this.logger.log('Quiet hours updated', { userId, enabled, startTime, endTime, timezone });

      return updatedPreferences;
    } catch (error) {
      this.logger.error('Failed to update quiet hours', error);
      throw error;
    }
  }

  /**
   * Update priority settings
   */
  async updatePrioritySettings(
    userId: string,
    prioritySettings: {
      low?: boolean;
      normal?: boolean;
      high?: boolean;
      urgent?: boolean;
    },
  ): Promise<NotificationPreferences> {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      Object.assign(preferences.prioritySettings, prioritySettings);
      preferences.updatedAt = new Date();

      const updatedPreferences = await this.preferencesRepository.save(preferences);
      
      this.logger.log('Priority settings updated', { userId, prioritySettings });

      return updatedPreferences;
    } catch (error) {
      this.logger.error('Failed to update priority settings', error);
      throw error;
    }
  }

  /**
   * Update channel settings for specific types
   */
  async updateChannelSettings(
    userId: string,
    type: NotificationType,
    channels: NotificationChannel[],
  ): Promise<NotificationPreferences> {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      if (preferences.channelSettings[type] !== undefined) {
        preferences.channelSettings[type] = channels;
        preferences.updatedAt = new Date();

        const updatedPreferences = await this.preferencesRepository.save(preferences);
        
        this.logger.log('Channel settings updated', { userId, type, channels });

        return updatedPreferences;
      } else {
        throw new BadRequestException(`Invalid notification type: ${type}`);
      }
    } catch (error) {
      this.logger.error('Failed to update channel settings', error);
      throw error;
    }
  }

  /**
   * Update frequency settings
   */
  async updateFrequencySettings(
    userId: string,
    frequencySettings: {
      email?: 'immediate' | 'hourly' | 'daily' | 'weekly';
      push?: 'immediate' | 'hourly' | 'daily' | 'weekly';
      in_app?: 'immediate' | 'hourly' | 'daily' | 'weekly';
      sms?: 'immediate' | 'hourly' | 'daily' | 'weekly';
      webhook?: 'immediate' | 'hourly' | 'daily' | 'weekly';
    },
  ): Promise<NotificationPreferences> {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      Object.assign(preferences.frequencySettings, frequencySettings);
      preferences.updatedAt = new Date();

      const updatedPreferences = await this.preferencesRepository.save(preferences);
      
      this.logger.log('Frequency settings updated', { userId, frequencySettings });

      return updatedPreferences;
    } catch (error) {
      this.logger.error('Failed to update frequency settings', error);
      throw error;
    }
  }

  /**
   * Update digest settings
   */
  async updateDigestSettings(
    userId: string,
    digestEnabled: boolean,
    frequency?: 'hourly' | 'daily' | 'weekly',
    time?: string,
    timezone?: string,
  ): Promise<NotificationPreferences> {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      preferences.digestEnabled = digestEnabled;
      if (frequency) preferences.digestFrequency = frequency;
      if (time) preferences.digestTime = time;
      if (timezone) preferences.digestTimezone = timezone;
      
      preferences.updatedAt = new Date();

      const updatedPreferences = await this.preferencesRepository.save(preferences);
      
      this.logger.log('Digest settings updated', { userId, digestEnabled, frequency, time, timezone });

      return updatedPreferences;
    } catch (error) {
      this.logger.error('Failed to update digest settings', error);
      throw error;
    }
  }

  /**
   * Mute notifications until a specific time
   */
  async muteNotifications(
    userId: string,
    mutedUntil: Date,
    mutedTypes?: NotificationType[],
    mutedCategories?: string[],
  ): Promise<NotificationPreferences> {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      preferences.mutedUntil = mutedUntil;
      if (mutedTypes) preferences.mutedTypes = mutedTypes;
      if (mutedCategories) preferences.mutedCategories = mutedCategories;
      
      preferences.updatedAt = new Date();

      const updatedPreferences = await this.preferencesRepository.save(preferences);
      
      this.logger.log('Notifications muted', { userId, mutedUntil, mutedTypes, mutedCategories });

      return updatedPreferences;
    } catch (error) {
      this.logger.error('Failed to mute notifications', error);
      throw error;
    }
  }

  /**
   * Unmute notifications
   */
  async unmuteNotifications(userId: string): Promise<NotificationPreferences> {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      preferences.mutedUntil = null;
      preferences.mutedTypes = [];
      preferences.mutedCategories = [];
      
      preferences.updatedAt = new Date();

      const updatedPreferences = await this.preferencesRepository.save(preferences);
      
      this.logger.log('Notifications unmuted', { userId });

      return updatedPreferences;
    } catch (error) {
      this.logger.error('Failed to unmute notifications', error);
      throw error;
    }
  }

  /**
   * Update accessibility settings
   */
  async updateAccessibilitySettings(
    userId: string,
    accessibilitySettings: {
      highContrast?: boolean;
      largeText?: boolean;
      screenReaderFriendly?: boolean;
      keyboardNavigation?: boolean;
    },
  ): Promise<NotificationPreferences> {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      Object.assign(preferences, accessibilitySettings);
      preferences.updatedAt = new Date();

      const updatedPreferences = await this.preferencesRepository.save(preferences);
      
      this.logger.log('Accessibility settings updated', { userId, accessibilitySettings });

      return updatedPreferences;
    } catch (error) {
      this.logger.error('Failed to update accessibility settings', error);
      throw error;
    }
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(
    userId: string,
    privacySettings: {
      allowAnalytics?: boolean;
      allowPersonalization?: boolean;
      allowCrossDeviceSync?: boolean;
      blockedSenders?: string[];
      allowedSenders?: string[];
    },
  ): Promise<NotificationPreferences> {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      Object.assign(preferences, privacySettings);
      preferences.updatedAt = new Date();

      const updatedPreferences = await this.preferencesRepository.save(preferences);
      
      this.logger.log('Privacy settings updated', { userId, privacySettings });

      return updatedPreferences;
    } catch (error) {
      this.logger.error('Failed to update privacy settings', error);
      throw error;
    }
  }

  /**
   * Reset preferences to default
   */
  async resetToDefault(userId: string): Promise<NotificationPreferences> {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      // Delete existing preferences
      await this.preferencesRepository.remove(preferences);
      
      // Create new default preferences
      const defaultPreferences = await this.createDefaultPreferences(userId);
      
      this.logger.log('Preferences reset to default', { userId });

      return defaultPreferences;
    } catch (error) {
      this.logger.error('Failed to reset preferences to default', error);
      throw error;
    }
  }

  /**
   * Export preferences
   */
  async exportPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      this.logger.log('Preferences exported', { userId });

      return preferences;
    } catch (error) {
      this.logger.error('Failed to export preferences', error);
      throw error;
    }
  }

  /**
   * Import preferences
   */
  async importPreferences(
    userId: string,
    importedPreferences: Partial<NotificationPreferences>,
  ): Promise<NotificationPreferences> {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      // Remove sensitive fields that shouldn't be imported
      const { id, userId: importedUserId, createdAt, updatedAt, ...safePreferences } = importedPreferences;
      
      Object.assign(preferences, safePreferences);
      preferences.updatedAt = new Date();

      const updatedPreferences = await this.preferencesRepository.save(preferences);
      
      this.logger.log('Preferences imported', { userId });

      return updatedPreferences;
    } catch (error) {
      this.logger.error('Failed to import preferences', error);
      throw error;
    }
  }

  /**
   * Create default notification preferences
   */
  private async createDefaultPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const defaultPreferences = this.preferencesRepository.create({
        userId,
        // All other fields will use the default values defined in the entity
      });

      const savedPreferences = await this.preferencesRepository.save(defaultPreferences);
      
      this.logger.log('Default notification preferences created', { userId });

      return savedPreferences;
    } catch (error) {
      this.logger.error('Failed to create default preferences', error);
      throw error;
    }
  }

  /**
   * Check if user has specific notification type enabled
   */
  async isNotificationTypeEnabled(userId: string, type: string): Promise<boolean> {
    try {
      const preferences = await this.getUserPreferences(userId);
      return preferences.typeSettings[type] !== false;
    } catch (error) {
      this.logger.error('Failed to check notification type status', error);
      return false;
    }
  }

  /**
   * Check if user has specific channel enabled
   */
  async isChannelEnabled(userId: string, channel: string): Promise<boolean> {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      switch (channel) {
        case 'email':
          return preferences.emailNotifications;
        case 'push':
          return preferences.pushNotifications;
        case 'in_app':
          return preferences.inAppNotifications;
        case 'sms':
          return preferences.smsNotifications;
        case 'webhook':
          return preferences.webhookNotifications;
        default:
          return false;
      }
    } catch (error) {
      this.logger.error('Failed to check channel status', error);
      return false;
    }
  }

  /**
   * Check if user is currently muted
   */
  async isUserMuted(userId: string): Promise<boolean> {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      if (preferences.mutedUntil && preferences.mutedUntil > new Date()) {
        return true;
      }
      
      return false;
    } catch (error) {
      this.logger.error('Failed to check mute status', error);
      return false;
    }
  }
}
