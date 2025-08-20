import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  hashedKey: string;
  userId: string;
  companyId: string;
  permissions: string[];
  isActive: boolean;
  lastUsed?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateApiKeyDto {
  name: string;
  userId: string;
  companyId: string;
  permissions: string[];
  expiresAt?: Date;
}

export interface ApiKeyUsage {
  keyId: string;
  endpoint: string;
  method: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  responseTime: number;
  statusCode: number;
}

@Injectable()
export class ApiKeyService {
  private readonly logger = new Logger(ApiKeyService.name);
  private readonly apiKeys = new Map<string, ApiKey>();
  private readonly keyUsage = new Map<string, ApiKeyUsage[]>();

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.initializeDefaultKeys();
  }

  private initializeDefaultKeys(): void {
    // Initialize with some default API keys for development
    const defaultKeys = [
      {
        id: 'dev-key-1',
        name: 'Development API Key',
        key: 'dev_sk_test_1234567890abcdef',
        hashedKey: this.hashApiKey('dev_sk_test_1234567890abcdef'),
        userId: 'system',
        companyId: 'system',
        permissions: ['read:quotations', 'read:clients', 'read:analytics'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'webhook-key-1',
        name: 'Webhook Integration Key',
        key: 'webhook_sk_test_1234567890abcdef',
        hashedKey: this.hashApiKey('webhook_sk_test_1234567890abcdef'),
        userId: 'system',
        companyId: 'system',
        permissions: ['webhook:send', 'webhook:receive'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    defaultKeys.forEach(key => {
      this.apiKeys.set(key.id, key);
    });
  }

  private hashApiKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }

  private generateApiKey(): string {
    const prefix = 'sk_live_';
    const randomPart = randomBytes(24).toString('hex');
    return prefix + randomPart;
  }

  async createApiKey(createDto: CreateApiKeyDto): Promise<ApiKey> {
    const key = this.generateApiKey();
    const hashedKey = this.hashApiKey(key);

    const apiKey: ApiKey = {
      id: `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: createDto.name,
      key,
      hashedKey,
      userId: createDto.userId,
      companyId: createDto.companyId,
      permissions: createDto.permissions,
      isActive: true,
      expiresAt: createDto.expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.apiKeys.set(apiKey.id, apiKey);
    
    // Return the API key with the plain text key (only shown once)
    const response = { ...apiKey };
    delete response.hashedKey;
    
    this.logger.log(`API key created: ${apiKey.name} for user ${apiKey.userId}`);
    
    return response;
  }

  async validateApiKey(apiKey: string): Promise<ApiKey | null> {
    const hashedKey = this.hashApiKey(apiKey);
    
    for (const key of this.apiKeys.values()) {
      if (key.hashedKey === hashedKey && key.isActive) {
        // Check if key has expired
        if (key.expiresAt && key.expiresAt < new Date()) {
          this.logger.warn(`API key expired: ${key.name}`);
          return null;
        }
        
        // Update last used timestamp
        key.lastUsed = new Date();
        this.apiKeys.set(key.id, key);
        
        return key;
      }
    }
    
    return null;
  }

  async getApiKeyById(id: string): Promise<ApiKey | null> {
    return this.apiKeys.get(id) || null;
  }

  async getApiKeysByUser(userId: string, companyId: string): Promise<ApiKey[]> {
    const userKeys: ApiKey[] = [];
    
    for (const key of this.apiKeys.values()) {
      if (key.userId === userId && key.companyId === companyId) {
        // Don't include the hashed key in the response
        const { hashedKey, ...safeKey } = key;
        userKeys.push(safeKey as ApiKey);
      }
    }
    
    return userKeys;
  }

  async updateApiKey(id: string, updates: Partial<ApiKey>): Promise<ApiKey | null> {
    const key = this.apiKeys.get(id);
    if (!key) {
      return null;
    }

    const updatedKey = {
      ...key,
      ...updates,
      updatedAt: new Date(),
    };

    this.apiKeys.set(id, updatedKey);
    
    // Don't include the hashed key in the response
    const { hashedKey, ...safeKey } = updatedKey;
    
    this.logger.log(`API key updated: ${updatedKey.name}`);
    
    return safeKey as ApiKey;
  }

  async deactivateApiKey(id: string): Promise<boolean> {
    const key = this.apiKeys.get(id);
    if (!key) {
      return false;
    }

    key.isActive = false;
    key.updatedAt = new Date();
    this.apiKeys.set(id, key);
    
    this.logger.log(`API key deactivated: ${key.name}`);
    
    return true;
  }

  async deleteApiKey(id: string): Promise<boolean> {
    const key = this.apiKeys.get(id);
    if (!key) {
      return false;
    }

    this.apiKeys.delete(id);
    
    // Clean up usage data
    this.keyUsage.delete(id);
    
    this.logger.log(`API key deleted: ${key.name}`);
    
    return true;
  }

  async checkPermission(apiKey: string, permission: string): Promise<boolean> {
    const key = await this.validateApiKey(apiKey);
    if (!key) {
      return false;
    }

    return key.permissions.includes(permission) || key.permissions.includes('*');
  }

  async logApiKeyUsage(usage: Omit<ApiKeyUsage, 'timestamp'>): Promise<void> {
    const usageEntry: ApiKeyUsage = {
      ...usage,
      timestamp: new Date(),
    };

    const existingUsage = this.keyUsage.get(usage.keyId) || [];
    existingUsage.push(usageEntry);
    
    // Keep only last 1000 usage entries per key
    if (existingUsage.length > 1000) {
      existingUsage.splice(0, existingUsage.length - 1000);
    }
    
    this.keyUsage.set(usage.keyId, existingUsage);
  }

  async getApiKeyUsage(keyId: string, limit: number = 100): Promise<ApiKeyUsage[]> {
    const usage = this.keyUsage.get(keyId) || [];
    return usage.slice(-limit);
  }

  async getApiKeyStats(keyId: string): Promise<{
    totalRequests: number;
    lastUsed: Date | null;
    averageResponseTime: number;
    successRate: number;
  }> {
    const usage = this.keyUsage.get(keyId) || [];
    
    if (usage.length === 0) {
      return {
        totalRequests: 0,
        lastUsed: null,
        averageResponseTime: 0,
        successRate: 0,
      };
    }

    const totalRequests = usage.length;
    const lastUsed = usage[usage.length - 1]?.timestamp || null;
    const averageResponseTime = usage.reduce((sum, entry) => sum + entry.responseTime, 0) / totalRequests;
    const successCount = usage.filter(entry => entry.statusCode < 400).length;
    const successRate = (successCount / totalRequests) * 100;

    return {
      totalRequests,
      lastUsed,
      averageResponseTime,
      successRate,
    };
  }

  async rotateApiKey(id: string): Promise<{ oldKey: string; newKey: string } | null> {
    const key = this.apiKeys.get(id);
    if (!key) {
      return null;
    }

    const oldKey = key.key;
    const newKey = this.generateApiKey();
    const newHashedKey = this.hashApiKey(newKey);

    // Create new key entry
    const rotatedKey: ApiKey = {
      ...key,
      key: newKey,
      hashedKey: newHashedKey,
      updatedAt: new Date(),
    };

    this.apiKeys.set(id, rotatedKey);
    
    this.logger.log(`API key rotated: ${key.name}`);
    
    return {
      oldKey,
      newKey,
    };
  }

  async getApiKeyPermissions(apiKey: string): Promise<string[]> {
    const key = await this.validateApiKey(apiKey);
    return key?.permissions || [];
  }

  async validateApiKeyWithPermissions(apiKey: string, requiredPermissions: string[]): Promise<boolean> {
    const key = await this.validateApiKey(apiKey);
    if (!key) {
      return false;
    }

    return requiredPermissions.every(permission => 
      key.permissions.includes(permission) || key.permissions.includes('*')
    );
  }

  async getApiKeyInfo(apiKey: string): Promise<Omit<ApiKey, 'key' | 'hashedKey'> | null> {
    const key = await this.validateApiKey(apiKey);
    if (!key) {
      return null;
    }

    const { key: _, hashedKey: __, ...keyInfo } = key;
    return keyInfo;
  }

  async searchApiKeys(query: string, userId?: string, companyId?: string): Promise<Omit<ApiKey, 'key' | 'hashedKey'>[]> {
    const results: Omit<ApiKey, 'key' | 'hashedKey'>[] = [];
    
    for (const key of this.apiKeys.values()) {
      // Apply filters
      if (userId && key.userId !== userId) continue;
      if (companyId && key.companyId !== companyId) continue;
      
      // Apply search query
      if (query && !key.name.toLowerCase().includes(query.toLowerCase())) continue;
      
      const { key: _, hashedKey: __, ...keyInfo } = key;
      results.push(keyInfo);
    }
    
    return results;
  }

  async getApiKeyCounts(): Promise<{
    total: number;
    active: number;
    inactive: number;
    expired: number;
  }> {
    let total = 0;
    let active = 0;
    let inactive = 0;
    let expired = 0;

    for (const key of this.apiKeys.values()) {
      total++;
      
      if (key.isActive) {
        if (key.expiresAt && key.expiresAt < new Date()) {
          expired++;
        } else {
          active++;
        }
      } else {
        inactive++;
      }
    }

    return { total, active, inactive, expired };
  }
}
