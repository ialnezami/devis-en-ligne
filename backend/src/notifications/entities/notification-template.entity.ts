import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('notification_templates')
@Index(['name'], { unique: true })
@Index(['category', 'isActive'])
export class NotificationTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: [] })
  variables: string[];

  @Column({ type: 'jsonb', default: ['android', 'ios', 'web'] })
  platforms: ('android' | 'ios' | 'web')[];

  @Column({ type: 'enum', enum: ['low', 'normal', 'high'], default: 'normal' })
  priority: 'low' | 'normal' | 'high';

  @Column({ type: 'varchar', length: 100, nullable: true })
  sound?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  clickAction?: string;

  @Column({ type: 'jsonb', nullable: true })
  data?: Record<string, string>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
