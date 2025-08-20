import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpException,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { InAppNotificationService } from '../services/in-app-notification.service';
import { NotificationPreferencesService } from '../services/notification-preferences.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { NotificationFilterDto } from '../dto/notification-filter.dto';
import { CreateNotificationPreferencesDto } from '../dto/create-notification-preferences.dto';
import { UpdateNotificationPreferencesDto } from '../dto/update-notification-preferences.dto';

@ApiTags('In-App Notifications')
@Controller('in-app-notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InAppNotificationsController {
  constructor(
    private readonly inAppNotificationService: InAppNotificationService,
    private readonly notificationPreferencesService: NotificationPreferencesService,
  ) {}

  // Notification Management
  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SALES_REP, UserRole.CLIENT)
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createNotification(@Body() createNotificationDto: CreateNotificationDto) {
    try {
      const notification = await this.inAppNotificationService.createNotification(createNotificationDto);
      return {
        success: true,
        message: 'Notification created successfully',
        data: notification,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to create notification: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('bulk')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create multiple notifications' })
  @ApiResponse({ status: 201, description: 'Notifications created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createMultipleNotifications(
    @Body() notifications: Omit<CreateNotificationDto, 'id' | 'createdAt' | 'updatedAt'>[],
  ) {
    try {
      const createdNotifications = await this.inAppNotificationService.createMultipleNotifications(
        notifications,
      );
      return {
        success: true,
        message: `${createdNotifications.length} notifications created successfully`,
        data: createdNotifications,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to create notifications: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @ApiOperation({ summary: 'Get user notifications with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  async getUserNotifications(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query() filters: NotificationFilterDto,
  ) {
    try {
      // In a real application, you'd get the user ID from the JWT token
      // For now, we'll use a placeholder
      const userId = 'user-id-from-jwt'; // This should come from the authenticated user
      
      const result = await this.inAppNotificationService.getUserNotifications(
        userId,
        filters,
        { page, limit },
      );

      return {
        success: true,
        message: 'Notifications retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve notifications: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @ApiOperation({ summary: 'Get a specific notification by ID' })
  @ApiResponse({ status: 200, description: 'Notification retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  async getNotification(@Param('id') id: string) {
    try {
      // In a real application, you'd get the user ID from the JWT token
      const userId = 'user-id-from-jwt'; // This should come from the authenticated user
      
      const notification = await this.inAppNotificationService.getNotification(id, userId);
      
      return {
        success: true,
        message: 'Notification retrieved successfully',
        data: notification,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to retrieve notification: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id/read')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  async markAsRead(@Param('id') id: string) {
    try {
      // In a real application, you'd get the user ID from the JWT token
      const userId = 'user-id-from-jwt'; // This should come from the authenticated user
      
      const notification = await this.inAppNotificationService.markAsRead(id, userId);
      
      return {
        success: true,
        message: 'Notification marked as read successfully',
        data: notification,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to mark notification as read: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('bulk/read')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @ApiOperation({ summary: 'Mark multiple notifications as read' })
  @ApiResponse({ status: 200, description: 'Notifications marked as read successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markMultipleAsRead(@Body() data: { ids: string[] }) {
    try {
      // In a real application, you'd get the user ID from the JWT token
      const userId = 'user-id-from-jwt'; // This should come from the authenticated user
      
      const result = await this.inAppNotificationService.markMultipleAsRead(data.ids, userId);
      
      return {
        success: true,
        message: `${result.updatedCount} notifications marked as read successfully`,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to mark notifications as read: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('all/read')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @ApiOperation({ summary: 'Mark all user notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markAllAsRead() {
    try {
      // In a real application, you'd get the user ID from the JWT token
      const userId = 'user-id-from-jwt'; // This should come from the authenticated user
      
      const result = await this.inAppNotificationService.markAllAsRead(userId);
      
      return {
        success: true,
        message: `${result.updatedCount} notifications marked as read successfully`,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to mark all notifications as read: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id/archive')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @ApiOperation({ summary: 'Archive a notification' })
  @ApiResponse({ status: 200, description: 'Notification archived successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  async archiveNotification(@Param('id') id: string) {
    try {
      // In a real application, you'd get the user ID from the JWT token
      const userId = 'user-id-from-jwt'; // This should come from the authenticated user
      
      const notification = await this.inAppNotificationService.archiveNotification(id, userId);
      
      return {
        success: true,
        message: 'Notification archived successfully',
        data: notification,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to archive notification: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id/unarchive')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @ApiOperation({ summary: 'Unarchive a notification' })
  @ApiResponse({ status: 200, description: 'Notification unarchived successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  async unarchiveNotification(@Param('id') id: string) {
    try {
      // In a real application, you'd get the user ID from the JWT token
      const userId = 'user-id-from-jwt'; // This should come from the authenticated user
      
      const notification = await this.inAppNotificationService.unarchiveNotification(id, userId);
      
      return {
        success: true,
        message: 'Notification unarchived successfully',
        data: notification,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to unarchive notification: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  async deleteNotification(@Param('id') id: string) {
    try {
      // In a real application, you'd get the user ID from the JWT token
      const userId = 'user-id-from-jwt'; // This should come from the authenticated user
      
      await this.inAppNotificationService.deleteNotification(id, userId);
      
      return {
        success: true,
        message: 'Notification deleted successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to delete notification: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update a notification' })
  @ApiResponse({ status: 200, description: 'Notification updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  async updateNotification(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    try {
      // In a real application, you'd get the user ID from the JWT token
      const userId = 'user-id-from-jwt'; // This should come from the authenticated user
      
      const notification = await this.inAppNotificationService.updateNotification(
        id,
        userId,
        updateNotificationDto,
      );
      
      return {
        success: true,
        message: 'Notification updated successfully',
        data: notification,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to update notification: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats/overview')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @ApiOperation({ summary: 'Get user notification statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserNotificationStats() {
    try {
      // In a real application, you'd get the user ID from the JWT token
      const userId = 'user-id-from-jwt'; // This should come from the authenticated user
      
      const stats = await this.inAppNotificationService.getUserNotificationStats(userId);
      
      return {
        success: true,
        message: 'Notification statistics retrieved successfully',
        data: stats,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve notification statistics: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Notification Preferences Management
  @Post('preferences')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @ApiOperation({ summary: 'Create notification preferences for user' })
  @ApiResponse({ status: 201, description: 'Preferences created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createPreferences(@Body() createPreferencesDto: CreateNotificationPreferencesDto) {
    try {
      // In a real application, you'd get the user ID from the JWT token
      const userId = 'user-id-from-jwt'; // This should come from the authenticated user
      
      const preferences = await this.notificationPreferencesService.createPreferences(
        userId,
        createPreferencesDto,
      );
      
      return {
        success: true,
        message: 'Notification preferences created successfully',
        data: preferences,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to create notification preferences: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('preferences')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @ApiOperation({ summary: 'Get user notification preferences' })
  @ApiResponse({ status: 200, description: 'Preferences retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserPreferences() {
    try {
      // In a real application, you'd get the user ID from the JWT token
      const userId = 'user-id-from-jwt'; // This should come from the authenticated user
      
      const preferences = await this.notificationPreferencesService.getUserPreferences(userId);
      
      return {
        success: true,
        message: 'Notification preferences retrieved successfully',
        data: preferences,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve notification preferences: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('preferences')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @ApiOperation({ summary: 'Update user notification preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updatePreferences(@Body() updatePreferencesDto: UpdateNotificationPreferencesDto) {
    try {
      // In a real application, you'd get the user ID from the JWT token
      const userId = 'user-id-from-jwt'; // This should come from the authenticated user
      
      const preferences = await this.notificationPreferencesService.updatePreferences(
        userId,
        updatePreferencesDto,
      );
      
      return {
        success: true,
        message: 'Notification preferences updated successfully',
        data: preferences,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to update notification preferences: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('preferences/reset')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @ApiOperation({ summary: 'Reset user notification preferences to defaults' })
  @ApiResponse({ status: 200, description: 'Preferences reset successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async resetPreferences() {
    try {
      // In a real application, you'd get the user ID from the JWT token
      const userId = 'user-id-from-jwt'; // This should come from the authenticated user
      
      const preferences = await this.notificationPreferencesService.resetToDefault(userId);
      
      return {
        success: true,
        message: 'Notification preferences reset to defaults successfully',
        data: preferences,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to reset notification preferences: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('preferences/export')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @ApiOperation({ summary: 'Export user notification preferences' })
  @ApiResponse({ status: 200, description: 'Preferences exported successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async exportPreferences() {
    try {
      // In a real application, you'd get the user ID from the JWT token
      const userId = 'user-id-from-jwt'; // This should come from the authenticated user
      
      const preferences = await this.notificationPreferencesService.exportPreferences(userId);
      
      return {
        success: true,
        message: 'Notification preferences exported successfully',
        data: preferences,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to export notification preferences: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('preferences/import')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @ApiOperation({ summary: 'Import user notification preferences' })
  @ApiResponse({ status: 200, description: 'Preferences imported successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async importPreferences(@Body() importedPreferences: any) {
    try {
      // In a real application, you'd get the user ID from the JWT token
      const userId = 'user-id-from-jwt'; // This should come from the authenticated user
      
      const preferences = await this.notificationPreferencesService.importPreferences(
        userId,
        importedPreferences,
      );
      
      return {
        success: true,
        message: 'Notification preferences imported successfully',
        data: preferences,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to import notification preferences: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Admin-only endpoints
  @Post('cleanup/expired')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Clean up expired notifications (Admin only)' })
  @ApiResponse({ status: 200, description: 'Cleanup completed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async cleanupExpiredNotifications() {
    try {
      const result = await this.inAppNotificationService.cleanupExpiredNotifications();
      
      return {
        success: true,
        message: `Cleanup completed successfully. ${result.deletedCount} expired notifications removed.`,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to cleanup expired notifications: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
