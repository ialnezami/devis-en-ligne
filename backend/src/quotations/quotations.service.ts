import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Quotation } from './entities/quotation.entity';
import { QuotationItem } from './entities/quotation-item.entity';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { QuotationStatus, QuotationPriority } from './enums/quotation-status.enum';

@Injectable()
export class QuotationsService {
  private readonly logger = new Logger(QuotationsService.name);

  constructor(
    @InjectRepository(Quotation)
    private quotationRepository: Repository<Quotation>,
    @InjectRepository(QuotationItem)
    private itemRepository: Repository<QuotationItem>,
    private dataSource: DataSource,
  ) {}

  async create(createQuotationDto: CreateQuotationDto, userId: string): Promise<Quotation> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate quotation number
      const quotationNumber = await this.generateQuotationNumber();

      // Create quotation
      const quotation = this.quotationRepository.create({
        ...createQuotationDto,
        quotationNumber,
        createdById: userId,
        status: QuotationStatus.DRAFT,
        priority: createQuotationDto.priority || QuotationPriority.MEDIUM,
        currency: createQuotationDto.currency || 'USD',
        validFrom: createQuotationDto.validFrom || new Date(),
        validUntil: createQuotationDto.validUntil || this.calculateExpiryDate(createQuotationDto.validityPeriod),
      });

      const savedQuotation = await queryRunner.manager.save(quotation);

      // Create items if provided
      if (createQuotationDto.items && createQuotationDto.items.length > 0) {
        const items = createQuotationDto.items.map((itemDto, index) => {
          const item = this.itemRepository.create({
            ...itemDto,
            quotationId: savedQuotation.id,
            sortOrder: index + 1,
          });
          item.recalculate();
          return item;
        });

        await queryRunner.manager.save(items);
        savedQuotation.items = items;
      }

      // Calculate totals
      await this.calculateQuotationTotals(savedQuotation.id);

      await queryRunner.commitTransaction();
      this.logger.log(`Quotation created: ${quotationNumber}`);

