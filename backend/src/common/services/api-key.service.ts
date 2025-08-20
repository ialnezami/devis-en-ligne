import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ApiKey } from '../entities/api-key.entity';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../companies/entities/company.entity';

export interface CreateApiKeyDto {
  name: string;
  description?: string;
  permissions: string[];
  expiresAt?: Date;
  userId: string;
  companyId: string;
}

export interface ApiKeyPermissions {
  quotations: {
    read: boolean;
    write: boolean;
    delete: boolean;
  };
  clients: {
    read: boolean;
    write: boolean;
    delete: boolean;
  };
  files: {
    read: boolean;
    write: boolean;
    delete: boolean;
  };
  analytics: {
    read: boolean;
    write: boolean;
  };
  webhooks: {
    read: boolean;
    write: boolean;
  };
}

@Injectable()
export class ApiKeyService {
  private readonly logger = new Logger(ApiKeyService.name);

  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  /**
   * Create a new API key
   */
  async createApiKey(createApiKeyDto: CreateApiKeyDto): Promise<ApiKey> {
    const { userId, companyId, name, description, permissions, expiresAt } = createApiKeyDto;

    // Validate user and company
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const company = await this.companyRepository.findOne({ where: { id: companyId } });
    if (!company) {
      throw new BadRequestException('Company not found');
    }

    // Generate API key
    const apiKey = uuidv4().replace(/-/g, '');
    const hashedApiKey = await this.hashApiKey(apiKey);

    // Create API key entity
    const newApiKey = this.apiKeyRepository.create({
      name,
      description,
      key: hashedApiKey,
      permissions: this.validatePermissions(permissions),
      expiresAt,
      userId,
      companyId,
      isActive: true,
      lastUsedAt: null,
      usageCount: 0,
    });

    const savedApiKey = await this.apiKeyRepository.save(newApiKey);

    // Return the API key with the plain text key (only shown once)
    return {
      ...savedApiKey,
      key: apiKey, // Return plain text key for user to copy
    } as ApiKey;
  }

  /**
   * Validate API key and return associated user and permissions
   */
  async validateApiKey(apiKey: string): Promise<{
    user: User;
    company: Company;
    permissions: ApiKeyPermissions;
    apiKeyEntity: ApiKey;
  }> {
    const hashedApiKey = await this.hashApiKey(apiKey);
    
    const apiKeyEntity = await this.apiKeyRepository.findOne({
      where: { key: hashedApiKey, isActive: true },
      relations: ['user', 'company'],
    });

    if (!apiKeyEntity) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (apiKeyEntity.expiresAt && apiKeyEntity.expiresAt < new Date()) {
      throw new UnauthorizedException('API key has expired');
    }

    // Update usage statistics
    await this.updateApiKeyUsage(apiKeyEntity.id);

    return {
      user: apiKeyEntity.user,
      company: apiKeyEntity.company,
      permissions: apiKeyEntity.permissions as ApiKeyPermissions,
      apiKeyEntity,
    };
  }

