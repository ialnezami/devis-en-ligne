import { IsOptional, IsString, IsUrl, IsObject, IsArray, IsHexColor } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SocialMediaLinks {
  @ApiPropertyOptional({ description: 'LinkedIn profile URL' })
  @IsOptional()
  @IsUrl()
  linkedin?: string;

  @ApiPropertyOptional({ description: 'Twitter profile URL' })
  @IsOptional()
  @IsUrl()
  twitter?: string;

  @ApiPropertyOptional({ description: 'Facebook page URL' })
  @IsOptional()
  @IsUrl()
  facebook?: string;

  @ApiPropertyOptional({ description: 'Instagram profile URL' })
  @IsOptional()
  @IsUrl()
  instagram?: string;

  @ApiPropertyOptional({ description: 'YouTube channel URL' })
  @IsOptional()
  @IsUrl()
  youtube?: string;

  @ApiPropertyOptional({ description: 'GitHub profile URL' })
  @IsOptional()
  @IsUrl()
  github?: string;
}

export class CompanyBrandingDto {
  @ApiPropertyOptional({ description: 'Company name for branding' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ description: 'Company tagline or slogan' })
  @IsOptional()
  @IsString()
  tagline?: string;

  @ApiPropertyOptional({ description: 'Company description for branding' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Primary brand color (hex)' })
  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @ApiPropertyOptional({ description: 'Secondary brand color (hex)' })
  @IsOptional()
  @IsHexColor()
  secondaryColor?: string;

  @ApiPropertyOptional({ description: 'Accent brand color (hex)' })
  @IsOptional()
  @IsHexColor()
  accentColor?: string;

  @ApiPropertyOptional({ description: 'Neutral brand color (hex)' })
  @IsOptional()
  @IsHexColor()
  neutralColor?: string;

  @ApiPropertyOptional({ description: 'Success color (hex)' })
  @IsOptional()
  @IsHexColor()
  successColor?: string;

  @ApiPropertyOptional({ description: 'Warning color (hex)' })
  @IsOptional()
  @IsHexColor()
  warningColor?: string;

  @ApiPropertyOptional({ description: 'Error color (hex)' })
  @IsOptional()
  @IsHexColor()
  errorColor?: string;

  @ApiPropertyOptional({ description: 'Company logo URL' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Company favicon URL' })
  @IsOptional()
  @IsUrl()
  faviconUrl?: string;

  @ApiPropertyOptional({ description: 'Company website URL' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'Company contact email' })
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiPropertyOptional({ description: 'Company contact phone' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ description: 'Company address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Company city' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Company state/province' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'Company postal code' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Company country' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Social media links' })
  @IsOptional()
  @IsObject()
  socialMedia?: SocialMediaLinks;

  @ApiPropertyOptional({ description: 'Custom CSS for branding' })
  @IsOptional()
  @IsString()
  customCSS?: string;

  @ApiPropertyOptional({ description: 'Custom JavaScript for branding' })
  @IsOptional()
  @IsString()
  customJS?: string;

  @ApiPropertyOptional({ description: 'Brand guidelines document URL' })
  @IsOptional()
  @IsUrl()
  brandGuidelinesUrl?: string;

  @ApiPropertyOptional({ description: 'Brand assets package URL' })
  @IsOptional()
  @IsUrl()
  brandAssetsUrl?: string;

  @ApiPropertyOptional({ description: 'Company mission statement' })
  @IsOptional()
  @IsString()
  missionStatement?: string;

  @ApiPropertyOptional({ description: 'Company vision statement' })
  @IsOptional()
  @IsString()
  visionStatement?: string;

  @ApiPropertyOptional({ description: 'Company values' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  companyValues?: string[];

  @ApiPropertyOptional({ description: 'Brand personality traits' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  brandPersonality?: string[];

  @ApiPropertyOptional({ description: 'Target audience description' })
  @IsOptional()
  @IsString()
  targetAudience?: string;

  @ApiPropertyOptional({ description: 'Brand voice description' })
  @IsOptional()
  @IsString()
  brandVoice?: string;

  @ApiPropertyOptional({ description: 'Brand tone description' })
  @IsOptional()
  @IsString()
  brandTone?: string;
}
