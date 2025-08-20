import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../companies/entities/company.entity';

export enum NotificationType {
  QUOTATION_CREATED = 'quotation_created',
  QUOTATION_UPDATED = 'quotation_updated',
  QUOTATION_APPROVED = 'quotation_approved',
  QUOTATION_REJECTED = 'quotation_rejected',
  QUOTATION_EXPIRED = 'quotation_expired',
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_FAILED = 'payment_failed',
  INVOICE_GENERATED = 'invoice_generated',
  USER_INVITED = 'user_invited',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  SYSTEM_UPDATE = 'system_update',
  REMINDER = 'reminder',
  ALERT = 'alert',
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
  WEBHOOK = 'webhook',
}

@Entity('notifications')
@Index(['userId', 'status'])
@Index(['companyId', 'status'])
@Index(['type', 'status'])
@Index(['createdAt', 'status'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, user => user.notifications)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, company => company.notifications)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'enum', enum: NotificationPriority, default: NotificationPriority.NORMAL })
  priority: NotificationPriority;

  @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.UNREAD })
  status: NotificationStatus;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    source?: string;
    actionUrl?: string;
    actionText?: string;
    icon?: string;
    imageUrl?: string;
    category?: string;
    tags?: string[];
    expiresAt?: Date;
    scheduledAt?: Date;
    sentAt?: Date;
    readAt?: Date;
    archivedAt?: Date;
    deletedAt?: Date;
  };

  @Column({ type: 'jsonb', default: [NotificationChannel.IN_APP] })
  channels: NotificationChannel[];

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  archivedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  source: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  actionUrl: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  actionText: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string | null;

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({ type: 'integer', default: 0 })
  readCount: number;

  @Column({ type: 'integer', default: 0 })
  clickCount: number;

  @Column({ type: 'jsonb', nullable: true })
  userPreferences: {
    muteUntil?: Date;
    preferredChannels?: NotificationChannel[];
    quietHours?: {
      enabled: boolean;
      startTime: string;
      endTime: string;
      timezone: string;
    };
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
