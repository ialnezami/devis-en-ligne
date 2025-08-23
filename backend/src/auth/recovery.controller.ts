import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { RecoveryService } from './recovery.service';
import { Public } from './decorators/public.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('2FA Recovery')
@Controller('auth/recovery')
export class RecoveryController {
  constructor(private readonly recoveryService: RecoveryService) {}

  @Public()
  @Post('initiate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate 2FA recovery process' })
  @ApiResponse({
    status: 200,
    description: 'Recovery email sent successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '2FA not enabled or account not active' })
  async initiateRecovery(@Body() body: { email: string }) {
    return this.recoveryService.initiateRecovery(body.email);
  }

  @Public()
  @Post('verify/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify recovery token and disable 2FA' })
  @ApiResponse({
    status: 200,
    description: 'Recovery completed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        userId: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired recovery token' })
  async verifyRecoveryToken(@Param('token') token: string) {
    return this.recoveryService.verifyRecoveryToken(token);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('backup-codes-status/:userId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check backup codes status for a user (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Backup codes status retrieved',
    schema: {
      type: 'object',
      properties: {
        hasBackupCodes: { type: 'boolean' },
        remainingCodes: { type: 'number' },
        shouldRegenerate: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '2FA not enabled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async checkBackupCodesStatus(@Param('userId') userId: string) {
    return this.recoveryService.checkBackupCodesStatus(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('emergency-disable/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Emergency disable 2FA for a user (Admin only)' })
  @ApiResponse({
    status: 200,
    description: '2FA emergency disabled successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        reason: { type: 'string' },
        adminEmail: { type: 'string' },
        timestamp: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '2FA not enabled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async emergencyDisable2FA(
    @Param('userId') userId: string,
    @Request() req,
    @Body() body: { reason: string },
  ) {
    return this.recoveryService.emergencyDisable2FA(userId, req.user.id, body.reason);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recovery statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Recovery statistics retrieved',
    schema: {
      type: 'object',
      properties: {
        totalActiveUsers: { type: 'number' },
        usersWith2FA: { type: 'number' },
        usersWithBackupCodes: { type: 'number' },
        recoveryRate: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getRecoveryStats() {
    return this.recoveryService.getRecoveryStats();
  }
}
