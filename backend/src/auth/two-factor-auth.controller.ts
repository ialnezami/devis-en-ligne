import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { Setup2FADto } from './dto/setup-2fa.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { Disable2FADto } from './dto/disable-2fa.dto';
import { RegenerateBackupCodesDto } from './dto/regenerate-backup-codes.dto';

@ApiTags('Two-Factor Authentication')
@Controller('auth/2fa')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TwoFactorAuthController {
  constructor(private readonly twoFactorAuthService: TwoFactorAuthService) {}

  @Post('setup/generate')
  @ApiOperation({ summary: 'Generate 2FA secret and QR code' })
  @ApiResponse({
    status: 200,
    description: '2FA secret generated successfully',
    schema: {
      type: 'object',
      properties: {
        secret: { type: 'string', description: 'TOTP secret key' },
        qrCode: { type: 'string', description: 'QR code data URL' },
        backupCodes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Backup codes for recovery',
        },
        message: { type: 'string', description: 'Instructions for setup' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '2FA already enabled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generateSecret(@Request() req) {
    return this.twoFactorAuthService.generateSecret(req.user.id);
  }

  @Post('setup/enable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enable 2FA with verification code' })
  @ApiResponse({
    status: 200,
    description: '2FA enabled successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        backupCodes: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid code or 2FA already enabled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async enable2FA(@Request() req, @Body() setup2FADto: Setup2FADto) {
    return this.twoFactorAuthService.enable2FA(req.user.id, setup2FADto.code);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify 2FA code during login' })
  @ApiResponse({
    status: 200,
    description: '2FA code verified successfully',
    schema: {
      type: 'object',
      properties: {
        verified: { type: 'boolean' },
        usedBackupCode: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '2FA not enabled' })
  @ApiResponse({ status: 401, description: 'Invalid 2FA code' })
  async verify2FA(@Request() req, @Body() verify2FADto: Verify2FADto) {
    return this.twoFactorAuthService.verify2FA(
      req.user.id,
      verify2FADto.code,
      verify2FADto.backupCode,
    );
  }

  @Post('disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable 2FA' })
  @ApiResponse({
    status: 200,
    description: '2FA disabled successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '2FA not enabled' })
  @ApiResponse({ status: 401, description: 'Invalid 2FA code' })
  async disable2FA(@Request() req, @Body() disable2FADto: Disable2FADto) {
    return this.twoFactorAuthService.disable2FA(req.user.id, disable2FADto.code);
  }

  @Post('backup-codes/regenerate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Regenerate backup codes' })
  @ApiResponse({
    status: 200,
    description: 'Backup codes regenerated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        backupCodes: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: '2FA not enabled' })
  @ApiResponse({ status: 401, description: 'Invalid 2FA code' })
  async regenerateBackupCodes(
    @Request() req,
    @Body() regenerateBackupCodesDto: RegenerateBackupCodesDto,
  ) {
    return this.twoFactorAuthService.regenerateBackupCodes(
      req.user.id,
      regenerateBackupCodesDto.code,
    );
  }

  @Get('status')
  @ApiOperation({ summary: 'Get 2FA status' })
  @ApiResponse({
    status: 200,
    description: '2FA status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        backupCodesCount: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async get2FAStatus(@Request() req) {
    return this.twoFactorAuthService.get2FAStatus(req.user.id);
  }
}
