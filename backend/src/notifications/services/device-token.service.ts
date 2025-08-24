import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceToken } from '../entities/device-token.entity';

@Injectable()
export class DeviceTokenService {
  private readonly logger = new Logger(DeviceTokenService.name);

  constructor(
    @InjectRepository(DeviceToken)
    private readonly deviceTokenRepository: Repository<DeviceToken>,
  ) {}

  /**
   * Register a new device token
   */
  async registerDeviceToken(
    userId: string,
    companyId: string,
    token: string,
    platform: 'android' | 'ios' | 'web',
    deviceId: string,
    deviceName?: string,
    appVersion?: string,
    osVersion?: string,
  ): Promise<DeviceToken> {
    try {
      // Check if token already exists for this device
      const existingToken = await this.deviceTokenRepository.findOne({
        where: { deviceId, userId, companyId },
      });

      if (existingToken) {
        // Update existing token
        existingToken.token = token;
        existingToken.platform = platform;
        existingToken.deviceName = deviceName;
        existingToken.appVersion = appVersion;
        existingToken.osVersion = osVersion;
        existingToken.isActive = true;
        existingToken.lastUsed = new Date();
        existingToken.updatedAt = new Date();

        const updatedToken = await this.deviceTokenRepository.save(existingToken);
        
        this.logger.log('Device token updated successfully', { 
          deviceId, 
          userId, 
          platform 
        });

        return updatedToken;
      }

      // Create new device token
      const deviceToken = this.deviceTokenRepository.create({
        userId,
        companyId,
        token,
        platform,
        deviceId,
        deviceName,
        appVersion,
        osVersion,
        isActive: true,
        lastUsed: new Date(),
      });

      const savedToken = await this.deviceTokenRepository.save(deviceToken);
      
      this.logger.log('Device token registered successfully', { 
        deviceId, 
        userId, 
        platform 
      });

      return savedToken;
    } catch (error) {
      this.logger.error('Failed to register device token', error);
      throw error;
    }
  }

  /**
   * Get all device tokens for a user
   */
  async getUserDeviceTokens(userId: string, companyId: string): Promise<DeviceToken[]> {
    try {
      return await this.deviceTokenRepository.find({
        where: { userId, companyId, isActive: true },
        order: { lastUsed: 'DESC' },
      });
    } catch (error) {
      this.logger.error('Failed to get user device tokens', error);
      throw error;
    }
  }

  /**
   * Get all device tokens for a company
   */
  async getCompanyDeviceTokens(companyId: string): Promise<DeviceToken[]> {
    try {
      return await this.deviceTokenRepository.find({
        where: { companyId, isActive: true },
        order: { lastUsed: 'DESC' },
      });
    } catch (error) {
      this.logger.error('Failed to get company device tokens', error);
      throw error;
    }
  }

