import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quotation } from './entities/quotation.entity';
import { WorkflowStateMachineService } from './services/workflow-state-machine.service';
import { ApprovalService } from './services/approval.service';
import { RevisionService } from './services/revision.service';
import { Logger } from '../common/logger/logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([Quotation])],
  controllers: [],
  providers: [
    WorkflowStateMachineService,
    ApprovalService,
    RevisionService,
    Logger,
  ],
  exports: [
    WorkflowStateMachineService,
    ApprovalService,
    RevisionService,
  ],
})
export class QuotationsModule {}
