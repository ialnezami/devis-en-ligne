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
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Template } from '../../templates/entities/template.entity';
import { QuotationItem } from './quotation-item.entity';
import { QuotationStatus, QuotationPriority, ApprovalLevel, RevisionReason } from '../enums/quotation-status.enum';

@Entity('quotations')
@Index(['status', 'createdAt'])
@Index(['clientId', 'status'])
@Index(['createdById', 'status'])
@Index(['approvalStatus', 'approvalDeadline'])
@Index(['revisionStatus', 'revisionUrgency'])
export class Quotation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  quotationNumber: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: QuotationStatus,
    default: QuotationStatus.DRAFT,
  })
  status: QuotationStatus;

  @Column({
    type: 'enum',
    enum: QuotationPriority,
    default: QuotationPriority.MEDIUM,
  })
  priority: QuotationPriority;

  @Column({ type: 'varchar', length: 20, nullable: true })
  version?: string;

  // Relationships
  @ManyToOne(() => User, (user) => user.quotations)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ type: 'uuid' })
  createdById: string;

  @ManyToOne(() => Template, (template) => template.quotations, { nullable: true })
  @JoinColumn({ name: 'templateId' })
  template?: Template;

  @Column({ type: 'uuid', nullable: true })
  templateId?: string;

  // Items relationship
  @OneToMany(() => QuotationItem, (item) => item.quotation, {
    cascade: true,
    eager: false,
  })
  items: QuotationItem[];

  // Client Information
  @Column({ type: 'varchar', length: 255, nullable: true })
  clientName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  clientEmail?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  clientPhone?: string;

  @Column({ type: 'text', nullable: true })
  clientAddress?: string;

  @Column({ type: 'uuid', nullable: true })
  clientId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'clientId' })
  client?: User;

  // Quotation Details
  @Column({ type: 'text', nullable: true })
  terms?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'int', nullable: true })
  validityPeriod?: number; // in days

  @Column({ type: 'timestamp', nullable: true })
  validFrom?: Date;

  @Column({ type: 'timestamp', nullable: true })
  validUntil?: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  currency?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  taxRate?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  taxAmount?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  discountAmount?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  finalAmount?: number;

  // Approval Workflow
  @Column({ type: 'timestamp', nullable: true })
  approvalRequestedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  approvalRequestedBy?: string;

  @Column({
    type: 'enum',
    enum: ApprovalLevel,
    nullable: true,
  })
  approvalLevel?: ApprovalLevel;

  @Column({ type: 'text', nullable: true })
  approvalReason?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  approvalUrgency?: 'low' | 'medium' | 'high' | 'urgent';

  @Column({ type: 'timestamp', nullable: true })
  approvalDeadline?: Date;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  approvedById?: string;

  @Column({ type: 'text', nullable: true })
  approvalNotes?: string;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  rejectedById?: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  @Column({ type: 'jsonb', nullable: true })
  approvalHistory?: Array<{
    level: ApprovalLevel;
    approvedBy: string;
    approvedAt: Date;
    comments?: string;
  }>;

  @Column({ type: 'timestamp', nullable: true })
  approvalEscalatedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  approvalEscalatedBy?: string;

  @Column({ type: 'text', nullable: true })
  approvalEscalationReason?: string;

  // Revision Management
  @Column({ type: 'timestamp', nullable: true })
  revisionRequestedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  revisionRequestedBy?: string;

  @Column({
    type: 'enum',
    enum: RevisionReason,
    nullable: true,
  })
  revisionReason?: RevisionReason;

  @Column({ type: 'text', nullable: true })
  revisionDescription?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  revisionUrgency?: 'low' | 'medium' | 'high' | 'urgent';

  @Column({ type: 'jsonb', nullable: true })
  revisionChanges?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
    reason: string;
  }>;

  @Column({ type: 'varchar', length: 20, nullable: true })
  revisionEstimatedImpact?: 'low' | 'medium' | 'high';

  @Column({ type: 'boolean', nullable: true })
  revisionRequiresClientApproval?: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  revisionStatus?: 'pending' | 'approved' | 'rejected' | 'pending_client_approval' | 'implemented';

  @Column({ type: 'timestamp', nullable: true })
  revisionApprovedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  revisionApprovedBy?: string;

  @Column({ type: 'jsonb', nullable: true })
  revisionConditions?: string[];

  @Column({ type: 'timestamp', nullable: true })
  revisionRejectedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  revisionRejectedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  revisionImplementedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  revisionImplementedBy?: string;

  @Column({ type: 'jsonb', nullable: true })
  revisionHistory?: Array<{
    id: string;
    quotationId: string;
    revisionNumber: number;
    requestedBy: string;
    requestedAt: Date;
    reason: RevisionReason;
    description: string;
    changes: any[];
    status: 'pending' | 'approved' | 'rejected' | 'implemented';
    approvedBy?: string;
    approvedAt?: Date;
    implementedAt?: Date;
    comments?: string;
  }>;

  // Workflow Status Tracking
  @Column({ type: 'timestamp', nullable: true })
  lastStatusChangeAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  lastStatusChangeBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  activatedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  sentById?: string;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  acceptedById?: string;

  @Column({ type: 'timestamp', nullable: true })
  declinedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  declinedById?: string;

  @Column({ type: 'timestamp', nullable: true })
  expiredAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  cancelledById?: string;

  @Column({ type: 'text', nullable: true })
  cancellationReason?: string;

  @Column({ type: 'timestamp', nullable: true })
  archivedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastModifiedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  lastModifiedBy?: string;

  @Column({ type: 'boolean', default: false })
  isProjectCompleted?: boolean;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
