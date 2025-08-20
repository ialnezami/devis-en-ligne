import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../companies/entities/company.entity';

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

@Entity('api_keys')
@Index(['key'], { unique: true })
@Index(['userId', 'companyId'])
@Index(['isActive', 'expiresAt'])
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  key: string;

  @Column({ type: 'json' })
  permissions: ApiKeyPermissions;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  // Virtual properties for API responses
  get isExpired(): boolean {
    return this.expiresAt ? this.expiresAt < new Date() : false;
  }

  get daysUntilExpiry(): number | null {
    if (!this.expiresAt) return null;
    const now = new Date();
    const diffTime = this.expiresAt.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get status(): 'active' | 'expired' | 'inactive' {
    if (!this.isActive) return 'inactive';
    if (this.isExpired) return 'expired';
    return 'active';
  }

  get permissionSummary(): string[] {
    const summary: string[] = [];
    
    Object.entries(this.permissions).forEach(([resource, actions]) => {
      Object.entries(actions).forEach(([action, allowed]) => {
        if (allowed) {
          summary.push(`${resource}:${action}`);
        }
      });
    });
    
    return summary;
  }

  // Methods
  hasPermission(resource: string, action: string): boolean {
    return this.permissions[resource]?.[action] === true;
  }

  canRead(resource: string): boolean {
    return this.hasPermission(resource, 'read');
  }

  canWrite(resource: string): boolean {
    return this.hasPermission(resource, 'write');
  }

  canDelete(resource: string): boolean {
    return this.hasPermission(resource, 'delete');
  }

  isExpiringSoon(days: number = 7): boolean {
    if (!this.expiresAt) return false;
    const daysUntilExpiry = this.daysUntilExpiry;
    return daysUntilExpiry !== null && daysUntilExpiry <= days;
  }

  toResponseObject(): Omit<ApiKey, 'key'> {
    const { key, ...response } = this;
    return response;
  }

  toDetailedResponseObject(): any {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      permissions: this.permissions,
      isActive: this.isActive,
      expiresAt: this.expiresAt,
      lastUsedAt: this.lastUsedAt,
      usageCount: this.usageCount,
      userId: this.userId,
      companyId: this.companyId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      // Virtual properties
      isExpired: this.isExpired,
      daysUntilExpiry: this.daysUntilExpiry,
      status: this.status,
      permissionSummary: this.permissionSummary,
      isExpiringSoon: this.isExpiringSoon(),
    };
  }
}
