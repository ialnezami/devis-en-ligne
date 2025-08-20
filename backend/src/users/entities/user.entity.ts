import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { Company } from '../../companies/entities/company.entity';
import { Quotation } from '../../quotations/entities/quotation.entity';
import { Notification } from '../../notifications/entities/notification.entity';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  SALES_REP = 'sales_rep',
  CLIENT = 'client',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @IsNotEmpty()
  username: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  lastName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    array: true,
    default: [UserRole.CLIENT],
  })
  roles: UserRole[];

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION,
  })
  status: UserStatus;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'boolean', default: false })
  phoneVerified: boolean;

  @Column({ type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude()
  twoFactorSecret?: string;

  @Column({ type: 'text', array: true, default: [] })
  @Exclude()
  backupCodes?: string[];

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  lastLoginIp?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude()
  passwordResetToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpiresAt?: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  suspensionReason?: string;

  @Column({ type: 'jsonb', nullable: true })
  preferences?: {
    language?: string;
    timezone?: string;
    currency?: string;
    theme?: 'light' | 'dark';
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
      inApp?: boolean;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    source?: string;
    campaign?: string;
    referrer?: string;
    userAgent?: string;
    [key: string]: any;
  };

  // Company relationship
  @ManyToOne(() => Company, (company) => company.users, { nullable: true })
  @JoinColumn({ name: 'companyId' })
  company?: Company;

  @Column({ type: 'uuid', nullable: true })
  companyId?: string;

  // Quotations relationship
  @OneToMany(() => Quotation, (quotation) => quotation.createdBy)
  quotations: Quotation[];

  // Notifications relationship
  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Virtual properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  get isAdmin(): boolean {
    return this.roles?.some(role => [UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(role)) || false;
  }

  get isManager(): boolean {
    return this.roles?.some(role => [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER].includes(role)) || false;
  }

  // Hooks
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && this.password.length < 60) {
      const saltRounds = 12;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  // Methods
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  async changePassword(newPassword: string): Promise<void> {
    this.password = newPassword;
    await this.hashPassword();
  }

  enableTwoFactor(secret: string, backupCodes: string[]): void {
    this.twoFactorEnabled = true;
    this.twoFactorSecret = secret;
    this.backupCodes = backupCodes;
  }

  disableTwoFactor(): void {
    this.twoFactorEnabled = false;
    this.twoFactorSecret = undefined;
    this.backupCodes = [];
  }

  verifyTwoFactorCode(code: string): boolean {
    // This would typically use a TOTP library like 'speakeasy'
    // For now, just a placeholder
    return true;
  }

  verifyBackupCode(code: string): boolean {
    if (!this.backupCodes) return false;
    const index = this.backupCodes.indexOf(code);
    if (index > -1) {
      this.backupCodes.splice(index, 1);
      return true;
    }
    return false;
  }

  updateLastLogin(ip: string): void {
    this.lastLoginAt = new Date();
    this.lastLoginIp = ip;
  }

  activate(): void {
    this.status = UserStatus.ACTIVE;
    this.emailVerified = true;
  }

  suspend(): void {
    this.status = UserStatus.SUSPENDED;
  }

  deactivate(): void {
    this.status = UserStatus.INACTIVE;
  }

  toJSON() {
    const user = { ...this };
    delete user.password;
    delete user.twoFactorSecret;
    delete user.backupCodes;
    return user;
  }
}
