import { IsString, IsOptional, IsEnum, IsBoolean, IsObject, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TemplateType, TemplateVisibility } from '../entities/template.entity';

export class CreateTemplateDto {
  @ApiProperty({
    description: 'Template name',
    example: 'Standard Quotation Template',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Template description',
    example: 'A standard template for creating quotations',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Template type',
    enum: TemplateType,
    example: TemplateType.QUOTATION,
  })
  @IsEnum(TemplateType)
  type: TemplateType;

  @ApiPropertyOptional({
    description: 'Template category',
    example: 'Construction',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Template tags (comma-separated)',
    example: 'construction,standard,basic',
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiProperty({
    description: 'Template visibility',
    enum: TemplateVisibility,
    example: TemplateVisibility.COMPANY,
  })
  @IsEnum(TemplateVisibility)
  visibility: TemplateVisibility;

  @ApiPropertyOptional({
    description: 'Template version',
    example: '1.0.0',
  })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional({
    description: 'Parent template ID for versioning',
    example: 'uuid-here',
  })
  @IsOptional()
  @IsUUID()
  parentTemplateId?: string;

  @ApiPropertyOptional({
    description: 'Whether this is a default template',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({
    description: 'Template structure configuration',
    type: 'object',
  })
  @IsOptional()
  @IsObject()
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

  @ApiPropertyOptional({
    description: 'Default template items',
    type: 'array',
  })
  @IsOptional()
  @IsArray()
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

  @ApiPropertyOptional({
    description: 'Template settings',
    type: 'object',
  })
  @IsOptional()
  @IsObject()
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
    validityPeriod?: number;
    paymentTerms?: string;
    notes?: string;
  };

  @ApiPropertyOptional({
    description: 'Template styling configuration',
    type: 'object',
  })
  @IsOptional()
  @IsObject()
  styling?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    fontSize?: number;
    layout?: 'standard' | 'modern' | 'minimal';
    customCSS?: string;
  };

  @ApiPropertyOptional({
    description: 'Whether the template requires approval',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @ApiPropertyOptional({
    description: 'Company ID (if not provided, uses current user company)',
    example: 'uuid-here',
  })
  @IsOptional()
  @IsUUID()
  companyId?: string;
}
