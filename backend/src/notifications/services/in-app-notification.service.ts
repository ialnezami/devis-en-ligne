import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationPriority, NotificationStatus, NotificationChannel } from '../entities/notification.entity';
import { NotificationPreferences } from '../entities/notification-preferences.entity';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { NotificationFilterDto } from '../dto/notification-filter.dto';

@Injectable()
export class InAppNotificationService {
  private readonly logger = new Logger(InAppNotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreferences)
    private readonly preferencesRepository: Repository<NotificationPreferences>,
  ) {}

  /**
   * Create a new notification
   */
  async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    try {
      // Check user preferences to determine if notification should be created
      const userPreferences = await this.preferencesRepository.findOne({
        where: { userId: createNotificationDto.userId },
      });

      if (userPreferences && !userPreferences.notificationsEnabled) {
        this.logger.log('Notifications disabled for user', { userId: createNotificationDto.userId });
        throw new BadRequestException('Notifications are disabled for this user');
      }

      // Check if specific type is muted
      if (userPreferences && userPreferences.typeSettings[createNotificationDto.type] === false) {
        this.logger.log('Notification type muted for user', { 
          userId: createNotificationDto.userId, 
          type: createNotificationDto.type 
        });
        throw new BadRequestException('This notification type is muted for this user');
      }

      // Check quiet hours
      if (userPreferences && userPreferences.quietHoursEnabled) {
        const isInQuietHours = this.isInQuietHours(userPreferences);
        if (isInQuietHours && createNotificationDto.priority !== 'urgent') {
          this.logger.log('Notification blocked during quiet hours', { 
            userId: createNotificationDto.userId 
          });
          throw new BadRequestException('Notifications are blocked during quiet hours');
        }
      }

      const notification = this.notificationRepository.create({
        ...createNotificationDto,
        status: NotificationStatus.UNREAD,
        isRead: false,
        isArchived: false,
        isDeleted: false,
        isActive: true,
        readCount: 0,
        clickCount: 0,
        sentAt: new Date(),
      });

      const savedNotification = await this.notificationRepository.save(notification);
      
      this.logger.log('Notification created successfully', { 
        notificationId: savedNotification.id, 
        userId: savedNotification.userId,
        type: savedNotification.type 
      });

      return savedNotification;
    } catch (error) {
      this.logger.error('Failed to create notification', error);
      throw error;
    }
  }

  /**
   * Create multiple notifications
   */
  async createMultipleNotifications(
    notifications: Omit<CreateNotificationDto, 'id' | 'createdAt' | 'updatedAt'>[],
  ): Promise<Notification[]> {
    try {
      const createdNotifications: Notification[] = [];

      for (const notificationData of notifications) {
        try {
          const notification = await this.createNotification(notificationData);
          createdNotifications.push(notification);
        } catch (error) {
          this.logger.warn('Failed to create notification', { 
            userId: notificationData.userId, 
            type: notificationData.type, 
            error: error.message 
          });
          // Continue with other notifications
        }
      }

      this.logger.log('Multiple notifications created', { 
        total: notifications.length, 
        successful: createdNotifications.length 
      });

      return createdNotifications;
    } catch (error) {
      this.logger.error('Failed to create multiple notifications', error);
      throw error;
    }
  }

  /**
   * Get notifications for a user with filtering and pagination
   */
  async getUserNotifications(
    userId: string,
    filters: NotificationFilterDto,
    pagination: { page: number; limit: number },
  ): Promise<{ notifications: Notification[]; total: number; page: number; totalPages: number }> {
    try {
      const queryBuilder = this.notificationRepository
        .createQueryBuilder('notification')
        .where('notification.userId = :userId', { userId })
        .andWhere('notification.isDeleted = :isDeleted', { isDeleted: false });

      // Apply filters
      if (filters.status) {
        queryBuilder.andWhere('notification.status = :status', { status: filters.status });
      }

      if (filters.type) {
        queryBuilder.andWhere('notification.type = :type', { type: filters.type });
      }

      if (filters.priority) {
        queryBuilder.andWhere('notification.priority = :priority', { priority: filters.priority });
      }

      if (filters.category) {
        queryBuilder.andWhere('notification.category = :category', { category: filters.category });
      }

      if (filters.isRead !== undefined) {
        queryBuilder.andWhere('notification.isRead = :isRead', { isRead: filters.isRead });
      }

      if (filters.isArchived !== undefined) {
        queryBuilder.andWhere('notification.isArchived = :isArchived', { isArchived: filters.isArchived });
      }

      if (filters.search) {
        queryBuilder.andWhere(
          '(notification.title ILIKE :search OR notification.message ILIKE :search)',
          { search: `%${filters.search}%` }
        );
      }

      if (filters.startDate) {
        queryBuilder.andWhere('notification.createdAt >= :startDate', { startDate: filters.startDate });
      }

      if (filters.endDate) {
        queryBuilder.andWhere('notification.createdAt <= :endDate', { endDate: filters.endDate });
      }

      // Apply sorting
      const sortField = filters.sortBy || 'createdAt';
      const sortOrder = filters.sortOrder || 'DESC';
      queryBuilder.orderBy(`notification.${sortField}`, sortOrder as 'ASC' | 'DESC');

      // Apply pagination
      const page = pagination.page || 1;
      const limit = pagination.limit || 20;
      const offset = (page - 1) * limit;

      queryBuilder.skip(offset).take(limit);

      const [notifications, total] = await queryBuilder.getManyAndCount();

      return {
        notifications,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error('Failed to get user notifications', error);
      throw error;
    }
  }

  /**
   * Get a single notification by ID
   */
  async getNotification(id: string, userId: string): Promise<Notification> {
    try {
      const notification = await this.notificationRepository.findOne({
        where: { id, userId, isDeleted: false },
      });

      if (!notification) {
        throw new NotFoundException(`Notification with ID ${id} not found`);
      }

      return notification;
    } catch (error) {
      this.logger.error('Failed to get notification', { id, userId, error: error.message });
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string, userId: string): Promise<Notification> {
    try {
      const notification = await this.getNotification(id, userId);
      
      notification.isRead = true;
      notification.status = NotificationStatus.READ;
      notification.readAt = new Date();
      notification.readCount += 1;

      const updatedNotification = await this.notificationRepository.save(notification);
      
      this.logger.log('Notification marked as read', { id, userId });

      return updatedNotification;
    } catch (error) {
      this.logger.error('Failed to mark notification as read', { id, userId, error: error.message });
      throw error;
    }
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(ids: string[], userId: string): Promise<{ success: boolean; updatedCount: number }> {
    try {
      const result = await this.notificationRepository
        .createQueryBuilder()
        .update(Notification)
        .set({
          isRead: true,
          status: NotificationStatus.READ,
          readAt: new Date(),
        })
        .where('id IN (:...ids)', { ids })
        .andWhere('userId = :userId', { userId })
        .andWhere('isDeleted = :isDeleted', { isDeleted: false })
        .execute();

      const updatedCount = result.affected || 0;
      
      this.logger.log('Multiple notifications marked as read', { 
        userId, 
        requestedCount: ids.length, 
        updatedCount 
      });

      return { success: true, updatedCount };
    } catch (error) {
      this.logger.error('Failed to mark multiple notifications as read', { ids, userId, error: error.message });
      throw error;
    }
  }

  /**
   * Mark all user notifications as read
   */
  async markAllAsRead(userId: string): Promise<{ success: boolean; updatedCount: number }> {
    try {
      const result = await this.notificationRepository
        .createQueryBuilder()
        .update(Notification)
        .set({
          isRead: true,
          status: NotificationStatus.READ,
          readAt: new Date(),
        })
        .where('userId = :userId', { userId })
        .andWhere('isDeleted = :isDeleted', { isDeleted: false })
        .andWhere('isRead = :isRead', { isRead: false })
        .execute();

      const updatedCount = result.affected || 0;
      
      this.logger.log('All notifications marked as read', { userId, updatedCount });

      return { success: true, updatedCount };
    } catch (error) {
      this.logger.error('Failed to mark all notifications as read', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Archive notification
   */
  async archiveNotification(id: string, userId: string): Promise<Notification> {
    try {
      const notification = await this.getNotification(id, userId);
      
      notification.isArchived = true;
      notification.status = NotificationStatus.ARCHIVED;
      notification.archivedAt = new Date();

      const archivedNotification = await this.notificationRepository.save(notification);
      
      this.logger.log('Notification archived', { id, userId });

      return archivedNotification;
    } catch (error) {
      this.logger.error('Failed to archive notification', { id, userId, error: error.message });
      throw error;
    }
  }

  /**
   * Unarchive notification
   */
  async unarchiveNotification(id: string, userId: string): Promise<Notification> {
    try {
      const notification = await this.getNotification(id, userId);
      
      notification.isArchived = false;
      notification.status = notification.isRead ? NotificationStatus.READ : NotificationStatus.UNREAD;
      notification.archivedAt = null;

      const unarchivedNotification = await this.notificationRepository.save(notification);
      
      this.logger.log('Notification unarchived', { id, userId });

      return unarchivedNotification;
    } catch (error) {
      this.logger.error('Failed to unarchive notification', { id, userId, error: error.message });
      throw error;
    }
  }

  /**
   * Delete notification (soft delete)
   */
  async deleteNotification(id: string, userId: string): Promise<void> {
    try {
      const notification = await this.getNotification(id, userId);
      
      notification.isDeleted = true;
      notification.status = NotificationStatus.DELETED;
      notification.deletedAt = new Date();

      await this.notificationRepository.save(notification);
      
      this.logger.log('Notification deleted', { id, userId });
    } catch (error) {
      this.logger.error('Failed to delete notification', { id, userId, error: error.message });
      throw error;
    }
  }

  /**
   * Update notification
   */
  async updateNotification(
    id: string,
    userId: string,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    try {
      const notification = await this.getNotification(id, userId);
      
      Object.assign(notification, updateNotificationDto);
      notification.updatedAt = new Date();

      const updatedNotification = await this.notificationRepository.save(notification);
      
      this.logger.log('Notification updated', { id, userId });

      return updatedNotification;
    } catch (error) {
      this.logger.error('Failed to update notification', { id, userId, error: error.message });
      throw error;
    }
  }

  /**
   * Get notification statistics for a user
   */
  async getUserNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    read: number;
    archived: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    byStatus: Record<string, number>;
    recentActivity: {
      lastRead: Date | null;
      lastReceived: Date | null;
      averageReadTime: number;
    };
  }> {
    try {
      const [total, unread, read, archived] = await Promise.all([
        this.notificationRepository.count({ where: { userId, isDeleted: false } }),
        this.notificationRepository.count({ where: { userId, isRead: false, isDeleted: false } }),
        this.notificationRepository.count({ where: { userId, isRead: true, isDeleted: false } }),
        this.notificationRepository.count({ where: { userId, isArchived: true, isDeleted: false } }),
      ]);

      // Get count by type
      const typeStats = await this.notificationRepository
        .createQueryBuilder('notification')
        .select('notification.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .where('notification.userId = :userId', { userId })
        .andWhere('notification.isDeleted = :isDeleted', { isDeleted: false })
        .groupBy('notification.type')
        .getRawMany();

      const byType: Record<string, number> = {};
      typeStats.forEach(stat => {
        byType[stat.type] = parseInt(stat.count);
      });

      // Get count by priority
      const priorityStats = await this.notificationRepository
        .createQueryBuilder('notification')
        .select('notification.priority', 'priority')
        .addSelect('COUNT(*)', 'count')
        .where('notification.userId = :userId', { userId })
        .andWhere('notification.isDeleted = :isDeleted', { isDeleted: false })
        .groupBy('notification.priority')
        .getRawMany();

      const byPriority: Record<string, number> = {};
      priorityStats.forEach(stat => {
        byPriority[stat.priority] = parseInt(stat.count);
      });

      // Get count by status
      const statusStats = await this.notificationRepository
        .createQueryBuilder('notification')
        .select('notification.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('notification.userId = :userId', { userId })
        .andWhere('notification.isDeleted = :isDeleted', { isDeleted: false })
        .groupBy('notification.status')
        .getRawMany();

      const byStatus: Record<string, number> = {};
      statusStats.forEach(stat => {
        byStatus[stat.status] = parseInt(stat.count);
      });

      // Get recent activity
      const lastRead = await this.notificationRepository
        .createQueryBuilder('notification')
        .select('MAX(notification.readAt)', 'lastRead')
        .where('notification.userId = :userId', { userId })
        .andWhere('notification.isDeleted = :isDeleted', { isDeleted: false })
        .andWhere('notification.readAt IS NOT NULL')
        .getRawOne();

      const lastReceived = await this.notificationRepository
        .createQueryBuilder('notification')
        .select('MAX(notification.createdAt)', 'lastReceived')
        .where('notification.userId = :userId', { userId })
        .andWhere('notification.isDeleted = :isDeleted', { isDeleted: false })
        .getRawOne();

      // Calculate average read time (simplified)
      const readNotifications = await this.notificationRepository.find({
        where: { userId, isRead: true, isDeleted: false, readAt: { not: null } },
        select: ['createdAt', 'readAt'],
      });

      let totalReadTime = 0;
      let validReadCount = 0;

      readNotifications.forEach(notif => {
        if (notif.createdAt && notif.readAt) {
          totalReadTime += notif.readAt.getTime() - notif.createdAt.getTime();
          validReadCount++;
        }
      });

      const averageReadTime = validReadCount > 0 ? totalReadTime / validReadCount : 0;

      return {
        total,
        unread,
        read,
        archived,
        byType,
        byPriority,
        byStatus,
        recentActivity: {
          lastRead: lastRead?.lastRead ? new Date(lastRead.lastRead) : null,
          lastReceived: lastReceived?.lastReceived ? new Date(lastReceived.lastReceived) : null,
          averageReadTime,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get user notification statistics', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Clean up expired notifications
   */
  async cleanupExpiredNotifications(): Promise<{ success: boolean; deletedCount: number }> {
    try {
      const result = await this.notificationRepository
        .createQueryBuilder()
        .update(Notification)
        .set({
          isDeleted: true,
          status: NotificationStatus.DELETED,
          deletedAt: new Date(),
        })
        .where('expiresAt < :now', { now: new Date() })
        .andWhere('isDeleted = :isDeleted', { isDeleted: false })
        .execute();

      const deletedCount = result.affected || 0;
      
      this.logger.log('Expired notifications cleaned up', { deletedCount });

      return { success: true, deletedCount };
    } catch (error) {
      this.logger.error('Failed to cleanup expired notifications', error);
      throw error;
    }
  }

  /**
   * Check if current time is in quiet hours
   */
  private isInQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quietHoursEnabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      timeZone: preferences.quietHoursTimezone || 'UTC' 
    });

    const startTime = preferences.quietHoursStart || '22:00';
    const endTime = preferences.quietHoursEnd || '08:00';

    if (startTime <= endTime) {
      // Same day (e.g., 08:00 to 18:00)
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight (e.g., 22:00 to 08:00)
      return currentTime >= startTime || currentTime <= endTime;
    }
  }
}
