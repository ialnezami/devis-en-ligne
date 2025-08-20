import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quotation } from '../entities/quotation.entity';
import { User, UserRole } from '../../users/entities/user.entity';
import { ApprovalLevel } from '../enums/quotation-status.enum';
import { WorkflowStateMachineService } from './workflow-state-machine.service';
import { Logger } from '../../common/logger/logger.service';
import { EmailService } from '../../notifications/email.service';

export interface ApprovalRequest {
  quotationId: string;
  requestedBy: string;
  requestedAt: Date;
  approvalLevel: ApprovalLevel;
  reason?: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  deadline?: Date;
}

export interface ApprovalDecision {
  quotationId: string;
  approvedBy: string;
  approvedAt: Date;
  decision: 'approved' | 'rejected';
  comments?: string;
  nextApprovalLevel?: ApprovalLevel;
}

@Injectable()
export class ApprovalService {
  constructor(
    @InjectRepository(Quotation)
    private quotationsRepository: Repository<Quotation>,
    private workflowStateMachine: WorkflowStateMachineService,
    private emailService: EmailService,
    private logger: Logger,
  ) {}

  async requestApproval(
    quotationId: string,
    user: User,
    approvalLevel: ApprovalLevel,
    reason?: string,
    urgency: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    deadline?: Date,
  ): Promise<ApprovalRequest> {
    const quotation = await this.quotationsRepository.findOne({
      where: { id: quotationId },
      relations: ['createdBy', 'client'],
    });

    if (!quotation) {
      throw new BadRequestException('Quotation not found');
    }

    // Check if user can request approval for this quotation
    if (!this.canRequestApproval(quotation, user)) {
      throw new ForbiddenException('You cannot request approval for this quotation');
    }

    // Check if approval is already requested
    if (quotation.approvalRequestedAt) {
      throw new BadRequestException('Approval already requested for this quotation');
    }

    // Create approval request
    const approvalRequest: ApprovalRequest = {
      quotationId,
      requestedBy: user.id,
      requestedAt: new Date(),
      approvalLevel,
      reason,
      urgency,
      deadline: deadline || this.calculateDefaultDeadline(urgency),
    };

    // Update quotation with approval request
    quotation.approvalRequestedAt = approvalRequest.requestedAt;
    quotation.approvalRequestedBy = user.id;
    quotation.approvalLevel = approvalLevel;
    quotation.approvalReason = reason;
    quotation.approvalUrgency = urgency;
    quotation.approvalDeadline = approvalRequest.deadline;

    await this.quotationsRepository.save(quotation);

    // Send approval request notifications
    await this.sendApprovalRequestNotifications(quotation, approvalRequest);

    this.logger.log('Approval requested successfully', {
      quotationId,
      requestedBy: user.id,
      approvalLevel,
      urgency,
      deadline: approvalRequest.deadline,
    });

    return approvalRequest;
  }

  async approve(
    quotationId: string,
    user: User,
    decision: 'approved' | 'rejected',
    comments?: string,
  ): Promise<ApprovalDecision> {
    const quotation = await this.quotationsRepository.findOne({
      where: { id: quotationId },
      relations: ['createdBy', 'client'],
    });

    if (!quotation) {
      throw new BadRequestException('Quotation not found');
    }

    // Check if user can approve this quotation
    if (!this.canApprove(quotation, user)) {
      throw new ForbiddenException('You cannot approve this quotation');
    }

    // Check if approval is pending
    if (!quotation.approvalRequestedAt) {
      throw new BadRequestException('No approval request pending for this quotation');
    }

    // Create approval decision
    const approvalDecision: ApprovalDecision = {
      quotationId,
      approvedBy: user.id,
      approvedAt: new Date(),
      decision,
      comments,
    };

    if (decision === 'approved') {
      // Check if additional approval levels are required
      const nextLevel = this.getNextApprovalLevel(quotation.approvalLevel);
      
      if (nextLevel) {
        // Move to next approval level
        quotation.approvalLevel = nextLevel;
        quotation.approvalRequestedAt = new Date();
        quotation.approvalRequestedBy = user.id;
        quotation.approvalHistory = quotation.approvalHistory || [];
        quotation.approvalHistory.push({
          level: quotation.approvalLevel,
          approvedBy: user.id,
          approvedAt: approvalDecision.approvedAt,
          comments,
        });

        await this.quotationsRepository.save(quotation);

        // Send notifications for next approval level
        await this.sendNextApprovalLevelNotifications(quotation, nextLevel);

        approvalDecision.nextApprovalLevel = nextLevel;
      } else {
        // Final approval - transition quotation status
        await this.workflowStateMachine.transition(
          quotation,
          'approved' as any,
          user,
          { comments },
        );
      }
    } else {
      // Rejected - transition quotation status
      await this.workflowStateMachine.transition(
        quotation,
        'rejected' as any,
        user,
        { comments },
      );
    }

    // Send approval decision notifications
    await this.sendApprovalDecisionNotifications(quotation, approvalDecision);

    this.logger.log('Approval decision recorded', {
      quotationId,
      approvedBy: user.id,
      decision,
      comments,
      nextLevel: approvalDecision.nextApprovalLevel,
    });

    return approvalDecision;
  }

