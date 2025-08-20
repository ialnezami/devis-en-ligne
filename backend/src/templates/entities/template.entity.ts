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
import { Company } from '../../companies/entities/company.entity';
import { Quotation } from '../../quotations/entities/quotation.entity';

export enum TemplateStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DEPRECATED = 'deprecated',
}

export enum TemplateType {
  QUOTATION = 'quotation',
  INVOICE = 'invoice',
  PROPOSAL = 'proposal',
  ESTIMATE = 'estimate',
}

export enum TemplateVisibility {
  PRIVATE = 'private',
  COMPANY = 'company',
  PUBLIC = 'public',
}

@Entity('templates')
@Index(['name', 'companyId'])
@Index(['category', 'status'])
@Index(['createdById', 'status'])
export class Template {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: TemplateType,
    default: TemplateType.QUOTATION,
  })
  type: TemplateType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tags?: string;

  @Column({
    type: 'enum',
    enum: TemplateStatus,
    default: TemplateStatus.DRAFT,
  })
  status: TemplateStatus;

  @Column({
    type: 'enum',
    enum: TemplateVisibility,
    default: TemplateVisibility.PRIVATE,
  })
  visibility: TemplateVisibility;

  @Column({ type: 'varchar', length: 20, nullable: true })
  version?: string;

  @Column({ type: 'uuid', nullable: true })
  parentTemplateId?: string;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt?: Date;

  // Template Structure
  @Column({ type: 'jsonb', nullable: true })
  structure?: {
    header?: {
      logo?: string;
      companyInfo?: boolean;
      title?: string;
      subtitle?: string;
    };
    sections?: Array<{
      id: string;
      name: string;
      type: 'items' | 'text' | 'table' | 'signature';
      order: number;
      required: boolean;
      config?: any;
    }>;
    footer?: {
      terms?: string;
      notes?: string;
      signature?: boolean;
    };
  };

  // Default Template Items
  @Column({ type: 'jsonb', nullable: true })
  defaultItems?: Array<{
    id: string;
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    unit: string;
    category?: string;
    taxRate?: number;
    discountType?: 'percentage' | 'fixed';
    discountValue?: number;
  }>;

  // Template Settings
  @Column({ type: 'jsonb', nullable: true })
  settings?: {
    currency?: string;
    language?: string;
    dateFormat?: string;
    numberFormat?: string;
    taxSettings?: {
      includeTax?: boolean;
      taxType?: 'inclusive' | 'exclusive';
      defaultTaxRate?: number;
    };
    validityPeriod?: number; // in days
    paymentTerms?: string;
    notes?: string;
  };

  // Styling and Branding
  @Column({ type: 'jsonb', nullable: true })
  styling?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    fontSize?: number;
    layout?: 'standard' | 'modern' | 'minimal';
    customCSS?: string;
  };

  // Approval and Workflow
  @Column({ type: 'boolean', default: false })
  requiresApproval: boolean;

  @Column({ type: 'uuid', nullable: true })
  approvedById?: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'text', nullable: true })
  approvalNotes?: string;

  // Relationships
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ type: 'uuid' })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedById' })
  approvedBy?: User;

  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'companyId' })
  company?: Company;

  @Column({ type: 'uuid', nullable: true })
  companyId?: string;

  @ManyToOne(() => Template, { nullable: true })
  @JoinColumn({ name: 'parentTemplateId' })
  parentTemplate?: Template;

  @OneToMany(() => Template, (template) => template.parentTemplate)
  childTemplates: Template[];

  @OneToMany(() => Quotation, (quotation) => quotation.template)
  quotations: Quotation[];

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Virtual properties
  get isPublic(): boolean {
    return this.visibility === TemplateVisibility.PUBLIC;
  }

  get isActive(): boolean {
    return this.status === TemplateStatus.ACTIVE;
  }

  get hasParent(): boolean {
    return !!this.parentTemplateId;
  }

  get hasChildren(): boolean {
    return this.childTemplates && this.childTemplates.length > 0;
  }

  // Methods
  incrementUsage(): void {
    this.usageCount += 1;
    this.lastUsedAt = new Date();
  }

  activate(): void {
    this.status = TemplateStatus.ACTIVE;
  }

  archive(): void {
    this.status = TemplateStatus.ARCHIVED;
  }

  deprecate(): void {
    this.status = TemplateStatus.DEPRECATED;
  }

  approve(approvedBy: User, notes?: string): void {
    this.approvedById = approvedBy.id;
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
    this.approvalNotes = notes;
    this.status = TemplateStatus.ACTIVE;
  }

  createVersion(newVersion: string): Partial<Template> {
    return {
      name: this.name,
      description: this.description,
      type: this.type,
      category: this.category,
      tags: this.tags,
      visibility: this.visibility,
      version: newVersion,
      parentTemplateId: this.id,
      structure: this.structure,
      defaultItems: this.defaultItems,
      settings: this.settings,
      styling: this.styling,
      requiresApproval: this.requiresApproval,
      companyId: this.companyId,
    };
  }

  canBeUsedBy(user: User): boolean {
    // Public templates can be used by anyone
    if (this.visibility === TemplateVisibility.PUBLIC) {
      return true;
    }

    // Company templates can be used by company members
    if (this.visibility === TemplateVisibility.COMPANY && this.companyId === user.companyId) {
      return true;
    }

    // Private templates can only be used by the creator
    if (this.visibility === TemplateVisibility.PRIVATE && this.createdById === user.id) {
      return true;
    }

    return false;
  }

  clone(): Partial<Template> {
    return {
      name: `${this.name} (Copy)`,
      description: this.description,
      type: this.type,
      category: this.category,
      tags: this.tags,
      structure: this.structure,
      defaultItems: this.defaultItems,
      settings: this.settings,
      styling: this.styling,
      requiresApproval: this.requiresApproval,
      status: TemplateStatus.DRAFT,
      visibility: TemplateVisibility.PRIVATE,
    };
  }
}
