import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
} from 'typeorm';
import { Quotation } from './quotation.entity';

@Entity('quotation_items')
export class QuotationItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sku?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit?: string; // e.g., 'piece', 'hour', 'day', 'kg'

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercentage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number; // (unitPrice * quantity) - discountAmount

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number; // subtotal + taxAmount

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    category?: string;
    tags?: string[];
    customFields?: Record<string, any>;
    [key: string]: any;
  };

  @Column({ type: 'int', default: 1 })
  sortOrder: number;

  // Relationships
  @ManyToOne(() => Quotation, (quotation) => quotation.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'quotationId' })
  quotation: Quotation;

  @Column({ type: 'uuid' })
  quotationId: string;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Helper methods
  calculateSubtotal(): number {
    const baseAmount = this.unitPrice * this.quantity;
    return baseAmount - this.discountAmount;
  }

  calculateTaxAmount(): number {
    return this.subtotal * (this.taxRate / 100);
  }

  calculateTotal(): number {
    return this.subtotal + this.taxAmount;
  }

  recalculate(): void {
    this.subtotal = this.calculateSubtotal();
    this.taxAmount = this.calculateTaxAmount();
    this.total = this.calculateTotal();
  }
}