      return this.findOne(savedQuotation.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error creating quotation', error.message);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(filters?: {
    status?: QuotationStatus;
    priority?: QuotationPriority;
    createdById?: string;
    clientId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<Quotation[]> {
    const queryBuilder = this.quotationRepository
      .createQueryBuilder('quotation')
      .leftJoinAndSelect('quotation.createdBy', 'createdBy')
      .leftJoinAndSelect('quotation.template', 'template')
      .leftJoinAndSelect('quotation.items', 'items')
      .orderBy('quotation.createdAt', 'DESC');

    if (filters?.status) {
      queryBuilder.andWhere('quotation.status = :status', { status: filters.status });
    }

    if (filters?.priority) {
      queryBuilder.andWhere('quotation.priority = :priority', { priority: filters.priority });
    }

    if (filters?.createdById) {
      queryBuilder.andWhere('quotation.createdById = :createdById', { createdById: filters.createdById });
    }

    if (filters?.clientId) {
      queryBuilder.andWhere('quotation.clientId = :clientId', { clientId: filters.clientId });
    }

    if (filters?.dateFrom) {
      queryBuilder.andWhere('quotation.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters?.dateTo) {
      queryBuilder.andWhere('quotation.createdAt <= :dateTo', { dateTo: filters.dateTo });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Quotation> {
    const quotation = await this.quotationRepository.findOne({
      where: { id },
      relations: ['createdBy', 'template', 'items'],
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    return quotation;
  }

  async findByNumber(quotationNumber: string): Promise<Quotation> {
    const quotation = await this.quotationRepository.findOne({
      where: { quotationNumber },
      relations: ['createdBy', 'template', 'items'],
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with number ${quotationNumber} not found`);
    }

    return quotation;
  }

  async update(id: string, updateQuotationDto: UpdateQuotationDto, userId: string): Promise<Quotation> {
    const quotation = await this.findOne(id);

    // Check if quotation can be modified
    if (!this.canModify(quotation)) {
      throw new BadRequestException('Quotation cannot be modified in its current status');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update quotation
      Object.assign(quotation, updateQuotationDto);
      quotation.lastModifiedAt = new Date();
      quotation.lastModifiedBy = userId;

      if (updateQuotationDto.validityPeriod) {
        quotation.validUntil = this.calculateExpiryDate(updateQuotationDto.validityPeriod);
      }

      const updatedQuotation = await queryRunner.manager.save(quotation);

      // Update items if provided
      if (updateQuotationDto.items) {
        // Remove existing items
        await queryRunner.manager.delete(QuotationItem, { quotationId: id });

        // Create new items
        const items = updateQuotationDto.items.map((itemDto, index) => {
          const item = this.itemRepository.create({
            ...itemDto,
            quotationId: id,
            sortOrder: index + 1,
          });
          item.recalculate();
          return item;
        });

        await queryRunner.manager.save(items);
        updatedQuotation.items = items;
      }

      // Recalculate totals
      await this.calculateQuotationTotals(id);

      await queryRunner.commitTransaction();
      this.logger.log(`Quotation updated: ${quotation.quotationNumber}`);

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error updating quotation', error.message);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    const quotation = await this.findOne(id);

    if (!this.canDelete(quotation)) {
      throw new BadRequestException('Quotation cannot be deleted in its current status');
    }

    quotation.cancelledAt = new Date();
    quotation.cancelledById = userId;
    quotation.status = QuotationStatus.CANCELLED;

    await this.quotationRepository.save(quotation);
    this.logger.log(`Quotation cancelled: ${quotation.quotationNumber}`);
  }

  async duplicate(id: string, userId: string): Promise<Quotation> {
    const originalQuotation = await this.findOne(id);
    
    const duplicateData = {
      title: `${originalQuotation.title} (Copy)`,
      description: originalQuotation.description,
      clientName: originalQuotation.clientName,
      clientEmail: originalQuotation.clientEmail,
      clientPhone: originalQuotation.clientPhone,
      clientAddress: originalQuotation.clientAddress,
      clientId: originalQuotation.clientId,
      terms: originalQuotation.terms,
      notes: originalQuotation.notes,
      validityPeriod: originalQuotation.validityPeriod,
      currency: originalQuotation.currency,
      taxRate: originalQuotation.taxRate,
      items: originalQuotation.items?.map(item => ({
        name: item.name,
        description: item.description,
        sku: item.sku,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        unit: item.unit,
        discountPercentage: item.discountPercentage,
        taxRate: item.taxRate,
        metadata: item.metadata,
      })),
    };

    return this.create(duplicateData, userId);
  }

  async changeStatus(id: string, newStatus: QuotationStatus, userId: string, notes?: string): Promise<Quotation> {
    const quotation = await this.findOne(id);
    const oldStatus = quotation.status;

    if (!this.canChangeStatus(quotation, newStatus)) {
      throw new BadRequestException(`Cannot change status from ${oldStatus} to ${newStatus}`);
    }

    quotation.status = newStatus;
    quotation.lastStatusChangeAt = new Date();
    quotation.lastStatusChangeBy = userId;

    // Update specific status timestamps
    switch (newStatus) {
      case QuotationStatus.SENT:
        quotation.sentAt = new Date();
        quotation.sentById = userId;
        break;
      case QuotationStatus.ACCEPTED:
        quotation.acceptedAt = new Date();
        quotation.acceptedById = userId;
        break;
      case QuotationStatus.DECLINED:
        quotation.declinedAt = new Date();
        quotation.declinedById = userId;
        break;
      case QuotationStatus.EXPIRED:
        quotation.expiredAt = new Date();
        break;
      case QuotationStatus.COMPLETED:
        quotation.completedAt = new Date();
        break;
    }

    const updatedQuotation = await this.quotationRepository.save(quotation);
    this.logger.log(`Quotation status changed: ${quotation.quotationNumber} from ${oldStatus} to ${newStatus}`);

    return updatedQuotation;
  }

  private async generateQuotationNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `QT-${year}`;
    
    const lastQuotation = await this.quotationRepository
      .createQueryBuilder('quotation')
      .where('quotation.quotationNumber LIKE :prefix', { prefix: `${prefix}-%` })
      .orderBy('quotation.quotationNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastQuotation) {
      const lastSequence = parseInt(lastQuotation.quotationNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `${prefix}-${sequence.toString().padStart(4, '0')}`;
  }

  private async calculateQuotationTotals(quotationId: string): Promise<void> {
    const quotation = await this.findOne(quotationId);
    
    if (!quotation.items || quotation.items.length === 0) {
      quotation.totalAmount = 0;
      quotation.taxAmount = 0;
      quotation.discountAmount = 0;
      quotation.finalAmount = 0;
      await this.quotationRepository.save(quotation);
      return;
    }

    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    for (const item of quotation.items) {
      item.recalculate();
      subtotal += item.subtotal;
      totalDiscount += item.discountAmount;
      totalTax += item.taxAmount;
    }

    // Apply quotation-level discount if any
    if (quotation.discountAmount) {
      totalDiscount += quotation.discountAmount;
    }

    // Apply quotation-level tax if any
    if (quotation.taxRate && !quotation.taxAmount) {
      totalTax = (subtotal - totalDiscount) * (quotation.taxRate / 100);
    }

    quotation.totalAmount = subtotal;
    quotation.discountAmount = totalDiscount;
    quotation.taxAmount = totalTax;
    quotation.finalAmount = subtotal - totalDiscount + totalTax;

    await this.quotationRepository.save(quotation);
  }

  private calculateExpiryDate(validityPeriod: number): Date {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + validityPeriod);
    return expiryDate;
  }

  private canModify(quotation: Quotation): boolean {
    return [
      QuotationStatus.DRAFT,
      QuotationStatus.PENDING_APPROVAL,
      QuotationStatus.PENDING_REVIEW,
    ].includes(quotation.status);
  }

  private canDelete(quotation: Quotation): boolean {
    return [
      QuotationStatus.DRAFT,
      QuotationStatus.PENDING_APPROVAL,
    ].includes(quotation.status);
  }

  private canChangeStatus(quotation: Quotation, newStatus: QuotationStatus): boolean {
    const allowedTransitions = {
      [QuotationStatus.DRAFT]: [QuotationStatus.PENDING_APPROVAL, QuotationStatus.CANCELLED],
      [QuotationStatus.PENDING_APPROVAL]: [QuotationStatus.APPROVED, QuotationStatus.REJECTED, QuotationStatus.CANCELLED],
      [QuotationStatus.APPROVED]: [QuotationStatus.SENT, QuotationStatus.CANCELLED],
      [QuotationStatus.SENT]: [QuotationStatus.ACCEPTED, QuotationStatus.DECLINED, QuotationStatus.EXPIRED],
      [QuotationStatus.ACCEPTED]: [QuotationStatus.ACTIVE, QuotationStatus.COMPLETED],
      [QuotationStatus.ACTIVE]: [QuotationStatus.COMPLETED],
      [QuotationStatus.PENDING_REVIEW]: [QuotationStatus.DRAFT, QuotationStatus.CANCELLED],
    };

    return allowedTransitions[quotation.status]?.includes(newStatus) || false;
  }
}
