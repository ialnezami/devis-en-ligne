import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { EmailService } from '../notifications/email.service';
import { UserRole, UserStatus } from '../users/entities/user.entity';
import { Logger } from '../common/logger/logger.service';
import * as crypto from 'crypto';

@Injectable()
export class RecoveryService {
  constructor(
    private usersService: UsersService,
    private emailService: EmailService,
    private configService: ConfigService,
    private logger: Logger,
  ) {}

  /**
   * Initiate account recovery for users who lost access to 2FA
   */
  async initiateRecovery(email: string) {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      // Always return success to prevent email enumeration
      return { message: 'If an account with that email exists, a recovery email has been sent.' };
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled for this account');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('Account is not active');
    }

    // Generate recovery token
    const recoveryToken = await this.generateRecoveryToken(user.id);
    
    // Send recovery email
    await this.emailService.send2FARecoveryEmail(user.email, recoveryToken);
    
    this.logger.log('2FA recovery initiated', { userId: user.id, email: user.email });
    
    return { message: 'Recovery email sent successfully' };
  }

  /**
   * Verify recovery token and disable 2FA
   */
  async verifyRecoveryToken(token: string) {
    const user = await this.findByRecoveryToken(token);
    
    if (!user) {
      throw new BadRequestException('Invalid or expired recovery token');
    }

    // Disable 2FA
    await this.usersService.disable2FA(user.id);
    
    // Clear recovery token
    await this.clearRecoveryToken(user.id);
    
    this.logger.log('2FA recovery completed', { userId: user.id });
    
    return { 
      message: 'Two-factor authentication has been disabled. You can now log in with just your password.',
      userId: user.id 
    };
  }

  /**
   * Generate a recovery token for 2FA recovery
   */
  private async generateRecoveryToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.usersService.updateRecoveryToken(userId, token, expiresAt);
    
    return token;
  }

  /**
   * Find user by recovery token
   */
  private async findByRecoveryToken(token: string) {
    return this.usersService.findByRecoveryToken(token);
  }

  /**
   * Clear recovery token after use
   */
  private async clearRecoveryToken(userId: string): Promise<void> {
    await this.usersService.clearRecoveryToken(userId);
  }

  /**
   * Check if user has backup codes remaining
   */
  async checkBackupCodesStatus(userId: string) {
    const user = await this.usersService.findById(userId);
    
    if (!user || !user.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled for this user');
    }

    return {
      hasBackupCodes: (user.backupCodes?.length || 0) > 0,
      remainingCodes: user.backupCodes?.length || 0,
      shouldRegenerate: (user.backupCodes?.length || 0) < 3, // Suggest regeneration if less than 3 codes
    };
  }

  /**
   * Emergency disable 2FA for admin use
   */
  async emergencyDisable2FA(userId: string, adminUserId: string, reason: string) {
    const adminUser = await this.usersService.findById(adminUserId);
    
    if (!adminUser || !adminUser.roles.includes(UserRole.ADMIN)) {
      throw new UnauthorizedException('Admin privileges required');
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled for this user');
    }

    // Disable 2FA
    await this.usersService.disable2FA(userId);
    
    // Log the emergency action
    this.logger.warn('2FA emergency disabled by admin', { 
      userId, 
      adminUserId, 
      reason,
      adminEmail: adminUser.email 
    });
    
    return { 
      message: 'Two-factor authentication has been emergency disabled by administrator',
      reason,
      adminEmail: adminUser.email,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get recovery statistics for admin dashboard
   */
  async getRecoveryStats() {
    const totalUsers = await this.usersService.countByStatus(UserStatus.ACTIVE);
    const usersWith2FA = await this.usersService.countUsersWith2FA();
    const usersWithBackupCodes = await this.usersService.countUsersWithBackupCodes();
    
    return {
      totalActiveUsers: totalUsers,
      usersWith2FA: usersWith2FA,
      usersWithBackupCodes: usersWithBackupCodes,
      recoveryRate: totalUsers > 0 ? (usersWithBackupCodes / totalUsers) * 100 : 0,
    };
  }
}
