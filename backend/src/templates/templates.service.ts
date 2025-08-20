import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Template, TemplateStatus, TemplateVisibility } from './entities/template.entity';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplateFilterDto } from './dto/template-filter.dto';
import { User } from '../users/entities/user.entity';
import { Logger } from '../common/logger/logger.service';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Template)
    private templatesRepository: Repository<Template>,
    private logger: Logger,
  ) {}

  async create(createTemplateDto: CreateTemplateDto, user: User): Promise<Template> {
    try {
      // Set company ID if not provided
      if (!createTemplateDto.companyId && user.companyId) {
        createTemplateDto.companyId = user.companyId;
      }

      // Validate parent template if provided
      if (createTemplateDto.parentTemplateId) {
        const parentTemplate = await this.findById(createTemplateDto.parentTemplateId);
        if (!parentTemplate.canBeUsedBy(user)) {
          throw new ForbiddenException('Cannot create version of this template');
        }
      }

      const template = this.templatesRepository.create({
        ...createTemplateDto,
        createdById: user.id,
        status: TemplateStatus.DRAFT,
      });

      const savedTemplate = await this.templatesRepository.save(template);
      
      this.logger.log('Template created successfully', { 
        templateId: savedTemplate.id, 
        name: savedTemplate.name,
        createdBy: user.id 
      });
      
      return await this.findById(savedTemplate.id);
    } catch (error) {
      this.logger.error('Error creating template', { 
        error: error.message, 
        createTemplateDto,
        userId: user.id 
      });
      throw error;
    }
  }

  async findAll(filterDto: TemplateFilterDto, user: User): Promise<{ templates: Template[]; total: number }> {
    try {
      const queryBuilder = this.createFilterQuery(filterDto, user);
      
      // Apply pagination
      const page = filterDto.page || 1;
      const limit = filterDto.limit || 10;
      const offset = (page - 1) * limit;

      queryBuilder.skip(offset).take(limit);

      // Apply sorting
      const sortBy = filterDto.sortBy || 'createdAt';
      const sortOrder = filterDto.sortOrder || 'DESC';
      queryBuilder.orderBy(`template.${sortBy}`, sortOrder);

      const [templates, total] = await queryBuilder.getManyAndCount();

      return { templates, total };
    } catch (error) {
      this.logger.error('Error finding templates', { error: error.message, filterDto });
      throw error;
    }
  }

  async findById(id: string): Promise<Template> {
    const template = await this.templatesRepository.findOne({
      where: { id },
      relations: ['createdBy', 'company', 'parentTemplate', 'childTemplates', 'approvedBy'],
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  async findByIdForUser(id: string, user: User): Promise<Template> {
    const template = await this.findById(id);
    
    if (!template.canBeUsedBy(user)) {
      throw new ForbiddenException('You do not have access to this template');
    }

    return template;
  }

  async update(id: string, updateTemplateDto: UpdateTemplateDto, user: User): Promise<Template> {
    try {
      const template = await this.findById(id);
      
      // Check permissions
      if (template.createdById !== user.id && !user.isAdmin) {
        throw new ForbiddenException('You can only update your own templates');
      }

      Object.assign(template, updateTemplateDto);
      const updatedTemplate = await this.templatesRepository.save(template);
      
      this.logger.log('Template updated successfully', { 
        templateId: id, 
        updates: Object.keys(updateTemplateDto),
        updatedBy: user.id 
      });
      
      return await this.findById(updatedTemplate.id);
    } catch (error) {
      this.logger.error('Error updating template', { 
        templateId: id, 
        error: error.message,
        userId: user.id 
      });
      throw error;
    }
  }

  async remove(id: string, user: User): Promise<void> {
    try {
      const template = await this.findById(id);
      
      // Check permissions
      if (template.createdById !== user.id && !user.isAdmin) {
        throw new ForbiddenException('You can only delete your own templates');
      }

      // Check if template is being used
      if (template.usageCount > 0) {
        throw new BadRequestException('Cannot delete template that has been used');
      }

      await this.templatesRepository.softDelete(id);
      
      this.logger.log('Template deleted successfully', { 
        templateId: id,
        deletedBy: user.id 
      });
    } catch (error) {
      this.logger.error('Error deleting template', { 
        templateId: id, 
        error: error.message,
        userId: user.id 
      });
      throw error;
    }
  }

  async activate(id: string, user: User): Promise<Template> {
    const template = await this.findById(id);
    
    if (template.createdById !== user.id && !user.isAdmin) {
      throw new ForbiddenException('You can only activate your own templates');
    }

    template.activate();
    await this.templatesRepository.save(template);

    this.logger.log('Template activated', { templateId: id, activatedBy: user.id });
    
    return template;
  }

  async archive(id: string, user: User): Promise<Template> {
    const template = await this.findById(id);
    
    if (template.createdById !== user.id && !user.isAdmin) {
      throw new ForbiddenException('You can only archive your own templates');
    }

    template.archive();
    await this.templatesRepository.save(template);

    this.logger.log('Template archived', { templateId: id, archivedBy: user.id });
    
    return template;
  }

  async duplicate(id: string, user: User): Promise<Template> {
    try {
      const originalTemplate = await this.findByIdForUser(id, user);
      
      const clonedData = originalTemplate.clone();
      const newTemplate = this.templatesRepository.create({
        ...clonedData,
        createdById: user.id,
        companyId: user.companyId,
      });

      const savedTemplate = await this.templatesRepository.save(newTemplate);
      
      this.logger.log('Template duplicated successfully', { 
        originalId: id, 
        newId: savedTemplate.id,
        duplicatedBy: user.id 
      });
      
      return await this.findById(savedTemplate.id);
    } catch (error) {
      this.logger.error('Error duplicating template', { 
        templateId: id, 
        error: error.message,
        userId: user.id 
      });
      throw error;
    }
  }

  async createVersion(id: string, newVersion: string, user: User): Promise<Template> {
    try {
      const originalTemplate = await this.findByIdForUser(id, user);
      
      // Check if version already exists
      const existingVersion = await this.templatesRepository.findOne({
        where: { 
          parentTemplateId: id, 
          version: newVersion 
        },
      });

      if (existingVersion) {
        throw new BadRequestException(`Version ${newVersion} already exists`);
      }

      const versionData = originalTemplate.createVersion(newVersion);
      const newTemplate = this.templatesRepository.create({
        ...versionData,
        createdById: user.id,
      });

      const savedTemplate = await this.templatesRepository.save(newTemplate);
      
      this.logger.log('Template version created successfully', { 
        originalId: id, 
        versionId: savedTemplate.id,
        version: newVersion,
        createdBy: user.id 
      });
      
      return await this.findById(savedTemplate.id);
    } catch (error) {
      this.logger.error('Error creating template version', { 
        templateId: id, 
        version: newVersion,
        error: error.message,
        userId: user.id 
      });
      throw error;
    }
  }

  async approve(id: string, approver: User, notes?: string): Promise<Template> {
    try {
      const template = await this.findById(id);
      
      if (!approver.isAdmin && !approver.isManager) {
        throw new ForbiddenException('Only admins and managers can approve templates');
      }

      template.approve(approver, notes);
      await this.templatesRepository.save(template);

      this.logger.log('Template approved', { 
        templateId: id, 
        approvedBy: approver.id,
        notes 
      });
      
      return template;
    } catch (error) {
      this.logger.error('Error approving template', { 
        templateId: id, 
        error: error.message,
        approverId: approver.id 
      });
      throw error;
    }
  }

  async incrementUsage(id: string): Promise<void> {
    try {
      const template = await this.findById(id);
      template.incrementUsage();
      await this.templatesRepository.save(template);

      this.logger.log('Template usage incremented', { templateId: id });
    } catch (error) {
      this.logger.error('Error incrementing template usage', { 
        templateId: id, 
        error: error.message 
      });
    }
  }

  async getCategories(user: User): Promise<string[]> {
    try {
      const query = this.templatesRepository
        .createQueryBuilder('template')
        .select('DISTINCT template.category', 'category')
        .where('template.category IS NOT NULL');

      // Apply visibility filter
      this.applyVisibilityFilter(query, user);

      const result = await query.getRawMany();
      return result.map(row => row.category).filter(Boolean);
    } catch (error) {
      this.logger.error('Error getting template categories', { 
        error: error.message,
        userId: user.id 
      });
      throw error;
    }
  }

  async getPopularTemplates(user: User, limit: number = 10): Promise<Template[]> {
    try {
      const queryBuilder = this.templatesRepository
        .createQueryBuilder('template')
        .leftJoinAndSelect('template.createdBy', 'createdBy')
        .leftJoinAndSelect('template.company', 'company')
        .where('template.status = :status', { status: TemplateStatus.ACTIVE })
        .orderBy('template.usageCount', 'DESC')
        .limit(limit);

      this.applyVisibilityFilter(queryBuilder, user);

      return await queryBuilder.getMany();
    } catch (error) {
      this.logger.error('Error getting popular templates', { 
        error: error.message,
        userId: user.id 
      });
      throw error;
    }
  }

  private createFilterQuery(filterDto: TemplateFilterDto, user: User): SelectQueryBuilder<Template> {
    const queryBuilder = this.templatesRepository
      .createQueryBuilder('template')
      .leftJoinAndSelect('template.createdBy', 'createdBy')
      .leftJoinAndSelect('template.company', 'company')
      .leftJoinAndSelect('template.parentTemplate', 'parentTemplate');

    // Apply visibility filter
    this.applyVisibilityFilter(queryBuilder, user);

    // Apply filters
    if (filterDto.type) {
      queryBuilder.andWhere('template.type = :type', { type: filterDto.type });
    }

    if (filterDto.status) {
      queryBuilder.andWhere('template.status = :status', { status: filterDto.status });
    }

    if (filterDto.visibility) {
      queryBuilder.andWhere('template.visibility = :visibility', { visibility: filterDto.visibility });
    }

    if (filterDto.category) {
      queryBuilder.andWhere('template.category = :category', { category: filterDto.category });
    }

    if (filterDto.tags) {
      queryBuilder.andWhere('template.tags ILIKE :tags', { tags: `%${filterDto.tags}%` });
    }

    if (filterDto.companyId) {
      queryBuilder.andWhere('template.companyId = :companyId', { companyId: filterDto.companyId });
    }

    if (filterDto.createdById) {
      queryBuilder.andWhere('template.createdById = :createdById', { createdById: filterDto.createdById });
    }

    if (filterDto.isDefault !== undefined) {
      queryBuilder.andWhere('template.isDefault = :isDefault', { isDefault: filterDto.isDefault });
    }

    if (filterDto.search) {
      queryBuilder.andWhere(
        '(template.name ILIKE :search OR template.description ILIKE :search)',
        { search: `%${filterDto.search}%` }
      );
    }

    return queryBuilder;
  }

  private applyVisibilityFilter(queryBuilder: SelectQueryBuilder<Template>, user: User): void {
    queryBuilder.andWhere(
      '(template.visibility = :public OR ' +
      '(template.visibility = :company AND template.companyId = :userCompanyId) OR ' +
      '(template.visibility = :private AND template.createdById = :userId))',
      {
        public: TemplateVisibility.PUBLIC,
        company: TemplateVisibility.COMPANY,
        private: TemplateVisibility.PRIVATE,
        userCompanyId: user.companyId,
        userId: user.id,
      }
    );
  }
}