  async getPendingApprovals(user: User): Promise<Quotation[]> {
    const userApprovalLevel = this.getUserApprovalLevel(user);

    const queryBuilder = this.quotationsRepository
      .createQueryBuilder('quotation')
      .leftJoinAndSelect('quotation.createdBy', 'createdBy')
      .leftJoinAndSelect('quotation.client', 'client')
      .leftJoinAndSelect('quotation.company', 'company')
      .where('quotation.approvalRequestedAt IS NOT NULL')
      .andWhere('quotation.approvalLevel = :approvalLevel', { approvalLevel: userApprovalLevel })
      .andWhere('quotation.status IN (:...statuses)', {
        statuses: ['pending_approval', 'pending_review'],
      })
      .orderBy('quotation.approvalUrgency', 'DESC')
      .addOrderBy('quotation.approvalDeadline', 'ASC')
      .addOrderBy('quotation.approvalRequestedAt', 'ASC');

    return await queryBuilder.getMany();
  }

  async getApprovalHistory(quotationId: string): Promise<any[]> {
    const quotation = await this.quotationsRepository.findOne({
      where: { id: quotationId },
      select: ['approvalHistory'],
    });

    return quotation?.approvalHistory || [];
  }

  async escalateApproval(quotationId: string, user: User, reason: string): Promise<void> {
    const quotation = await this.quotationsRepository.findOne({
      where: { id: quotationId },
    });

    if (!quotation) {
      throw new BadRequestException('Quotation not found');
    }

    // Check if user can escalate
    if (!this.canEscalateApproval(quotation, user)) {
      throw new ForbiddenException('You cannot escalate this approval');
    }

    // Increase urgency level
    const urgencyLevels = ['low', 'medium', 'high', 'urgent'];
    const currentIndex = urgencyLevels.indexOf(quotation.approvalUrgency);
    
    if (currentIndex < urgencyLevels.length - 1) {
      quotation.approvalUrgency = urgencyLevels[currentIndex + 1] as any;
      quotation.approvalEscalatedAt = new Date();
      quotation.approvalEscalatedBy = user.id;
      quotation.approvalEscalationReason = reason;

      await this.quotationsRepository.save(quotation);

      // Send escalation notifications
      await this.sendApprovalEscalationNotifications(quotation, user, reason);

      this.logger.log('Approval escalated', {
        quotationId,
        escalatedBy: user.id,
        newUrgency: quotation.approvalUrgency,
        reason,
      });
    }
  }

  async checkApprovalDeadlines(): Promise<void> {
    const overdueApprovals = await this.quotationsRepository
      .createQueryBuilder('quotation')
      .leftJoinAndSelect('quotation.createdBy', 'createdBy')
      .where('quotation.approvalRequestedAt IS NOT NULL')
      .andWhere('quotation.approvalDeadline < :now', { now: new Date() })
      .andWhere('quotation.status IN (:...statuses)', {
        statuses: ['pending_approval', 'pending_review'],
      })
      .getMany();

    for (const quotation of overdueApprovals) {
      await this.handleOverdueApproval(quotation);
    }
  }

  private canRequestApproval(quotation: Quotation, user: User): boolean {
    // Creator can always request approval
    if (quotation.createdById === user.id) {
      return true;
    }

    // Managers and admins can request approval for any quotation
    if (user.roles.includes(UserRole.MANAGER) || user.roles.includes(UserRole.ADMIN)) {
      return true;
    }

    // Sales reps can request approval for their own quotations
    if (user.roles.includes(UserRole.SALES_REP) && quotation.createdById === user.id) {
      return true;
    }

    return false;
  }

  private canApprove(quotation: Quotation, user: User): boolean {
    const userApprovalLevel = this.getUserApprovalLevel(user);
    const requiredLevel = quotation.approvalLevel;

    return this.compareApprovalLevels(userApprovalLevel, requiredLevel) >= 0;
  }

  private canEscalateApproval(quotation: Quotation, user: User): boolean {
    // Only managers and admins can escalate
    return user.roles.includes(UserRole.MANAGER) || user.roles.includes(UserRole.ADMIN);
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
    return ApprovalLevel.MANAGER;
  }

  private getNextApprovalLevel(currentLevel: ApprovalLevel): ApprovalLevel | null {
    const levels = [ApprovalLevel.MANAGER, ApprovalLevel.DIRECTOR, ApprovalLevel.EXECUTIVE];
    const currentIndex = levels.indexOf(currentLevel);
    
    if (currentIndex < levels.length - 1) {
      return levels[currentIndex + 1];
    }
    
    return null; // No more approval levels
  }

  private compareApprovalLevels(level1: ApprovalLevel, level2: ApprovalLevel): number {
    const levels = [ApprovalLevel.MANAGER, ApprovalLevel.DIRECTOR, ApprovalLevel.EXECUTIVE];
    const index1 = levels.indexOf(level1);
    const index2 = levels.indexOf(level2);
    return index1 - index2;
  }

