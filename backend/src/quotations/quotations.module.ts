import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quotation } from './entities/quotation.entity';
import { QuotationItem } from './entities/quotation-item.entity';
import { QuotationsService } from './quotations.service';
import { QuotationsController } from './quotations.controller';
import { WorkflowStateMachineService } from './services/workflow-state-machine.service';
import { ApprovalService } from './services/approval.service';
import { RevisionService } from './services/revision.service';
import { TaxCalculationService } from './services/tax-calculation.service';
import { DiscountService } from './services/discount.service';
import { Logger } from '../common/logger/logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([Quotation, QuotationItem])],
  controllers: [QuotationsController],
  providers: [
    QuotationsService,
    WorkflowStateMachineService,
    ApprovalService,
    RevisionService,
    TaxCalculationService,
    DiscountService,
    Logger,
  ],
  exports: [
    QuotationsService,
    WorkflowStateMachineService,
    ApprovalService,
    RevisionService,
    TaxCalculationService,
    DiscountService,
  ],
})
export class QuotationsModule {}
