import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { QuotationStatus, ApprovalLevel, QuotationPriority } from '../enums/quotation-status.enum';
import { User, UserRole } from '../../users/entities/user.entity';
import { Quotation } from '../entities/quotation.entity';
import { Logger } from '../../common/logger/logger.service';

export interface StateTransition {
  from: QuotationStatus;
  to: QuotationStatus;
  allowedRoles: UserRole[];
  requiredApproval?: ApprovalLevel;
  conditions?: (quotation: Quotation, user: User) => boolean;
  actions?: (quotation: Quotation, user: User) => Promise<void>;
}

export interface WorkflowRule {
  status: QuotationStatus;
  allowedTransitions: QuotationStatus[];
  requiredFields: string[];
  autoActions?: (quotation: Quotation) => Promise<void>;
}

@Injectable()
export class WorkflowStateMachineService {
  private readonly stateTransitions: StateTransition[] = [
    // Draft -> Pending Review
    {
      from: QuotationStatus.DRAFT,
      to: QuotationStatus.PENDING_REVIEW,
      allowedRoles: [UserRole.SALES_REP, UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      conditions: (quotation: Quotation) => this.hasRequiredFields(quotation, ['items', 'totalAmount']),
    },

    // Pending Review -> Pending Approval
    {
      from: QuotationStatus.PENDING_REVIEW,
      to: QuotationStatus.PENDING_APPROVAL,
      allowedRoles: [UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      conditions: (quotation: Quotation) => this.isReviewComplete(quotation),
    },

    // Pending Approval -> Approved
    {
      from: QuotationStatus.PENDING_APPROVAL,
      to: QuotationStatus.APPROVED,
      allowedRoles: [UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      requiredApproval: ApprovalLevel.MANAGER,
      actions: async (quotation: Quotation, user: User) => {
        quotation.approvedById = user.id;
        quotation.approvedAt = new Date();
        quotation.approvalNotes = `Approved by ${user.firstName} ${user.lastName}`;
      },
    },

    // Pending Approval -> Rejected
    {
      from: QuotationStatus.PENDING_APPROVAL,
      to: QuotationStatus.REJECTED,
      allowedRoles: [UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      actions: async (quotation: Quotation, user: User) => {
        quotation.rejectedById = user.id;
        quotation.rejectedAt = new Date();
      },
    },

    // Approved -> Active
    {
      from: QuotationStatus.APPROVED,
      to: QuotationStatus.ACTIVE,
      allowedRoles: [UserRole.SALES_REP, UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      actions: async (quotation: Quotation) => {
        quotation.activatedAt = new Date();
        quotation.validFrom = new Date();
        quotation.validUntil = this.calculateValidityPeriod(quotation);
      },
    },

    // Active -> Sent
    {
      from: QuotationStatus.ACTIVE,
      to: QuotationStatus.SENT,
      allowedRoles: [UserRole.SALES_REP, UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      actions: async (quotation: Quotation) => {
        quotation.sentAt = new Date();
        quotation.sentById = quotation.createdById;
      },
    },

    // Sent -> Accepted
    {
      from: QuotationStatus.SENT,
      to: QuotationStatus.ACCEPTED,
      allowedRoles: [UserRole.CLIENT, UserRole.SALES_REP, UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      conditions: (quotation: Quotation) => this.isWithinValidityPeriod(quotation),
      actions: async (quotation: Quotation, user: User) => {
        quotation.acceptedAt = new Date();
        quotation.acceptedById = user.id;
        quotation.status = QuotationStatus.ACCEPTED;
      },
    },

    // Sent -> Declined
    {
      from: QuotationStatus.SENT,
      to: QuotationStatus.DECLINED,
      allowedRoles: [UserRole.CLIENT, UserRole.SALES_REP, UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      actions: async (quotation: Quotation, user: User) => {
        quotation.declinedAt = new Date();
        quotation.declinedById = user.id;
        quotation.status = QuotationStatus.DECLINED;
      },
    },

    // Sent -> Expired
    {
      from: QuotationStatus.SENT,
      to: QuotationStatus.EXPIRED,
      allowedRoles: [UserRole.SALES_REP, UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      conditions: (quotation: Quotation) => !this.isWithinValidityPeriod(quotation),
      actions: async (quotation: Quotation) => {
        quotation.expiredAt = new Date();
        quotation.status = QuotationStatus.EXPIRED;
      },
    },

    // Accepted -> Completed
    {
      from: QuotationStatus.ACCEPTED,
      to: QuotationStatus.COMPLETED,
      allowedRoles: [UserRole.SALES_REP, UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      conditions: (quotation: Quotation) => this.isProjectCompleted(quotation),
      actions: async (quotation: Quotation) => {
        quotation.completedAt = new Date();
        quotation.status = QuotationStatus.COMPLETED;
      },
    },

    // Any -> Cancelled
    {
      from: QuotationStatus.DRAFT,
      to: QuotationStatus.CANCELLED,
      allowedRoles: [UserRole.SALES_REP, UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      conditions: (quotation: Quotation) => this.canBeCancelled(quotation),
      actions: async (quotation: Quotation, user: User) => {
        quotation.cancelledAt = new Date();
        quotation.cancelledById = user.id;
        quotation.cancellationReason = 'Cancelled by user';
      },
    },

    // Any -> Archived
    {
      from: QuotationStatus.COMPLETED,
      to: QuotationStatus.ARCHIVED,
      allowedRoles: [UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      conditions: (quotation: Quotation) => this.canBeArchived(quotation),
      actions: async (quotation: Quotation) => {
        quotation.archivedAt = new Date();
        quotation.status = QuotationStatus.ARCHIVED;
      },
    },
  ];

  private readonly workflowRules: WorkflowRule[] = [
    {
      status: QuotationStatus.DRAFT,
      allowedTransitions: [QuotationStatus.PENDING_REVIEW, QuotationStatus.CANCELLED],
      requiredFields: ['title', 'clientId', 'items'],
    },
    {
      status: QuotationStatus.PENDING_REVIEW,
      allowedTransitions: [QuotationStatus.PENDING_APPROVAL, QuotationStatus.DRAFT],
      requiredFields: ['title', 'clientId', 'items', 'totalAmount', 'terms'],
    },
    {
      status: QuotationStatus.PENDING_APPROVAL,
      allowedTransitions: [QuotationStatus.APPROVED, QuotationStatus.REJECTED, QuotationStatus.DRAFT],
      requiredFields: ['title', 'clientId', 'items', 'totalAmount', 'terms', 'validityPeriod'],
    },
    {
      status: QuotationStatus.APPROVED,
      allowedTransitions: [QuotationStatus.ACTIVE, QuotationStatus.DRAFT],
      requiredFields: ['title', 'clientId', 'items', 'totalAmount', 'terms', 'validityPeriod', 'approvedById'],
    },
    {
      status: QuotationStatus.ACTIVE,
      allowedTransitions: [QuotationStatus.SENT, QuotationStatus.DRAFT],
      requiredFields: ['title', 'clientId', 'items', 'totalAmount', 'terms', 'validityPeriod', 'approvedById', 'validFrom'],
    },
    {
      status: QuotationStatus.SENT,
      allowedTransitions: [QuotationStatus.ACCEPTED, QuotationStatus.DECLINED, QuotationStatus.EXPIRED, QuotationStatus.DRAFT],
      requiredFields: ['title', 'clientId', 'items', 'totalAmount', 'terms', 'validityPeriod', 'approvedById', 'validFrom', 'sentAt'],
    },
    {
      status: QuotationStatus.ACCEPTED,
      allowedTransitions: [QuotationStatus.COMPLETED, QuotationStatus.DRAFT],
      requiredFields: ['title', 'clientId', 'items', 'totalAmount', 'terms', 'validityPeriod', 'approvedById', 'validFrom', 'sentAt', 'acceptedAt'],
    },
    {
      status: QuotationStatus.COMPLETED,
      allowedTransitions: [QuotationStatus.ARCHIVED],
      requiredFields: ['title', 'clientId', 'items', 'totalAmount', 'terms', 'validityPeriod', 'approvedById', 'validFrom', 'sentAt', 'acceptedAt', 'completedAt'],
    },
  ];

  constructor(private readonly logger: Logger) {}

  async canTransition(
    quotation: Quotation,
    targetStatus: QuotationStatus,
    user: User,
  ): Promise<{ allowed: boolean; reason?: string; requiredApproval?: ApprovalLevel }> {
    const currentStatus = quotation.status as QuotationStatus;
    const transition = this.findTransition(currentStatus, targetStatus);

    if (!transition) {
      return {
        allowed: false,
        reason: `Transition from ${currentStatus} to ${targetStatus} is not allowed`,
      };
    }

    // Check role permissions
    if (!this.hasRequiredRole(user, transition.allowedRoles)) {
      return {
        allowed: false,
        reason: `User role ${user.roles} is not authorized for this transition`,
      };
    }

    // Check approval requirements
    if (transition.requiredApproval && !this.hasApprovalLevel(user, transition.requiredApproval)) {
      return {
        allowed: false,
        reason: `Approval level ${transition.requiredApproval} is required`,
        requiredApproval: transition.requiredApproval,
      };
    }

    // Check business conditions
    if (transition.conditions && !transition.conditions(quotation, user)) {
      return {
        allowed: false,
        reason: 'Business conditions not met for this transition',
      };
    }

    return { allowed: true, requiredApproval: transition.requiredApproval };
  }

  async transition(
    quotation: Quotation,
    targetStatus: QuotationStatus,
    user: User,
    metadata?: any,
  ): Promise<Quotation> {
    const canTransition = await this.canTransition(quotation, targetStatus, user);

    if (!canTransition.allowed) {
      throw new BadRequestException(canTransition.reason);
    }

    const transition = this.findTransition(quotation.status as QuotationStatus, targetStatus);
    const previousStatus = quotation.status;

    try {
      // Execute transition actions
      if (transition.actions) {
        await transition.actions(quotation, user);
      }

      // Update status
      quotation.status = targetStatus;
      quotation.lastStatusChangeAt = new Date();
      quotation.lastStatusChangeBy = user.id;

      // Log the transition
      await this.logStatusTransition(quotation, previousStatus, targetStatus, user, metadata);

      // Execute auto-actions for the new status
      const rule = this.findWorkflowRule(targetStatus);
      if (rule?.autoActions) {
        await rule.autoActions(quotation);
      }

      this.logger.log('Quotation status transitioned successfully', {
        quotationId: quotation.id,
        fromStatus: previousStatus,
        toStatus: targetStatus,
        userId: user.id,
        metadata,
      });

      return quotation;
    } catch (error) {
      this.logger.error('Error during status transition', {
        quotationId: quotation.id,
        fromStatus: previousStatus,
        toStatus: targetStatus,
        userId: user.id,
        error: error.message,
      });
      throw error;
    }
  }

  getAvailableTransitions(quotation: Quotation, user: User): QuotationStatus[] {
    const currentStatus = quotation.status as QuotationStatus;
    const rule = this.findWorkflowRule(currentStatus);

    if (!rule) {
      return [];
    }

    return rule.allowedTransitions.filter(async (targetStatus) => {
      const canTransition = await this.canTransition(quotation, targetStatus, user);
      return canTransition.allowed;
    });
  }

  getRequiredFields(status: QuotationStatus): string[] {
    const rule = this.findWorkflowRule(status);
    return rule?.requiredFields || [];
  }

  private findTransition(from: QuotationStatus, to: QuotationStatus): StateTransition | undefined {
    return this.stateTransitions.find(
      (transition) => transition.from === from && transition.to === to,
    );
  }

  private findWorkflowRule(status: QuotationStatus): WorkflowRule | undefined {
    return this.workflowRules.find((rule) => rule.status === status);
  }

  private hasRequiredRole(user: User, allowedRoles: UserRole[]): boolean {
    return user.roles.some((role) => allowedRoles.includes(role));
  }

  private hasApprovalLevel(user: User, requiredLevel: ApprovalLevel): boolean {
    const userLevel = this.getUserApprovalLevel(user);
    return this.compareApprovalLevels(userLevel, requiredLevel) >= 0;
  }

  private getUserApprovalLevel(user: User): ApprovalLevel {
    if (user.roles.includes(UserRole.SUPER_ADMIN)) {
      return ApprovalLevel.EXECUTIVE;
    }
    if (user.roles.includes(UserRole.ADMIN)) {
      return ApprovalLevel.DIRECTOR;
    }
    if (user.roles.includes(UserRole.MANAGER)) {
      return ApprovalLevel.MANAGER;
    }
    return ApprovalLevel.MANAGER; // Default level
  }

  private compareApprovalLevels(level1: ApprovalLevel, level2: ApprovalLevel): number {
    const levels = [ApprovalLevel.MANAGER, ApprovalLevel.DIRECTOR, ApprovalLevel.EXECUTIVE];
    const index1 = levels.indexOf(level1);
    const index2 = levels.indexOf(level2);
    return index1 - index2;
  }

  private hasRequiredFields(quotation: Quotation, requiredFields: string[]): boolean {
    return requiredFields.every((field) => {
      const value = quotation[field];
      return value !== undefined && value !== null && value !== '';
    });
  }

  private isReviewComplete(quotation: Quotation): boolean {
    return quotation.reviewedAt !== undefined && quotation.reviewedById !== undefined;
  }

  private isWithinValidityPeriod(quotation: Quotation): boolean {
    if (!quotation.validFrom || !quotation.validUntil) {
      return false;
    }
    const now = new Date();
    return now >= quotation.validFrom && now <= quotation.validUntil;
  }

  private isProjectCompleted(quotation: Quotation): boolean {
    // This would typically check against project management system
    // For now, we'll use a simple flag
    return quotation.isProjectCompleted === true;
  }

  private canBeCancelled(quotation: Quotation): boolean {
    const nonCancellableStatuses = [
      QuotationStatus.COMPLETED,
      QuotationStatus.ARCHIVED,
      QuotationStatus.CANCELLED,
    ];
    return !nonCancellableStatuses.includes(quotation.status as QuotationStatus);
  }

  private canBeArchived(quotation: Quotation): boolean {
    return quotation.status === QuotationStatus.COMPLETED;
  }

  private calculateValidityPeriod(quotation: Quotation): Date {
    const validityDays = quotation.validityPeriod || 30;
    const validFrom = quotation.validFrom || new Date();
    const validUntil = new Date(validFrom);
    validUntil.setDate(validUntil.getDate() + validityDays);
    return validUntil;
  }

  private async logStatusTransition(
    quotation: Quotation,
    fromStatus: string,
    toStatus: string,
    user: User,
    metadata?: any,
  ): Promise<void> {
    // This would typically log to a workflow history table
    // For now, we'll just log it
    this.logger.log('Status transition logged', {
      quotationId: quotation.id,
      fromStatus,
      toStatus,
      userId: user.id,
      timestamp: new Date().toISOString(),
      metadata,
    });
  }
}
