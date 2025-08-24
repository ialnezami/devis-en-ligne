import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CompanySettings } from './company-settings.entity';
import { CompanyBranding } from './company-branding.entity';

@Entity('companies')
@Index(['name'], { unique: true })
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logo?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  zipCode?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  industry?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  size?: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  createdBy?: string;

  @Column({ type: 'int', nullable: true })
  employeeCount?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  annualRevenue?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  currency?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    timezone?: string;
    language?: string;
    dateFormat?: string;
    currencyFormat?: string;
    [key: string]: any;
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Relationships
  @OneToMany(() => User, (user) => user.company)
  users: User[];

  @OneToOne(() => CompanySettings, (settings) => settings.company)
  settings: CompanySettings;

  @OneToOne(() => CompanyBranding, (branding) => branding.company)
  branding: CompanyBranding;

  @OneToMany('Notification', (notification: any) => notification.company)
  notifications: any[];

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
