import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('device_tokens')
@Index(['userId', 'companyId'])
@Index(['token'], { unique: true })
@Index(['deviceId', 'userId', 'companyId'], { unique: true })
export class DeviceToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'text', unique: true })
  token: string;

  @Column({ type: 'enum', enum: ['android', 'ios', 'web'] })
  platform: 'android' | 'ios' | 'web';

  @Column({ type: 'varchar', length: 100 })
  deviceId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deviceName?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  appVersion?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  osVersion?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp' })
  lastUsed: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
