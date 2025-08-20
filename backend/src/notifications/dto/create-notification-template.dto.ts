import { IsString, IsArray, IsEnum, IsOptional, IsBoolean, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationTemplateDto {
  @ApiProperty({ description: 'Template name (unique identifier)' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Notification title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Notification body content' })
  @IsString()
  body: string;

  @ApiProperty({ description: 'Template category' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Supported platforms', enum: ['android', 'ios', 'web'] })
  @IsArray()
  @IsEnum(['android', 'ios', 'web'], { each: true })
  platforms: ('android' | 'ios' | 'web')[];

  @ApiProperty({ description: 'Notification priority', enum: ['low', 'normal', 'high'] })
  @IsEnum(['low', 'normal', 'high'])
  priority: 'low' | 'normal' | 'high';

  @ApiPropertyOptional({ description: 'Template variables used in title and body' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[];

  @ApiPropertyOptional({ description: 'Sound file name' })
  @IsOptional()
  @IsString()
  sound?: string;

  @ApiPropertyOptional({ description: 'Icon file name or URL' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: 'Image URL for rich notifications' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Click action for the notification' })
  @IsOptional()
  @IsString()
  clickAction?: string;

  @ApiPropertyOptional({ description: 'Additional data to send with the notification' })
  @IsOptional()
  data?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Whether the template is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
