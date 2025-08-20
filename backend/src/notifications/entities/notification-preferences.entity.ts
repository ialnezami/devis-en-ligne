import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { NotificationType, NotificationChannel, NotificationPriority } from './notification.entity';

@Entity('notification_preferences')
export class NotificationPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => User, user => user.notificationPreferences)
  @JoinColumn({ name: 'userId' })
  user: User;

  // Global notification settings
  @Column({ type: 'boolean', default: true })
  notificationsEnabled: boolean;

  @Column({ type: 'boolean', default: true })
  emailNotifications: boolean;

  @Column({ type: 'boolean', default: true })
  pushNotifications: boolean;

  @Column({ type: 'boolean', default: true })
  inAppNotifications: boolean;

  @Column({ type: 'boolean', default: false })
  smsNotifications: boolean;

  @Column({ type: 'boolean', default: false })
  webhookNotifications: boolean;

  // Quiet hours settings
  @Column({ type: 'boolean', default: false })
  quietHoursEnabled: boolean;

  @Column({ type: 'varchar', length: 10, default: '22:00' })
  quietHoursStart: string;

  @Column({ type: 'varchar', length: 10, default: '08:00' })
  quietHoursEnd: string;

  @Column({ type: 'varchar', length: 50, default: 'UTC' })
  quietHoursTimezone: string;

  // Priority-based settings
  @Column({ type: 'jsonb', default: {
    low: true,
    normal: true,
    high: true,
    urgent: true,
  }})
  prioritySettings: {
    low: boolean;
    normal: boolean;
    high: boolean;
    urgent: boolean;
  };

  // Type-based settings
  @Column({ type: 'jsonb', default: {
    quotation_created: true,
    quotation_updated: true,
    quotation_approved: true,
    quotation_rejected: true,
    quotation_expired: true,
    payment_received: true,
    payment_failed: true,
    invoice_generated: true,
    user_invited: true,
    user_joined: true,
    user_left: true,
    system_maintenance: true,
    system_update: true,
    reminder: true,
    alert: true,
    info: true,
    success: true,
    warning: true,
    error: true,
  }})
  typeSettings: Record<NotificationType, boolean>;

  // Channel preferences for each type
  @Column({ type: 'jsonb', default: {
    quotation_created: ['in_app', 'email'],
    quotation_updated: ['in_app'],
    quotation_approved: ['in_app', 'email', 'push'],
    quotation_rejected: ['in_app', 'email', 'push'],
    quotation_expired: ['in_app', 'email'],
    payment_received: ['in_app', 'email', 'push'],
    payment_failed: ['in_app', 'email', 'push'],
    invoice_generated: ['in_app', 'email'],
    user_invited: ['in_app', 'email'],
    user_joined: ['in_app'],
    user_left: ['in_app'],
    system_maintenance: ['in_app', 'email'],
    system_update: ['in_app', 'email'],
    reminder: ['in_app', 'email'],
    alert: ['in_app', 'email', 'push'],
    info: ['in_app'],
    success: ['in_app'],
    warning: ['in_app', 'email'],
    error: ['in_app', 'email', 'push'],
  }})
  channelSettings: Record<NotificationType, NotificationChannel[]>;

  // Frequency settings
  @Column({ type: 'jsonb', default: {
    email: 'immediate',
    push: 'immediate',
    in_app: 'immediate',
    sms: 'immediate',
    webhook: 'immediate',
  }})
  frequencySettings: {
    email: 'immediate' | 'hourly' | 'daily' | 'weekly';
    push: 'immediate' | 'hourly' | 'daily' | 'weekly';
    in_app: 'immediate' | 'hourly' | 'daily' | 'weekly';
    sms: 'immediate' | 'hourly' | 'daily' | 'weekly';
    webhook: 'immediate' | 'hourly' | 'daily' | 'weekly';
  };

  // Digest settings
  @Column({ type: 'boolean', default: false })
  digestEnabled: boolean;

  @Column({ type: 'varchar', length: 20, default: 'daily' })
  digestFrequency: 'hourly' | 'daily' | 'weekly';

  @Column({ type: 'varchar', length: 10, default: '09:00' })
  digestTime: string;

  @Column({ type: 'varchar', length: 50, default: 'UTC' })
  digestTimezone: string;

  // Mute settings
  @Column({ type: 'timestamp', nullable: true })
  mutedUntil: Date | null;

  @Column({ type: 'jsonb', default: [] })
  mutedTypes: NotificationType[];

  @Column({ type: 'jsonb', default: [] })
  mutedCategories: string[];

  // Advanced settings
  @Column({ type: 'boolean', default: true })
  showUnreadCount: boolean;

  @Column({ type: 'boolean', default: true })
  showPreview: boolean;

  @Column({ type: 'boolean', default: true })
  playSound: boolean;

  @Column({ type: 'boolean', default: true })
  showBadge: boolean;

  @Column({ type: 'boolean', default: false })
  groupNotifications: boolean;

  @Column({ type: 'boolean', default: true })
  allowReply: boolean;

  @Column({ type: 'boolean', default: true })
  allowForward: boolean;

  @Column({ type: 'boolean', default: true })
  allowShare: boolean;

  // Custom notification sounds
  @Column({ type: 'jsonb', default: {
    default: 'default',
    quotation: 'notification',
    payment: 'success',
    alert: 'warning',
    error: 'error',
  }})
  customSounds: {
    default: string;
    quotation: string;
    payment: string;
    alert: string;
    error: string;
  };

  // Language and localization
  @Column({ type: 'varchar', length: 10, default: 'en' })
  language: string;

  @Column({ type: 'varchar', length: 10, default: 'en-US' })
  locale: string;

  @Column({ type: 'varchar', length: 50, default: 'UTC' })
  timezone: string;

  // Accessibility settings
  @Column({ type: 'boolean', default: false })
  highContrast: boolean;

  @Column({ type: 'boolean', default: false })
  largeText: boolean;

  @Column({ type: 'boolean', default: true })
  screenReaderFriendly: boolean;

  @Column({ type: 'boolean', default: true })
  keyboardNavigation: boolean;

  // Privacy settings
  @Column({ type: 'boolean', default: true })
  allowAnalytics: boolean;

  @Column({ type: 'boolean', default: false })
  allowPersonalization: boolean;

  @Column({ type: 'boolean', default: true })
  allowCrossDeviceSync: boolean;

  @Column({ type: 'jsonb', default: [] })
  blockedSenders: string[];

  @Column({ type: 'jsonb', default: [] })
  allowedSenders: string[];

  // Backup and sync settings
  @Column({ type: 'boolean', default: true })
  autoBackup: boolean;

  @Column({ type: 'varchar', length: 20, default: 'weekly' })
  backupFrequency: 'daily' | 'weekly' | 'monthly';

  @Column({ type: 'boolean', default: true })
  syncAcrossDevices: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastBackupAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
