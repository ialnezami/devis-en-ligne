import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @ApiProperty({
    description: 'Page number (1-based)',
    example: 1,
    default: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    description: 'Field to sort by',
    example: 'createdAt',
    default: 'createdAt',
    required: false,
    enum: ['id', 'createdAt', 'updatedAt', 'name', 'email', 'status'],
  })
  @IsOptional()
  @IsString()
  sort?: string = 'createdAt';

  @ApiProperty({
    description: 'Sort order',
    example: 'desc',
    default: 'desc',
    required: false,
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}

export class PaginationMetaDto {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of items',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 8,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPrev: boolean;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of items for the current page',
    isArray: true,
  })
  data: T[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  pagination: PaginationMetaDto;
}

export class FilterQueryDto {
  @ApiProperty({
    description: 'Filter by status',
    example: 'active',
    required: false,
    enum: ['active', 'inactive', 'pending', 'approved', 'rejected'],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description: 'Filter from date (ISO 8601 format)',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiProperty({
    description: 'Filter to date (ISO 8601 format)',
    example: '2024-12-31T23:59:59.999Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiProperty({
    description: 'Search query across relevant fields',
    example: 'john doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by category',
    example: 'technology',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'Filter by tags (comma-separated)',
    example: 'urgent,high-priority',
    required: false,
  })
  @IsOptional()
  @IsString()
  tags?: string;
}

export class SearchQueryDto extends FilterQueryDto {
  @ApiProperty({
    description: 'Search query across multiple fields',
    example: 'web development project',
    required: false,
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({
    description: 'Fields to search in (comma-separated)',
    example: 'name,description,content',
    required: false,
  })
  @IsOptional()
  @IsString()
  fields?: string;

  @ApiProperty({
    description: 'Whether to use fuzzy search',
    example: true,
    required: false,
  })
  @IsOptional()
  fuzzy?: boolean = true;
}

export class SortQueryDto {
  @ApiProperty({
    description: 'Primary sort field',
    example: 'createdAt',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    description: 'Primary sort order',
    example: 'desc',
    required: false,
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiProperty({
    description: 'Secondary sort field',
    example: 'name',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBySecondary?: string;

  @ApiProperty({
    description: 'Secondary sort order',
    example: 'asc',
    required: false,
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrderSecondary?: 'asc' | 'desc';
}

export class DateRangeQueryDto {
  @ApiProperty({
    description: 'Start date for the range (ISO 8601 format)',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for the range (ISO 8601 format)',
    example: '2024-12-31T23:59:59.999Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({
    description: 'Predefined date range',
    example: '30d',
    required: false,
    enum: ['7d', '30d', '90d', '1y', 'custom'],
  })
  @IsOptional()
  @IsIn(['7d', '30d', '90d', '1y', 'custom'])
  range?: '7d' | '30d' | '90d' | '1y' | 'custom';
}

export class ExportQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description: 'Export format',
    example: 'pdf',
    required: false,
    enum: ['pdf', 'excel', 'csv', 'json'],
  })
  @IsOptional()
  @IsIn(['pdf', 'excel', 'csv', 'json'])
  format?: 'pdf' | 'excel' | 'csv' | 'json' = 'pdf';

  @ApiProperty({
    description: 'Include metadata in export',
    example: true,
    required: false,
  })
  @IsOptional()
  includeMetadata?: boolean = true;

  @ApiProperty({
    description: 'Custom filename for export',
    example: 'quotations-report-2024',
    required: false,
  })
  @IsOptional()
  @IsString()
  filename?: string;
}
