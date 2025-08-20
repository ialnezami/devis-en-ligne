import { IsOptional, IsBoolean, IsString, IsArray, IsEnum, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType, NotificationChannel, NotificationPriority } from '../entities/notification.entity';

export class CreateNotificationPreferencesDto {
  @ApiPropertyOptional({ description: 'Whether notifications are enabled globally', default: true })
  @IsOptional()
  @IsBoolean()
  notificationsEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Whether email notifications are enabled', default: true })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Whether push notifications are enabled', default: true })
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Whether in-app notifications are enabled', default: true })
  @IsOptional()
  @IsBoolean()
  inAppNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Whether SMS notifications are enabled', default: false })
  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Whether webhook notifications are enabled', default: false })
  @IsOptional()
  @IsBoolean()
  webhookNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Whether quiet hours are enabled', default: false })
  @IsOptional()
  @IsBoolean()
  quietHoursEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Quiet hours start time', default: '22:00' })
  @IsOptional()
  @IsString()
  quietHoursStart?: string;

  @ApiPropertyOptional({ description: 'Quiet hours end time', default: '08:00' })
  @IsOptional()
  @IsString()
  quietHoursEnd?: string;

  @ApiPropertyOptional({ description: 'Quiet hours timezone', default: 'UTC' })
  @IsOptional()
  @IsString()
  quietHoursTimezone?: string;

  @ApiPropertyOptional({ description: 'Priority-based notification settings' })
  @IsOptional()
  @IsObject()
  prioritySettings?: {
    low?: boolean;
    normal?: boolean;
    high?: boolean;
    urgent?: boolean;
  };

  @ApiPropertyOptional({ description: 'Type-based notification settings' })
  @IsOptional()
  @IsObject()
  typeSettings?: Partial<Record<NotificationType, boolean>>;

  @ApiPropertyOptional({ description: 'Channel settings per notification type' })
  @IsOptional()
  @IsObject()
  channelSettings?: Partial<Record<NotificationType, NotificationChannel[]>>;

  @ApiPropertyOptional({ description: 'Frequency settings per channel' })
  @IsOptional()
  @IsObject()
  frequencySettings?: {
    email?: 'immediate' | 'hourly' | 'daily' | 'weekly';
    push?: 'immediate' | 'hourly' | 'daily' | 'weekly';
    in_app?: 'immediate' | 'hourly' | 'daily' | 'weekly';
    sms?: 'immediate' | 'hourly' | 'daily' | 'weekly';
    webhook?: 'immediate' | 'hourly' | 'daily' | 'weekly';
  };

  @ApiPropertyOptional({ description: 'Whether digest is enabled', default: false })
  @IsOptional()
  @IsBoolean()
  digestEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Digest frequency', default: 'daily' })
  @IsOptional()
  @IsString()
  digestFrequency?: 'hourly' | 'daily' | 'weekly';

  @ApiPropertyOptional({ description: 'Digest time', default: '09:00' })
  @IsOptional()
  @IsString()
  digestTime?: string;

  @ApiPropertyOptional({ description: 'Digest timezone', default: 'UTC' })
  @IsOptional()
  @IsString()
  digestTimezone?: string;

  @ApiPropertyOptional({ description: 'Muted notification types' })
  @IsOptional()
  @IsArray()
  @IsEnum(NotificationType, { each: true })
  mutedTypes?: NotificationType[];

  @ApiPropertyOptional({ description: 'Muted notification categories' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mutedCategories?: string[];

  @ApiPropertyOptional({ description: 'Display settings' })
  @IsOptional()
  @IsObject()
  displaySettings?: {
    showUnreadCount?: boolean;
    showPreview?: boolean;
    playSound?: boolean;
    showBadge?: boolean;
    groupNotifications?: boolean;
  };

  @ApiPropertyOptional({ description: 'Interaction settings' })
  @IsOptional()
  @IsObject()
  interactionSettings?: {
    allowReply?: boolean;
    allowForward?: boolean;
    allowShare?: boolean;
  };

  @ApiPropertyOptional({ description: 'Custom sounds for different notification types' })
  @IsOptional()
  @IsObject()
  customSounds?: {
    default?: string;
    quotation?: string;
    payment?: string;
    alert?: string;
    error?: string;
  };

  @ApiPropertyOptional({ description: 'Language setting', default: 'en' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Locale setting', default: 'en-US' })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiPropertyOptional({ description: 'Timezone setting', default: 'UTC' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Accessibility settings' })
  @IsOptional()
  @IsObject()
  accessibilitySettings?: {
    highContrast?: boolean;
    largeText?: boolean;
    screenReaderFriendly?: boolean;
    keyboardNavigation?: boolean;
  };

  @ApiPropertyOptional({ description: 'Privacy settings' })
  @IsOptional()
  @IsObject()
  privacySettings?: {
    allowAnalytics?: boolean;
    allowPersonalization?: boolean;
    allowCrossDeviceSync?: boolean;
    blockedSenders?: string[];
    allowedSenders?: string[];
  };

  @ApiPropertyOptional({ description: 'Backup and sync settings' })
  @IsOptional()
  @IsObject()
  backupSettings?: {
    autoBackup?: boolean;
    backupFrequency?: 'daily' | 'weekly' | 'monthly';
    syncAcrossDevices?: boolean;
  };
}
