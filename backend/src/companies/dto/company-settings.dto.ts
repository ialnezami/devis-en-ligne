import { IsOptional, IsString, IsBoolean, IsNumber, IsObject, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationSettings {
  @ApiPropertyOptional({ description: 'Enable email notifications' })
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @ApiPropertyOptional({ description: 'Enable push notifications' })
  @IsOptional()
  @IsBoolean()
  push?: boolean;

  @ApiPropertyOptional({ description: 'Enable SMS notifications' })
  @IsOptional()
  @IsBoolean()
  sms?: boolean;
}

export class SecuritySettings {
  @ApiPropertyOptional({ description: 'Require MFA for users' })
  @IsOptional()
  @IsBoolean()
  requireMFA?: boolean;

  @ApiPropertyOptional({ description: 'Session timeout in seconds' })
  @IsOptional()
  @IsNumber()
  sessionTimeout?: number;

  @ApiPropertyOptional({ description: 'Maximum login attempts' })
  @IsOptional()
  @IsNumber()
  maxLoginAttempts?: number;

  @ApiPropertyOptional({ description: 'Password complexity requirements', enum: ['low', 'medium', 'high'] })
  @IsOptional()
  @IsString()
  passwordPolicy?: 'low' | 'medium' | 'high';
}

export class IntegrationSettings {
  @ApiPropertyOptional({ description: 'Enable CRM integration' })
  @IsOptional()
  @IsBoolean()
  crm?: boolean;

  @ApiPropertyOptional({ description: 'Enable accounting integration' })
  @IsOptional()
  @IsBoolean()
  accounting?: boolean;

  @ApiPropertyOptional({ description: 'Enable payment integration' })
  @IsOptional()
  @IsBoolean()
  payment?: boolean;

  @ApiPropertyOptional({ description: 'Enable email marketing integration' })
  @IsOptional()
  @IsBoolean()
  emailMarketing?: boolean;
}

export class CompanySettingsDto {
  @ApiPropertyOptional({ description: 'Company timezone' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Company currency' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Date format' })
  @IsOptional()
  @IsString()
  dateFormat?: string;

  @ApiPropertyOptional({ description: 'Time format' })
  @IsOptional()
  @IsString()
  timeFormat?: string;

  @ApiPropertyOptional({ description: 'Language preference' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Locale preference' })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiPropertyOptional({ description: 'Number format' })
  @IsOptional()
  @IsString()
  numberFormat?: string;

  @ApiPropertyOptional({ description: 'Notification settings' })
  @IsOptional()
  @IsObject()
  notifications?: NotificationSettings;

  @ApiPropertyOptional({ description: 'Notification preferences' })
  @IsOptional()
  @IsObject()
  notificationPreferences?: {
    quotationCreated?: boolean;
    quotationUpdated?: boolean;
    quotationApproved?: boolean;
    quotationRejected?: boolean;
    paymentReceived?: boolean;
    invoiceGenerated?: boolean;
    userInvited?: boolean;
    userRemoved?: boolean;
  };

  @ApiPropertyOptional({ description: 'Security settings' })
  @IsOptional()
  @IsObject()
  security?: SecuritySettings;

  @ApiPropertyOptional({ description: 'Integration settings' })
  @IsOptional()
  @IsObject()
  integrations?: {
    crm?: boolean;
    accounting?: boolean;
    payment?: boolean;
    email?: boolean;
    calendar?: boolean;
    storage?: boolean;
  };

  @ApiPropertyOptional({ description: 'Business hours' })
  @IsOptional()
  @IsObject()
  businessHours?: {
    monday?: { start: string; end: string; closed: boolean };
    tuesday?: { start: string; end: string; closed: boolean };
    wednesday?: { start: string; end: string; closed: boolean };
    thursday?: { start: string; end: string; closed: boolean };
    friday?: { start: string; end: string; closed: boolean };
    saturday?: { start: string; end: string; closed: boolean };
    sunday?: { start: string; end: string; closed: boolean };
  };

  @ApiPropertyOptional({ description: 'Holiday calendar' })
  @IsOptional()
  @IsArray()
  holidays?: string[];

  @ApiPropertyOptional({ description: 'Invoice settings' })
  @IsOptional()
  @IsObject()
  invoice?: {
    prefix?: string;
    nextNumber?: number;
    terms?: string;
    dueDays?: number;
    lateFee?: number;
  };

  @ApiPropertyOptional({ description: 'Quotation settings' })
  @IsOptional()
  @IsObject()
  quotation?: {
    prefix?: string;
    nextNumber?: number;
    validityDays?: number;
    terms?: string;
    notes?: string;
  };
}