  private calculateDefaultDeadline(urgency: string): Date {
    const deadline = new Date();
    
    switch (urgency) {
      case 'low':
        deadline.setDate(deadline.getDate() + 7); // 1 week
        break;
      case 'medium':
        deadline.setDate(deadline.getDate() + 3); // 3 days
        break;
      case 'high':
        deadline.setDate(deadline.getDate() + 1); // 1 day
        break;
      case 'urgent':
        deadline.setHours(deadline.getHours() + 4); // 4 hours
        break;
    }
    
    return deadline;
  }

  private async sendApprovalRequestNotifications(
    quotation: Quotation,
    approvalRequest: ApprovalRequest,
  ): Promise<void> {
    try {
      // Notify approvers at the required level
      const approvers = await this.findApprovers(approvalRequest.approvalLevel);
      
      for (const approver of approvers) {
        this.logger.log('Approval request notification would be sent', {
          to: approver.email,
          quotationId: quotation.id,
          approvalLevel: approvalRequest.approvalLevel,
        });
      }

      // Notify quotation creator
      if (quotation.createdBy?.email) {
        this.logger.log('Approval requested notification would be sent', {
          to: quotation.createdBy.email,
          quotationId: quotation.id,
          approvalLevel: approvalRequest.approvalLevel,
        });
      }
    } catch (error) {
      this.logger.error('Error sending approval request notifications', {
        quotationId: quotation.id,
        error: error.message,
      });
    }
  }

  private async sendApprovalDecisionNotifications(
    quotation: Quotation,
    approvalDecision: ApprovalDecision,
  ): Promise<void> {
    try {
      // Notify quotation creator
      if (quotation.createdBy?.email) {
        await this.emailService.sendApprovalDecisionEmail(
          quotation.createdBy.email,
          quotation.createdBy.firstName,
          quotation,
          approvalDecision,
        );
      }

      // Notify client if applicable
      if (quotation.client?.email) {
        await this.emailService.sendApprovalDecisionEmail(
          quotation.client.email,
          quotation.client.firstName,
          quotation,
          approvalDecision,
        );
      }
    } catch (error) {
      this.logger.error('Error sending approval decision notifications', {
        quotationId: quotation.id,
        error: error.message,
      });
    }
  }

  private async sendNextApprovalLevelNotifications(
    quotation: Quotation,
    nextLevel: ApprovalLevel,
  ): Promise<void> {
    try {
      const approvers = await this.findApprovers(nextLevel);
      
      for (const approver of approvers) {
        await this.emailService.sendNextApprovalLevelEmail(
          approver.email,
          approver.firstName,
          quotation,
          nextLevel,
        );
      }
    } catch (error) {
      this.logger.error('Error sending next approval level notifications', {
        quotationId: quotation.id,
        error: error.message,
      });
    }
  }

  private async sendApprovalEscalationNotifications(
    quotation: Quotation,
    escalatedBy: User,
    reason: string,
  ): Promise<void> {
    try {
      // Notify higher-level approvers
      const higherApprovers = await this.findHigherLevelApprovers(quotation.approvalLevel);
      
      for (const approver of higherApprovers) {
        await this.emailService.sendApprovalEscalationEmail(
          approver.email,
          approver.firstName,
          quotation,
          escalatedBy,
          reason,
        );
      }
    } catch (error) {
      this.logger.error('Error sending approval escalation notifications', {
        quotationId: quotation.id,
        error: error.message,
      });
    }
  }

  private async findApprovers(approvalLevel: ApprovalLevel): Promise<User[]> {
    // This would typically query the database for users with the required approval level
    // For now, we'll return an empty array
    return [];
  }

  private async findHigherLevelApprovers(currentLevel: ApprovalLevel): Promise<User[]> {
    // This would typically query the database for users with higher approval levels
    // For now, we'll return an empty array
    return [];
  }

  private async handleOverdueApproval(quotation: Quotation): Promise<void> {
    try {
      // Auto-escalate overdue approvals
      await this.escalateApproval(quotation.id, null as any, 'Auto-escalated due to deadline');

      // Send overdue notifications
      await this.sendOverdueApprovalNotifications(quotation);

      this.logger.log('Overdue approval handled', {
        quotationId: quotation.id,
        action: 'auto-escalated',
      });
    } catch (error) {
      this.logger.error('Error handling overdue approval', {
        quotationId: quotation.id,
        error: error.message,
      });
    }
  }

  private async sendOverdueApprovalNotifications(quotation: Quotation): Promise<void> {
    try {
      // Notify approvers that approval is overdue
      const approvers = await this.findApprovers(quotation.approvalLevel);
      
      for (const approver of approvers) {
        await this.emailService.sendOverdueApprovalEmail(
          approver.email,
          approver.firstName,
          quotation,
        );
      }
    } catch (error) {
      this.logger.error('Error sending overdue approval notifications', {
        quotationId: quotation.id,
        error: error.message,
      });
    }
  }
}
