import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quotation } from '../entities/quotation.entity';
import { User, UserRole } from '../../users/entities/user.entity';
import { QuotationStatus, RevisionReason } from '../enums/quotation-status.enum';
import { WorkflowStateMachineService } from './workflow-state-machine.service';
import { Logger } from '../../common/logger/logger.service';
import { EmailService } from '../../notifications/email.service';

export interface RevisionRequest {
  quotationId: string;
  requestedBy: string;
  requestedAt: Date;
  reason: RevisionReason;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
    reason: string;
  }[];
  estimatedImpact: 'low' | 'medium' | 'high';
  requiresClientApproval: boolean;
}

export interface RevisionApproval {
  revisionId: string;
  approvedBy: string;
  approvedAt: Date;
  decision: 'approved' | 'rejected';
  comments?: string;
  conditions?: string[];
}

export interface RevisionHistory {
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
}

@Injectable()
export class RevisionService {
  constructor(
    @InjectRepository(Quotation)
    private quotationsRepository: Repository<Quotation>,
    private workflowStateMachine: WorkflowStateMachineService,
    private emailService: EmailService,
    private logger: Logger,
  ) {}

  async requestRevision(
    quotationId: string,
    user: User,
    revisionData: Omit<RevisionRequest, 'quotationId' | 'requestedBy' | 'requestedAt'>,
  ): Promise<RevisionRequest> {
    const quotation = await this.quotationsRepository.findOne({
      where: { id: quotationId },
      relations: ['createdBy', 'client'],
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    // Check if user can request revision
    if (!this.canRequestRevision(quotation, user)) {
      throw new ForbiddenException('You cannot request revision for this quotation');
    }

    // Check if quotation is in a revisable state
    if (!this.isRevisable(quotation)) {
      throw new BadRequestException('Quotation is not in a revisable state');
    }

    // Create revision request
    const revisionRequest: RevisionRequest = {
      quotationId,
      requestedBy: user.id,
      requestedAt: new Date(),
      ...revisionData,
    };

    // Update quotation with revision request
    quotation.revisionRequestedAt = revisionRequest.requestedAt;
    quotation.revisionRequestedBy = user.id;
    quotation.revisionReason = revisionData.reason;
    quotation.revisionDescription = revisionData.description;
    quotation.revisionUrgency = revisionData.urgency;
    quotation.revisionChanges = revisionData.changes;
    quotation.revisionEstimatedImpact = revisionData.estimatedImpact;
    quotation.revisionRequiresClientApproval = revisionData.requiresClientApproval;
    quotation.revisionStatus = 'pending';

    // Add to revision history
    if (!quotation.revisionHistory) {
      quotation.revisionHistory = [];
    }

    const revisionNumber = quotation.revisionHistory.length + 1;
    quotation.revisionHistory.push({
      id: this.generateRevisionId(),
      quotationId,
      revisionNumber,
      requestedBy: user.id,
      requestedAt: revisionRequest.requestedAt,
      reason: revisionData.reason,
      description: revisionData.description,
      changes: revisionData.changes,
      status: 'pending',
    });

    await this.quotationsRepository.save(quotation);

    // Send revision request notifications
    await this.sendRevisionRequestNotifications(quotation, revisionRequest);

    this.logger.log('Revision requested successfully', {
      quotationId,
      requestedBy: user.id,
      reason: revisionData.reason,
      urgency: revisionData.urgency,
      revisionNumber,
    });

    return revisionRequest;
  }

  async approveRevision(
    quotationId: string,
    revisionId: string,
    user: User,
    decision: 'approved' | 'rejected',
    comments?: string,
    conditions?: string[],
  ): Promise<RevisionApproval> {
    const quotation = await this.quotationsRepository.findOne({
      where: { id: quotationId },
      relations: ['createdBy', 'client'],
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    // Check if user can approve revision
    if (!this.canApproveRevision(quotation, user)) {
      throw new ForbiddenException('You cannot approve revision for this quotation');
    }

    // Find the revision
    const revision = quotation.revisionHistory?.find(r => r.id === revisionId);
    if (!revision) {
      throw new NotFoundException('Revision not found');
    }

    if (revision.status !== 'pending') {
      throw new BadRequestException('Revision is not pending approval');
    }

    // Create revision approval
    const revisionApproval: RevisionApproval = {
      revisionId,
      approvedBy: user.id,
      approvedAt: new Date(),
      decision,
      comments,
      conditions,
    };

    // Update revision status
    revision.status = decision;
    revision.approvedBy = user.id;
    revision.approvedAt = revisionApproval.approvedAt;
    revision.comments = comments;

    // Update quotation revision status
    if (decision === 'approved') {
      quotation.revisionStatus = 'approved';
      quotation.revisionApprovedAt = revisionApproval.approvedAt;
      quotation.revisionApprovedBy = user.id;
      quotation.revisionConditions = conditions;

      // If client approval is required, set status accordingly
      if (quotation.revisionRequiresClientApproval) {
        quotation.revisionStatus = 'pending_client_approval';
      }
    } else {
      quotation.revisionStatus = 'rejected';
      quotation.revisionRejectedAt = revisionApproval.approvedAt;
      quotation.revisionRejectedBy = user.id;
    }

    await this.quotationsRepository.save(quotation);

    // Send revision approval notifications
    await this.sendRevisionApprovalNotifications(quotation, revisionApproval);

    this.logger.log('Revision approval recorded', {
      quotationId,
      revisionId,
      approvedBy: user.id,
      decision,
      comments,
    });

    return revisionApproval;
  }

  async implementRevision(
    quotationId: string,
    revisionId: string,
    user: User,
    implementationNotes?: string,
  ): Promise<void> {
    const quotation = await this.quotationsRepository.findOne({
      where: { id: quotationId },
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    // Check if user can implement revision
    if (!this.canImplementRevision(quotation, user)) {
      throw new ForbiddenException('You cannot implement revision for this quotation');
    }

    // Find the approved revision
    const revision = quotation.revisionHistory?.find(r => r.id === revisionId);
    if (!revision) {
      throw new NotFoundException('Revision not found');
    }

    if (revision.status !== 'approved') {
      throw new BadRequestException('Revision is not approved');
    }

    // Apply changes to quotation
    await this.applyRevisionChanges(quotation, revision);

    // Update revision status
    revision.status = 'implemented';
    revision.implementedAt = new Date();

    // Update quotation
    quotation.revisionStatus = 'implemented';
    quotation.revisionImplementedAt = new Date();
    quotation.revisionImplementedBy = user.id;
    quotation.lastModifiedAt = new Date();
    quotation.lastModifiedBy = user.id;

    // Reset revision request fields
    quotation.revisionRequestedAt = null;
    quotation.revisionRequestedBy = null;
    quotation.revisionReason = null;
    quotation.revisionDescription = null;
    quotation.revisionUrgency = null;
    quotation.revisionChanges = null;
    quotation.revisionEstimatedImpact = null;
    quotation.revisionRequiresClientApproval = null;
    quotation.revisionApprovedAt = null;
    quotation.revisionApprovedBy = null;
    quotation.revisionConditions = null;

    await this.quotationsRepository.save(quotation);

    // Send revision implementation notifications
    await this.sendRevisionImplementationNotifications(quotation, revision, user);

    this.logger.log('Revision implemented successfully', {
      quotationId,
      revisionId,
      implementedBy: user.id,
      implementationNotes,
    });
  }

  async getRevisionHistory(quotationId: string): Promise<RevisionHistory[]> {
    const quotation = await this.quotationsRepository.findOne({
      where: { id: quotationId },
      select: ['revisionHistory'],
    });

    return quotation?.revisionHistory || [];
  }

  async getPendingRevisions(user: User): Promise<Quotation[]> {
    const queryBuilder = this.quotationsRepository
      .createQueryBuilder('quotation')
      .leftJoinAndSelect('quotation.createdBy', 'createdBy')
      .leftJoinAndSelect('quotation.client', 'client')
      .where('quotation.revisionStatus = :status', { status: 'pending' })
      .orderBy('quotation.revisionUrgency', 'DESC')
      .addOrderBy('quotation.revisionRequestedAt', 'ASC');

    // Filter by user permissions
    if (!user.roles.includes(UserRole.MANAGER) && !user.roles.includes(UserRole.ADMIN)) {
      queryBuilder.andWhere('quotation.createdById = :userId', { userId: user.id });
    }

    return await queryBuilder.getMany();
  }

  async getRevisionsByReason(reason: RevisionReason): Promise<Quotation[]> {
    return await this.quotationsRepository.find({
      where: { revisionReason: reason },
      relations: ['createdBy', 'client'],
      order: { revisionRequestedAt: 'DESC' },
    });
  }

  async getRevisionsByImpact(impact: 'low' | 'medium' | 'high'): Promise<Quotation[]> {
    return await this.quotationsRepository.find({
      where: { revisionEstimatedImpact: impact },
      relations: ['createdBy', 'client'],
      order: { revisionRequestedAt: 'DESC' },
    });
  }

  private canRequestRevision(quotation: Quotation, user: User): boolean {
    // Creator can always request revision
    if (quotation.createdById === user.id) {
      return true;
    }

    // Managers and admins can request revision for any quotation
    if (user.roles.includes(UserRole.MANAGER) || user.roles.includes(UserRole.ADMIN)) {
      return true;
    }

    // Sales reps can request revision for their own quotations
    if (user.roles.includes(UserRole.SALES_REP) && quotation.createdById === user.id) {
      return true;
    }

    return false;
  }

  private canApproveRevision(quotation: Quotation, user: User): boolean {
    // Only managers and admins can approve revisions
    return user.roles.includes(UserRole.MANAGER) || user.roles.includes(UserRole.ADMIN);
  }

  private canImplementRevision(quotation: Quotation, user: User): boolean {
    // Creator can implement their own revisions
    if (quotation.createdById === user.id) {
      return true;
    }

    // Managers and admins can implement any revision
    if (user.roles.includes(UserRole.MANAGER) || user.roles.includes(UserRole.ADMIN)) {
      return true;
    }

    return false;
  }

  private isRevisable(quotation: Quotation): boolean {
    const revisableStatuses = [
      QuotationStatus.DRAFT,
      QuotationStatus.PENDING_REVIEW,
      QuotationStatus.PENDING_APPROVAL,
      QuotationStatus.APPROVED,
      QuotationStatus.ACTIVE,
      QuotationStatus.SENT,
    ];

    return revisableStatuses.includes(quotation.status as QuotationStatus);
  }

  private generateRevisionId(): string {
    return `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async applyRevisionChanges(quotation: Quotation, revision: any): Promise<void> {
    // Apply each change to the quotation
    for (const change of revision.changes) {
      if (quotation.hasOwnProperty(change.field)) {
        quotation[change.field] = change.newValue;
      }
    }

    // Recalculate totals if items were changed
    if (revision.changes.some(change => change.field === 'items')) {
      await this.recalculateQuotationTotals(quotation);
    }

    // Update version number
    quotation.version = quotation.version ? `${quotation.version}.${revision.revisionNumber}` : `1.${revision.revisionNumber}`;
  }

  private async recalculateQuotationTotals(quotation: Quotation): Promise<void> {
    // This would typically recalculate totals based on items, taxes, discounts, etc.
    // For now, we'll just update the modified timestamp
    quotation.lastModifiedAt = new Date();
  }

  private async sendRevisionRequestNotifications(
    quotation: Quotation,
    revisionRequest: RevisionRequest,
  ): Promise<void> {
    try {
      // Notify approvers
      if (quotation.createdBy?.email) {
        this.logger.log('Revision request notification would be sent', {
          to: quotation.createdBy.email,
          quotationId: quotation.id,
          revisionReason: revisionRequest.reason,
        });
      }

      // Notify managers if high impact
      if (revisionRequest.estimatedImpact === 'high') {
        // This would typically notify relevant managers
        this.logger.log('High impact revision - manager notification required', {
          quotationId: quotation.id,
          impact: revisionRequest.estimatedImpact,
        });
      }
    } catch (error) {
      this.logger.error('Error sending revision request notifications', {
        quotationId: quotation.id,
        error: error.message,
      });
    }
  }

  private async sendRevisionApprovalNotifications(
    quotation: Quotation,
    revisionApproval: RevisionApproval,
  ): Promise<void> {
    try {
      // Notify revision requester
      if (quotation.revisionRequestedBy) {
        // This would typically notify the user who requested the revision
        this.logger.log('Revision approval notification sent to requester', {
          quotationId: quotation.id,
          requesterId: quotation.revisionRequestedBy,
        });
      }
    } catch (error) {
      this.logger.error('Error sending revision approval notifications', {
        quotationId: quotation.id,
        error: error.message,
      });
    }
  }

  private async sendRevisionImplementationNotifications(
    quotation: Quotation,
    revision: any,
    implementedBy: User,
  ): Promise<void> {
    try {
      // Notify client if applicable
      if (quotation.client?.email) {
        await this.emailService.sendRevisionImplementedEmail(
          quotation.client.email,
          quotation.client.firstName,
          quotation,
          revision,
          implementedBy,
        );
      }

      // Notify other stakeholders
      this.logger.log('Revision implementation notifications sent', {
        quotationId: quotation.id,
        implementedBy: implementedBy.id,
      });
    } catch (error) {
      this.logger.error('Error sending revision implementation notifications', {
        quotationId: quotation.id,
        error: error.message,
      });
    }
  }
}
