import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { CompanySettings } from './entities/company-settings.entity';
import { CompanyBranding } from './entities/company-branding.entity';
import { CompaniesService } from './services/companies.service';

@Module({
  imports: [TypeOrmModule.forFeature([Company, CompanySettings, CompanyBranding])],
  controllers: [],
  providers: [CompaniesService],
  exports: [TypeOrmModule, CompaniesService],
})
export class CompaniesModule {}