  /**
   * Get all API keys for a user/company
   */
  async getApiKeys(userId: string, companyId: string): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      where: { userId, companyId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get API key by ID
   */
  async getApiKeyById(id: string, userId: string, companyId: string): Promise<ApiKey> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id, userId, companyId },
    });

    if (!apiKey) {
      throw new BadRequestException('API key not found');
    }

    return apiKey;
  }

  /**
   * Update API key
   */
  async updateApiKey(
    id: string,
    userId: string,
    companyId: string,
    updates: Partial<ApiKey>,
  ): Promise<ApiKey> {
    const apiKey = await this.getApiKeyById(id, userId, companyId);

    // Remove sensitive fields from updates
    delete updates.key;
    delete updates.userId;
    delete updates.companyId;

    Object.assign(apiKey, updates);
    return this.apiKeyRepository.save(apiKey);
  }

  /**
   * Deactivate API key
   */
  async deactivateApiKey(id: string, userId: string, companyId: string): Promise<void> {
    const apiKey = await this.getApiKeyById(id, userId, companyId);
    apiKey.isActive = false;
    await this.apiKeyRepository.save(apiKey);
  }

  /**
   * Delete API key
   */
  async deleteApiKey(id: string, userId: string, companyId: string): Promise<void> {
    const apiKey = await this.getApiKeyById(id, userId, companyId);
    await this.apiKeyRepository.remove(apiKey);
  }

  /**
   * Regenerate API key
   */
  async regenerateApiKey(id: string, userId: string, companyId: string): Promise<ApiKey> {
    const apiKey = await this.getApiKeyById(id, userId, companyId);
    
    // Generate new key
    const newApiKey = uuidv4().replace(/-/g, '');
    const hashedApiKey = await this.hashApiKey(newApiKey);
    
    apiKey.key = hashedApiKey;
    apiKey.updatedAt = new Date();
    
    const savedApiKey = await this.apiKeyRepository.save(apiKey);
    
    // Return with plain text key
    return {
      ...savedApiKey,
      key: newApiKey,
    } as ApiKey;
  }

  /**
   * Get API key usage statistics
   */
  async getApiKeyStats(userId: string, companyId: string): Promise<{
    total: number;
    active: number;
    expired: number;
    totalUsage: number;
    lastUsed: Date | null;
  }> {
    const apiKeys = await this.apiKeyRepository.find({
      where: { userId, companyId },
    });

    const now = new Date();
    const active = apiKeys.filter(key => key.isActive && (!key.expiresAt || key.expiresAt > now)).length;
    const expired = apiKeys.filter(key => key.expiresAt && key.expiresAt <= now).length;
    const totalUsage = apiKeys.reduce((sum, key) => sum + key.usageCount, 0);
    const lastUsed = apiKeys.length > 0 
      ? new Date(Math.max(...apiKeys.map(key => key.lastUsedAt?.getTime() || 0)))
      : null;

    return {
      total: apiKeys.length,
      active,
      expired,
      totalUsage,
      lastUsed,
    };
  }

  /**
   * Check if API key has specific permission
   */
  async checkPermission(
    apiKey: string,
    resource: string,
    action: string,
  ): Promise<boolean> {
    try {
      const { permissions } = await this.validateApiKey(apiKey);
      
      if (!permissions[resource]) {
        return false;
      }
      
      return permissions[resource][action] === true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Hash API key for storage
   */
  private async hashApiKey(apiKey: string): Promise<string> {
    // In production, use a proper hashing library like bcrypt
    // For now, using a simple hash for demonstration
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * Validate permissions structure
   */
  private validatePermissions(permissions: string[]): ApiKeyPermissions {
    const defaultPermissions: ApiKeyPermissions = {
      quotations: { read: false, write: false, delete: false },
      clients: { read: false, write: false, delete: false },
      files: { read: false, write: false, delete: false },
      analytics: { read: false, write: false },
      webhooks: { read: false, write: false },
    };

    // Parse permission strings like "quotations:read", "clients:write"
    permissions.forEach(permission => {
      const [resource, action] = permission.split(':');
      if (defaultPermissions[resource] && defaultPermissions[resource][action] !== undefined) {
        defaultPermissions[resource][action] = true;
      }
    });

    return defaultPermissions;
  }

  /**
   * Update API key usage statistics
   */
  private async updateApiKeyUsage(apiKeyId: string): Promise<void> {
    await this.apiKeyRepository.update(apiKeyId, {
      lastUsedAt: new Date(),
      usageCount: () => 'usage_count + 1',
    });
  }

  /**
   * Clean up expired API keys
   */
  async cleanupExpiredApiKeys(): Promise<number> {
    const result = await this.apiKeyRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
    
    this.logger.log(`Cleaned up ${result.affected} expired API keys`);
    return result.affected || 0;
  }

  /**
   * Get API key audit log
   */
  async getApiKeyAuditLog(
    apiKeyId: string,
    userId: string,
    companyId: string,
    limit: number = 100,
  ): Promise<any[]> {
    // This would typically query an audit log table
    // For now, returning basic usage information
    const apiKey = await this.getApiKeyById(apiKeyId, userId, companyId);
    
    return [
      {
        timestamp: apiKey.createdAt,
        action: 'created',
        details: 'API key created',
      },
      ...(apiKey.lastUsedAt ? [{
        timestamp: apiKey.lastUsedAt,
        action: 'used',
        details: `Used ${apiKey.usageCount} times`,
      }] : []),
      ...(apiKey.updatedAt && apiKey.updatedAt !== apiKey.createdAt ? [{
        timestamp: apiKey.updatedAt,
        action: 'updated',
        details: 'API key updated',
      }] : []),
    ];
  }
}
