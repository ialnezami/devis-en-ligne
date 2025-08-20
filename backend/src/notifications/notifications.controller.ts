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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { EmailService, EmailOptions, BulkEmailOptions } from './services/email.service';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly emailService: EmailService) {}

  @Post('email/send')
  @ApiOperation({ summary: 'Send a single email' })
  @ApiResponse({ status: 201, description: 'Email sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async sendEmail(@Body() emailOptions: EmailOptions) {
    try {
      const result = await this.emailService.sendEmail(emailOptions);
      
      if (!result.success) {
        throw new HttpException(result.error || 'Email sending failed', HttpStatus.BAD_REQUEST);
      }
      
      return {
        success: true,
        trackingId: result.trackingId,
        message: 'Email queued successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to send email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('email/send-immediate')
  @ApiOperation({ summary: 'Send email immediately (bypass queue)' })
  @ApiResponse({ status: 201, description: 'Email sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async sendEmailImmediate(@Body() emailOptions: EmailOptions) {
    try {
      const result = await this.emailService.sendEmailImmediate(emailOptions);
      
      if (!result.success) {
        throw new HttpException(result.error || 'Email sending failed', HttpStatus.BAD_REQUEST);
      }
      
      return {
        success: true,
        trackingId: result.trackingId,
        message: 'Email sent successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to send email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('email/bulk')
  @ApiOperation({ summary: 'Send bulk emails' })
  @ApiResponse({ status: 201, description: 'Bulk emails sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async sendBulkEmails(@Body() bulkOptions: BulkEmailOptions) {
    try {
      const result = await this.emailService.sendBulkEmails(bulkOptions);
      
      return {
        success: result.success,
        total: result.total,
        successful: result.successful,
        failed: result.failed,
        errors: result.errors,
        message: result.success ? 'All emails sent successfully' : 'Some emails failed',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to send bulk emails',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('email/templates')
  @ApiOperation({ summary: 'List email templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by template category' })
  async listEmailTemplates(@Query('category') category?: string) {
    try {
      const templates = await this.emailService.listEmailTemplates(category);
      return templates;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve templates',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('email/templates/:templateId')
  @ApiOperation({ summary: 'Get email template by ID' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async getEmailTemplate(@Param('templateId') templateId: string) {
    try {
      const template = await this.emailService.getEmailTemplate(templateId);
      
      if (!template) {
        throw new HttpException('Template not found', HttpStatus.NOT_FOUND);
      }
      
      return template;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to retrieve template',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('email/templates')
  @ApiOperation({ summary: 'Create email template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createEmailTemplate(@Body() template: {
    name: string;
    subject: string;
    htmlTemplate: string;
    textTemplate: string;
    variables: string[];
    category: string;
    isActive: boolean;
  }) {
    try {
      const newTemplate = await this.emailService.createEmailTemplate(template);
      return newTemplate;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create template',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('email/templates/:templateId')
  @ApiOperation({ summary: 'Update email template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async updateEmailTemplate(
    @Param('templateId') templateId: string,
    @Body() updates: Partial<{
      name: string;
      subject: string;
      htmlTemplate: string;
      textTemplate: string;
      variables: string[];
      category: string;
      isActive: boolean;
    }>,
  ) {
    try {
      const updatedTemplate = await this.emailService.updateEmailTemplate(templateId, updates);
      
      if (!updatedTemplate) {
        throw new HttpException('Template not found', HttpStatus.NOT_FOUND);
      }
      
      return updatedTemplate;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to update template',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('email/templates/:templateId')
  @ApiOperation({ summary: 'Delete email template' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async deleteEmailTemplate(@Param('templateId') templateId: string) {
    try {
      const deleted = await this.emailService.deleteEmailTemplate(templateId);
      
      if (!deleted) {
        throw new HttpException('Template not found', HttpStatus.NOT_FOUND);
      }
      
      return { message: 'Template deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to delete template',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('email/tracking/:trackingId')
  @ApiOperation({ summary: 'Get email tracking information' })
  @ApiResponse({ status: 200, description: 'Tracking information retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Tracking not found' })
  async getEmailTracking(@Param('trackingId') trackingId: string) {
    try {
      const tracking = await this.emailService.getEmailTracking(trackingId);
      
      if (!tracking) {
        throw new HttpException('Tracking not found', HttpStatus.NOT_FOUND);
      }
      
      return tracking;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to retrieve tracking',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('email/stats')
  @ApiOperation({ summary: 'Get email statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: true, description: 'End date (ISO string)' })
  async getEmailStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new HttpException('Invalid date format', HttpStatus.BAD_REQUEST);
      }
      
      const stats = await this.emailService.getEmailStats({ start, end });
      return stats;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to retrieve statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('email/unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe email from notifications' })
  @ApiResponse({ status: 200, description: 'Email unsubscribed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async unsubscribeEmail(@Body() body: { email: string; category?: string; reason?: string }) {
    try {
      await this.emailService.unsubscribeEmail(body.email, body.category, body.reason);
      return { message: 'Email unsubscribed successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to unsubscribe email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('email/resubscribe')
  @ApiOperation({ summary: 'Resubscribe email to notifications' })
  @ApiResponse({ status: 200, description: 'Email resubscribed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async resubscribeEmail(@Body() body: { email: string; category?: string }) {
    try {
      await this.emailService.resubscribeEmail(body.email, body.category);
      return { message: 'Email resubscribed successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to resubscribe email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('email/unsubscribe-list')
  @ApiOperation({ summary: 'Get list of unsubscribed emails' })
  @ApiResponse({ status: 200, description: 'Unsubscribe list retrieved successfully' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @Roles(UserRole.ADMIN)
  async getUnsubscribeList(@Query('category') category?: string) {
    try {
      const unsubscribeList = await this.emailService.getUnsubscribeList(category);
      return unsubscribeList;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve unsubscribe list',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('email/track-open')
  @ApiOperation({ summary: 'Track email open (for tracking pixels)' })
  @ApiResponse({ status: 200, description: 'Open tracked successfully' })
  async trackEmailOpen(@Body() body: { trackingId: string }) {
    try {
      await this.emailService.trackEmailOpen(body.trackingId);
      return { message: 'Open tracked successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to track email open',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('email/track-click')
  @ApiOperation({ summary: 'Track email click' })
  @ApiResponse({ status: 200, description: 'Click tracked successfully' })
  async trackEmailClick(@Body() body: { trackingId: string; url: string }) {
    try {
      await this.emailService.trackEmailClick(body.trackingId, body.url);
      return { message: 'Click tracked successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to track email click',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('email/health')
  @ApiOperation({ summary: 'Check email service health' })
  @ApiResponse({ status: 200, description: 'Service health check' })
  async checkEmailHealth() {
    try {
      // Basic health check - could be extended with actual SMTP connection test
      return {
        status: 'healthy',
        service: 'email',
        timestamp: new Date(),
        features: {
          templates: true,
          tracking: true,
          unsubscribe: true,
          bulk: true,
          queue: true,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        service: 'email',
        timestamp: new Date(),
        error: error.message,
      };
    }
  }
}
