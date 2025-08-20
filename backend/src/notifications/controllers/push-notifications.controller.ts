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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { PushNotificationService, PushNotificationOptions } from '../services/push-notification.service';
import { DeviceTokenService } from '../services/device-token.service';
import { NotificationTemplateService } from '../services/notification-template.service';
import { CreateNotificationTemplateDto } from '../dto/create-notification-template.dto';
import { UpdateNotificationTemplateDto } from '../dto/update-notification-template.dto';

@ApiTags('Push Notifications')
@Controller('push-notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PushNotificationsController {
  constructor(
    private readonly pushNotificationService: PushNotificationService,
    private readonly deviceTokenService: DeviceTokenService,
    private readonly notificationTemplateService: NotificationTemplateService,
  ) {}

  // Device Token Management

  @Post('devices/register')
  @ApiOperation({ summary: 'Register a new device token' })
  @ApiResponse({ status: 201, description: 'Device token registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async registerDeviceToken(
    @Body() body: {
      userId: string;
      companyId: string;
      token: string;
      platform: 'android' | 'ios' | 'web';
      deviceId: string;
      deviceName?: string;
      appVersion?: string;
      osVersion?: string;
    },
  ) {
    try {
      const deviceToken = await this.deviceTokenService.registerDeviceToken(
        body.userId,
        body.companyId,
        body.token,
        body.platform,
        body.deviceId,
        body.deviceName,
        body.appVersion,
        body.osVersion,
      );

      return {
        success: true,
        message: 'Device token registered successfully',
        deviceToken,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to register device token',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('devices/user/:userId')
  @ApiOperation({ summary: 'Get device tokens for a user' })
  @ApiResponse({ status: 200, description: 'Device tokens retrieved successfully' })
  @ApiQuery({ name: 'companyId', required: true, description: 'Company ID' })
  async getUserDeviceTokens(
    @Param('userId') userId: string,
    @Query('companyId') companyId: string,
  ) {
    try {
      const deviceTokens = await this.deviceTokenService.getUserDeviceTokens(userId, companyId);
      return {
        success: true,
        deviceTokens,
        count: deviceTokens.length,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get user device tokens',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('devices/:id')
  @ApiOperation({ summary: 'Update device token' })
  @ApiResponse({ status: 200, description: 'Device token updated successfully' })
  @ApiResponse({ status: 404, description: 'Device token not found' })
  async updateDeviceToken(
    @Param('id') id: string,
    @Body() updates: {
      deviceName?: string;
      appVersion?: string;
      osVersion?: string;
      isActive?: boolean;
    },
  ) {
    try {
      const deviceToken = await this.deviceTokenService.updateDeviceToken(id, updates);
      return {
        success: true,
        message: 'Device token updated successfully',
        deviceToken,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update device token',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('devices/:id')
  @ApiOperation({ summary: 'Remove device token' })
  @ApiResponse({ status: 200, description: 'Device token removed successfully' })
  @ApiResponse({ status: 404, description: 'Device token not found' })
  async removeDeviceToken(@Param('id') id: string) {
    try {
      await this.deviceTokenService.removeDeviceToken(id);
      return {
        success: true,
        message: 'Device token removed successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to remove device token',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('devices/stats/:companyId')
  @ApiOperation({ summary: 'Get device token statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getDeviceTokenStats(@Param('companyId') companyId: string) {
    try {
      const stats = await this.deviceTokenService.getDeviceTokenStats(companyId);
      return {
        success: true,
        stats,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get device token statistics',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Notification Templates

  @Post('templates')
  @ApiOperation({ summary: 'Create a new notification template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createNotificationTemplate(@Body() createTemplateDto: CreateNotificationTemplateDto) {
    try {
      const template = await this.notificationTemplateService.createTemplate(createTemplateDto);
      return {
        success: true,
        message: 'Notification template created successfully',
        template,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create notification template',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get all notification templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'platform', required: false, description: 'Filter by platform' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in name, title, or body' })
  async getNotificationTemplates(
    @Query('category') category?: string,
    @Query('platform') platform?: 'android' | 'ios' | 'web',
    @Query('isActive') isActive?: boolean,
    @Query('search') search?: string,
  ) {
    try {
      const filters: any = {};
      if (category) filters.category = category;
      if (platform) filters.platform = platform;
      if (isActive !== undefined) filters.isActive = isActive;
      if (search) filters.search = search;

      const templates = await this.notificationTemplateService.findAll(filters);
      return {
        success: true,
        templates,
        count: templates.length,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get notification templates',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get notification template by ID' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async getNotificationTemplate(@Param('id') id: string) {
    try {
      const template = await this.notificationTemplateService.findOne(id);
      return {
        success: true,
        template,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Template not found',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put('templates/:id')
  @ApiOperation({ summary: 'Update notification template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async updateNotificationTemplate(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateNotificationTemplateDto,
  ) {
    try {
      const template = await this.notificationTemplateService.updateTemplate(id, updateTemplateDto);
      return {
        success: true,
        message: 'Notification template updated successfully',
        template,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update notification template',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete notification template' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async deleteNotificationTemplate(@Param('id') id: string) {
    try {
      await this.notificationTemplateService.removeTemplate(id);
      return {
        success: true,
        message: 'Notification template deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete notification template',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('templates/:id/activate')
  @ApiOperation({ summary: 'Activate notification template' })
  @ApiResponse({ status: 200, description: 'Template activated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async activateTemplate(@Param('id') id: string) {
    try {
      const template = await this.notificationTemplateService.activateTemplate(id);
      return {
        success: true,
        message: 'Notification template activated successfully',
        template,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to activate notification template',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('templates/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate notification template' })
  @ApiResponse({ status: 200, description: 'Template deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async deactivateTemplate(@Param('id') id: string) {
    try {
      const template = await this.notificationTemplateService.deactivateTemplate(id);
      return {
        success: true,
        message: 'Notification template deactivated successfully',
        template,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to deactivate notification template',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('templates/categories')
  @ApiOperation({ summary: 'Get template categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async getTemplateCategories() {
    try {
      const categories = await this.notificationTemplateService.getTemplateCategories();
      return {
        success: true,
        categories,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get template categories',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('templates/stats')
  @ApiOperation({ summary: 'Get template statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getTemplateStats() {
    try {
      const stats = await this.notificationTemplateService.getTemplateStats();
      return {
        success: true,
        stats,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get template statistics',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Push Notifications

  @Post('send')
  @ApiOperation({ summary: 'Send push notification to specific devices' })
  @ApiResponse({ status: 201, description: 'Notification sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async sendPushNotification(
    @Body() body: {
      tokens: string[];
      options: PushNotificationOptions;
    },
  ) {
    try {
      const result = await this.pushNotificationService.sendToMultipleDevices(
        body.tokens,
        body.options,
      );

      return {
        success: true,
        message: 'Push notification sent successfully',
        result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to send push notification',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('send/topic')
  @ApiOperation({ summary: 'Send push notification to a topic' })
  @ApiResponse({ status: 201, description: 'Topic notification sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async sendTopicNotification(
    @Body() body: {
      topic: string;
      options: PushNotificationOptions;
    },
  ) {
    try {
      const result = await this.pushNotificationService.sendToTopic(body.topic, body.options);

      return {
        success: true,
        message: 'Topic notification sent successfully',
        result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to send topic notification',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('schedule')
  @ApiOperation({ summary: 'Schedule a push notification' })
  @ApiResponse({ status: 201, description: 'Notification scheduled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async scheduleNotification(
    @Body() body: {
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
    },
  ) {
    try {
      const result = await this.pushNotificationService.scheduleNotification(body);

      return {
        success: true,
        message: 'Notification scheduled successfully',
        scheduleId: result.scheduleId,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to schedule notification',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('schedule/cancel/:scheduleId')
  @ApiOperation({ summary: 'Cancel a scheduled notification' })
  @ApiResponse({ status: 200, description: 'Notification cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async cancelScheduledNotification(@Param('scheduleId') scheduleId: string) {
    try {
      const result = await this.pushNotificationService.cancelScheduledNotification(scheduleId);

      return {
        success: true,
        message: 'Scheduled notification cancelled successfully',
        result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to cancel scheduled notification',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('topics/subscribe')
  @ApiOperation({ summary: 'Subscribe devices to a topic' })
  @ApiResponse({ status: 200, description: 'Devices subscribed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async subscribeToTopic(
    @Body() body: {
      tokens: string[];
      topic: string;
    },
  ) {
    try {
      const result = await this.pushNotificationService.subscribeToTopic(body.tokens, body.topic);

      return {
        success: true,
        message: 'Devices subscribed to topic successfully',
        result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to subscribe devices to topic',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('topics/unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe devices from a topic' })
  @ApiResponse({ status: 200, description: 'Devices unsubscribed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async unsubscribeFromTopic(
    @Body() body: {
      tokens: string[];
      topic: string;
    },
  ) {
    try {
      const result = await this.pushNotificationService.unsubscribeFromTopic(body.tokens, body.topic);

      return {
        success: true,
        message: 'Devices unsubscribed from topic successfully',
        result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to unsubscribe devices from topic',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get push notification statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: true, description: 'End date (ISO string)' })
  async getNotificationStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    try {
      const stats = await this.pushNotificationService.getNotificationStats({
        start: new Date(startDate),
        end: new Date(endDate),
      });

      return {
        success: true,
        stats,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get notification statistics',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('templates/defaults')
  @ApiOperation({ summary: 'Create default notification templates' })
  @ApiResponse({ status: 200, description: 'Default templates created successfully' })
  @Roles(UserRole.ADMIN)
  async createDefaultTemplates() {
    try {
      await this.notificationTemplateService.createDefaultTemplates();
      return {
        success: true,
        message: 'Default notification templates created successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create default templates',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('cleanup/tokens')
  @ApiOperation({ summary: 'Clean up inactive device tokens' })
  @ApiResponse({ status: 200, description: 'Cleanup completed successfully' })
  @ApiQuery({ name: 'daysInactive', required: false, description: 'Days of inactivity (default: 30)' })
  @Roles(UserRole.ADMIN)
  async cleanupInactiveTokens(@Query('daysInactive') daysInactive: number = 30) {
    try {
      const result = await this.deviceTokenService.cleanupInactiveTokens(daysInactive);
      return {
        success: true,
        message: 'Inactive tokens cleanup completed',
        result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to cleanup inactive tokens',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
