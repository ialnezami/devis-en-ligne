import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseUUIDPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { QuotationStatus } from './enums/quotation-status.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('quotations')
@Controller('quotations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  @Roles(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new quotation' })
  @ApiResponse({ status: 201, description: 'Quotation created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createQuotationDto: CreateQuotationDto, @Request() req) {
    return this.quotationsService.create(createQuotationDto, req.user.id);
  }

  @Get()
  @Roles(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all quotations with optional filters' })
  @ApiResponse({ status: 200, description: 'Quotations retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @Query('status') status?: QuotationStatus,
    @Query('priority') priority?: string,
    @Query('createdById') createdById?: string,
    @Query('clientId') clientId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const filters: any = {};
    
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (createdById) filters.createdById = createdById;
    if (clientId) filters.clientId = clientId;
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);

    return this.quotationsService.findAll(filters);
  }

  @Get(':id')
  @Roles(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a quotation by ID' })
  @ApiResponse({ status: 200, description: 'Quotation retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.quotationsService.findOne(id);
  }

  @Get('number/:quotationNumber')
  @Roles(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a quotation by quotation number' })
  @ApiResponse({ status: 200, description: 'Quotation retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByNumber(@Param('quotationNumber') quotationNumber: string) {
    return this.quotationsService.findByNumber(quotationNumber);
  }

  @Patch(':id')
  @Roles(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a quotation' })
  @ApiResponse({ status: 200, description: 'Quotation updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateQuotationDto: UpdateQuotationDto,
    @Request() req,
  ) {
    return this.quotationsService.update(id, updateQuotationDto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Cancel a quotation' })
  @ApiResponse({ status: 200, description: 'Quotation cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.quotationsService.remove(id, req.user.id);
  }

  @Post(':id/duplicate')
  @Roles(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Duplicate a quotation' })
  @ApiResponse({ status: 201, description: 'Quotation duplicated successfully' })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  duplicate(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.quotationsService.duplicate(id, req.user.id);
  }

  @Post(':id/status/:status')
  @Roles(UserRole.USER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Change quotation status' })
  @ApiResponse({ status: 200, description: 'Quotation status changed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('status', new ParseEnumPipe(QuotationStatus)) status: QuotationStatus,
    @Body('notes') notes?: string,
    @Request() req,
  ) {
    return this.quotationsService.changeStatus(id, status, req.user.id, notes);
  }
}
