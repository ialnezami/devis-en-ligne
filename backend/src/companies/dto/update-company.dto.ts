import { IsOptional, IsString, IsEmail, IsPhoneNumber, IsUrl, IsEnum, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum CompanySize {
  MICRO = 'micro',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  ENTERPRISE = 'enterprise'
}

export enum CompanyIndustry {
  TECHNOLOGY = 'technology',
  HEALTHCARE = 'healthcare',
  FINANCE = 'finance',
  EDUCATION = 'education',
  MANUFACTURING = 'manufacturing',
  RETAIL = 'retail',
  CONSULTING = 'consulting',
  OTHER = 'other'
}

export class UpdateCompanyDto {
  @ApiPropertyOptional({ description: 'Company name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Company description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Company email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Company phone number' })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional({ description: 'Company address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Company website' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'Company industry', enum: CompanyIndustry })
  @IsOptional()
  @IsEnum(CompanyIndustry)
  industry?: CompanyIndustry;

  @ApiPropertyOptional({ description: 'Company size', enum: CompanySize })
  @IsOptional()
  @IsEnum(CompanySize)
  size?: CompanySize;

  @ApiPropertyOptional({ description: 'Company founded year' })
  @IsOptional()
  @IsString()
  foundedYear?: string;

  @ApiPropertyOptional({ description: 'Company tax ID' })
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiPropertyOptional({ description: 'Company registration number' })
  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @ApiPropertyOptional({ description: 'Company VAT number' })
  @IsOptional()
  @IsString()
  vatNumber?: string;

  @ApiPropertyOptional({ description: 'Company CEO name' })
  @IsOptional()
  @IsString()
  ceoName?: string;

  @ApiPropertyOptional({ description: 'Company contact person' })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiPropertyOptional({ description: 'Company notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
