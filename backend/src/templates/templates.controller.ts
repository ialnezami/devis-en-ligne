import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplateFilterDto } from './dto/template-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { Template } from './entities/template.entity';

@ApiTags('templates')
@Controller('templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new template' })
  @ApiResponse({
    status: 201,
    description: 'Template created successfully',
    type: Template,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createTemplateDto: CreateTemplateDto, @CurrentUser() user: User) {
    return this.templatesService.create(createTemplateDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all templates with filtering' })
  @ApiResponse({
    status: 200,
    description: 'Templates retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        templates: {
          type: 'array',
          items: { $ref: '#/components/schemas/Template' },
        },
        total: { type: 'number' },
      },
    },
  })
  async findAll(@Query() filterDto: TemplateFilterDto, @CurrentUser() user: User) {
    return this.templatesService.findAll(filterDto, user);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all template categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    schema: {
      type: 'array',
      items: { type: 'string' },
    },
  })
  async getCategories(@CurrentUser() user: User) {
    return this.templatesService.getCategories(user);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular templates' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Popular templates retrieved successfully',
    type: [Template],
  })
  async getPopular(@Query('limit') limit: number = 10, @CurrentUser() user: User) {
    return this.templatesService.getPopularTemplates(user, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiResponse({
    status: 200,
    description: 'Template retrieved successfully',
    type: Template,
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.templatesService.findByIdForUser(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update template' })
  @ApiResponse({
    status: 200,
    description: 'Template updated successfully',
    type: Template,
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
    @CurrentUser() user: User,
  ) {
    return this.templatesService.update(id, updateTemplateDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete template' })
  @ApiResponse({
    status: 200,
    description: 'Template deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    await this.templatesService.remove(id, user);
    return { message: 'Template deleted successfully' };
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate template' })
  @ApiResponse({
    status: 200,
    description: 'Template activated successfully',
    type: Template,
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async activate(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.templatesService.activate(id, user);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive template' })
  @ApiResponse({
    status: 200,
    description: 'Template archived successfully',
    type: Template,
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async archive(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.templatesService.archive(id, user);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate template' })
  @ApiResponse({
    status: 201,
    description: 'Template duplicated successfully',
    type: Template,
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async duplicate(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.templatesService.duplicate(id, user);
  }

  @Post(':id/version')
  @ApiOperation({ summary: 'Create new version of template' })
  @ApiResponse({
    status: 201,
    description: 'Template version created successfully',
    type: Template,
  })
  @ApiResponse({ status: 400, description: 'Version already exists' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createVersion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('version') version: string,
    @CurrentUser() user: User,
  ) {
    return this.templatesService.createVersion(id, version, user);
  }

  @Post(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Approve template' })
  @ApiResponse({
    status: 200,
    description: 'Template approved successfully',
    type: Template,
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('notes') notes: string,
    @CurrentUser() user: User,
  ) {
    return this.templatesService.approve(id, user, notes);
  }

  @Post(':id/use')
  @ApiOperation({ summary: 'Mark template as used (increment usage count)' })
  @ApiResponse({
    status: 200,
    description: 'Template usage recorded successfully',
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async markAsUsed(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    // First check if user can access the template
    await this.templatesService.findByIdForUser(id, user);
    
    // Then increment usage
    await this.templatesService.incrementUsage(id);
    
    return { message: 'Template usage recorded successfully' };
  }
}