  /**
   * Get device token by ID
   */
  async getDeviceToken(id: string): Promise<DeviceToken> {
    try {
      const deviceToken = await this.deviceTokenRepository.findOne({
        where: { id },
      });

      if (!deviceToken) {
        throw new NotFoundException(`Device token with ID ${id} not found`);
      }

      return deviceToken;
    } catch (error) {
      this.logger.error('Failed to get device token', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Update device token
   */
  async updateDeviceToken(
    id: string,
    updates: Partial<Pick<DeviceToken, 'deviceName' | 'appVersion' | 'osVersion' | 'isActive'>>,
  ): Promise<DeviceToken> {
    try {
      const deviceToken = await this.getDeviceToken(id);
      
      Object.assign(deviceToken, updates);
      deviceToken.updatedAt = new Date();

      if (updates.isActive !== undefined) {
        deviceToken.lastUsed = new Date();
      }

      const updatedToken = await this.deviceTokenRepository.save(deviceToken);
      
      this.logger.log('Device token updated successfully', { id });

      return updatedToken;
    } catch (error) {
      this.logger.error('Failed to update device token', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Deactivate device token
   */
  async deactivateDeviceToken(id: string): Promise<DeviceToken> {
    try {
      const deviceToken = await this.getDeviceToken(id);
      deviceToken.isActive = false;
      deviceToken.updatedAt = new Date();

      const deactivatedToken = await this.deviceTokenRepository.save(deviceToken);
      
      this.logger.log('Device token deactivated successfully', { id });

      return deactivatedToken;
    } catch (error) {
      this.logger.error('Failed to deactivate device token', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Reactivate device token
   */
  async reactivateDeviceToken(id: string): Promise<DeviceToken> {
    try {
      const deviceToken = await this.getDeviceToken(id);
      deviceToken.isActive = true;
      deviceToken.lastUsed = new Date();
      deviceToken.updatedAt = new Date();

      const reactivatedToken = await this.deviceTokenRepository.save(deviceToken);
      
      this.logger.log('Device token reactivated successfully', { id });

      return reactivatedToken;
    } catch (error) {
      this.logger.error('Failed to reactivate device token', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Remove device token
   */
  async removeDeviceToken(id: string): Promise<void> {
    try {
      const deviceToken = await this.getDeviceToken(id);
      await this.deviceTokenRepository.remove(deviceToken);
      
      this.logger.log('Device token removed successfully', { id });
    } catch (error) {
      this.logger.error('Failed to remove device token', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Remove all tokens for a user
   */
  async removeUserDeviceTokens(userId: string, companyId: string): Promise<void> {
    try {
      const tokens = await this.getUserDeviceTokens(userId, companyId);
      
      for (const token of tokens) {
        await this.deviceTokenRepository.remove(token);
      }
      
      this.logger.log('All user device tokens removed successfully', { userId, companyId });
    } catch (error) {
      this.logger.error('Failed to remove user device tokens', error);
      throw error;
    }
  }

  /**
   * Get device tokens by platform
   */
  async getDeviceTokensByPlatform(
    companyId: string,
    platform: 'android' | 'ios' | 'web',
  ): Promise<DeviceToken[]> {
    try {
      return await this.deviceTokenRepository.find({
        where: { companyId, platform, isActive: true },
        order: { lastUsed: 'DESC' },
      });
    } catch (error) {
      this.logger.error('Failed to get device tokens by platform', error);
      throw error;
    }
  }

  /**
   * Get active device count by platform
   */
  async getActiveDeviceCountByPlatform(companyId: string): Promise<Record<string, number>> {
    try {
      const platforms = ['android', 'ios', 'web'] as const;
      const counts: Record<string, number> = {};

      for (const platform of platforms) {
        const count = await this.deviceTokenRepository.count({
          where: { companyId, platform, isActive: true },
        });
        counts[platform] = count;
      }

      return counts;
    } catch (error) {
      this.logger.error('Failed to get active device count by platform', error);
      throw error;
    }
  }

  /**
   * Clean up inactive tokens
   */
  async cleanupInactiveTokens(daysInactive: number = 30): Promise<{ removed: number; errors: string[] }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

      const inactiveTokens = await this.deviceTokenRepository.find({
        where: {
          isActive: false,
          lastUsed: cutoffDate,
        },
      });

      let removed = 0;
      const errors: string[] = [];

      for (const token of inactiveTokens) {
        try {
          await this.deviceTokenRepository.remove(token);
          removed++;
        } catch (error) {
          errors.push(`Failed to remove token ${token.id}: ${error.message}`);
        }
      }

      this.logger.log('Inactive tokens cleanup completed', { removed, errors: errors.length });

      return { removed, errors };
    } catch (error) {
      this.logger.error('Failed to cleanup inactive tokens', error);
      throw error;
    }
  }

  /**
   * Get device token statistics
   */
  async getDeviceTokenStats(companyId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    byPlatform: Record<string, { total: number; active: number; inactive: number }>;
    recentRegistrations: number;
    recentDeactivations: number;
  }> {
    try {
      const [total, active, inactive] = await Promise.all([
        this.deviceTokenRepository.count({ where: { companyId } }),
        this.deviceTokenRepository.count({ where: { companyId, isActive: true } }),
        this.deviceTokenRepository.count({ where: { companyId, isActive: false } }),
      ]);

      const platforms = ['android', 'ios', 'web'] as const;
      const byPlatform: Record<string, { total: number; active: number; inactive: number }> = {};

      for (const platform of platforms) {
        const [platformTotal, platformActive, platformInactive] = await Promise.all([
          this.deviceTokenRepository.count({ where: { companyId, platform } }),
          this.deviceTokenRepository.count({ where: { companyId, platform, isActive: true } }),
          this.deviceTokenRepository.count({ where: { companyId, platform, isActive: false } }),
        ]);

        byPlatform[platform] = {
          total: platformTotal,
          active: platformActive,
          inactive: platformInactive,
        };
      }

      // Get recent registrations (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentRegistrations = await this.deviceTokenRepository.count({
        where: {
          companyId,
          createdAt: weekAgo,
        },
      });

      // Get recent deactivations (last 7 days)
      const recentDeactivations = await this.deviceTokenRepository.count({
        where: {
          companyId,
          isActive: false,
          updatedAt: weekAgo,
        },
      });

      return {
        total,
        active,
        inactive,
        byPlatform,
        recentRegistrations,
        recentDeactivations,
      };
    } catch (error) {
      this.logger.error('Failed to get device token statistics', error);
      throw error;
    }
  }

  /**
   * Validate device token format
   */
  validateTokenFormat(token: string, platform: 'android' | 'ios' | 'web'): boolean {
    try {
      switch (platform) {
        case 'android':
          // Firebase FCM tokens are typically 140+ characters
          return token.length >= 140 && token.length <= 200;
        case 'ios':
          // APNS tokens are 64 characters
          return token.length === 64;
        case 'web':
          // Web push tokens can vary in length
          return token.length >= 100 && token.length <= 500;
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if device token is valid
   */
  async isTokenValid(token: string): Promise<boolean> {
    try {
      const deviceToken = await this.deviceTokenRepository.findOne({
        where: { token, isActive: true },
      });

      return !!deviceToken;
    } catch (error) {
      this.logger.error('Failed to check token validity', error);
      return false;
    }
  }
}
