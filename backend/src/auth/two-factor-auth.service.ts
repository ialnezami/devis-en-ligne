import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { UsersService } from '../users/users.service';
import { Logger } from '../common/logger/logger.service';

@Injectable()
export class TwoFactorAuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private logger: Logger,
  ) {}

  /**
   * Generate a new TOTP secret for a user
   */
  async generateSecret(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled for this user');
    }

    // Generate a new secret
    const secret = speakeasy.generateSecret({
      name: `${user.email} (${this.configService.get('APP_NAME', 'Online Quotation Tool')})`,
      issuer: this.configService.get('APP_NAME', 'Online Quotation Tool'),
      length: 32,
    });

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    // Store the secret temporarily (not yet enabled)
    await this.usersService.storeTemporary2FASecret(userId, secret.base32, backupCodes);

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes,
      message: 'Scan the QR code with your authenticator app and verify with the 6-digit code',
    };
  }

  /**
   * Verify and enable 2FA for a user
   */
  async enable2FA(userId: string, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled for this user');
    }

    if (!user.twoFactorSecret) {
      throw new BadRequestException('No 2FA secret found. Please generate a new secret first.');
    }

    // Verify the TOTP code
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2, // Allow 2 time steps (60 seconds) for clock skew
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    // Enable 2FA and store backup codes
    await this.usersService.enable2FA(userId, user.twoFactorSecret, user.backupCodes || []);

    this.logger.log('2FA enabled successfully', { userId });

    return {
      message: 'Two-factor authentication has been enabled successfully',
      backupCodes: user.backupCodes,
    };
  }

  /**
   * Verify 2FA code during login
   */
  async verify2FA(userId: string, code: string, backupCode?: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled for this user');
    }

    // If backup code is provided, verify it
    if (backupCode) {
      const isValidBackupCode = await this.verifyBackupCode(userId, backupCode);
      if (isValidBackupCode) {
        return { verified: true, usedBackupCode: true };
      }
      throw new UnauthorizedException('Invalid backup code');
    }

    // Verify TOTP code
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret!,
      encoding: 'base32',
      token: code,
      window: 2, // Allow 2 time steps (60 seconds) for clock skew
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    return { verified: true, usedBackupCode: false };
  }

  /**
   * Verify a backup code
   */
  async verifyBackupCode(userId: string, backupCode: string): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.backupCodes) {
      return false;
    }

    const index = user.backupCodes.indexOf(backupCode);
    if (index > -1) {
      // Remove the used backup code
      await this.usersService.removeBackupCode(userId, backupCode);
      this.logger.log('Backup code used', { userId, remainingCodes: user.backupCodes.length - 1 });
      return true;
    }

    return false;
  }

  /**
   * Disable 2FA for a user
   */
  async disable2FA(userId: string, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled for this user');
    }

    // Verify the TOTP code before disabling
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret!,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    // Disable 2FA
    await this.usersService.disable2FA(userId);

    this.logger.log('2FA disabled successfully', { userId });

    return {
      message: 'Two-factor authentication has been disabled successfully',
    };
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(userId: string, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled for this user');
    }

    // Verify the TOTP code before regenerating
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret!,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    // Generate new backup codes
    const newBackupCodes = this.generateBackupCodes();
    await this.usersService.updateBackupCodes(userId, newBackupCodes);

    this.logger.log('Backup codes regenerated', { userId });

    return {
      message: 'Backup codes have been regenerated successfully',
      backupCodes: newBackupCodes,
    };
  }

  /**
   * Get current 2FA status for a user
   */
  async get2FAStatus(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      enabled: user.twoFactorEnabled,
      backupCodesCount: user.backupCodes?.length || 0,
    };
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(this.generateBackupCode());
    }
    return codes;
  }

  /**
   * Generate a single backup code
   */
  private generateBackupCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Validate TOTP code format
   */
  validateCodeFormat(code: string): boolean {
    return /^\d{6}$/.test(code);
  }

  /**
   * Get remaining time for current TOTP period
   */
  getRemainingTime(): number {
    const now = Math.floor(Date.now() / 1000);
    return 30 - (now % 30);
  }
}
