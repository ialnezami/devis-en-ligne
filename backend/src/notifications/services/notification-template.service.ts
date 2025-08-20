import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationTemplate } from './push-notification.service';
import { CreateNotificationTemplateDto } from '../dto/create-notification-template.dto';
import { UpdateNotificationTemplateDto } from '../dto/update-notification-template.dto';

@Injectable()
export class NotificationTemplateService {
  private readonly logger = new Logger(NotificationTemplateService.name);

  constructor(
    @InjectRepository(NotificationTemplate)
    private readonly templateRepository: Repository<NotificationTemplate>,
  ) {}

  /**
   * Create a new notification template
   */
  async createTemplate(
    createTemplateDto: CreateNotificationTemplateDto,
  ): Promise<NotificationTemplate> {
    try {
      // Check if template with same name already exists
      const existingTemplate = await this.templateRepository.findOne({
        where: { name: createTemplateDto.name },
      });

      if (existingTemplate) {
        throw new BadRequestException('Template with this name already exists');
      }

      // Validate template variables
      this.validateTemplateVariables(createTemplateDto.title, createTemplateDto.variables);
      this.validateTemplateVariables(createTemplateDto.body, createTemplateDto.variables);

      const template = this.templateRepository.create({
        ...createTemplateDto,
        isActive: true,
      });

      const savedTemplate = await this.templateRepository.save(template);
      
      this.logger.log('Notification template created successfully', { 
        templateId: savedTemplate.id, 
        name: savedTemplate.name 
      });

      return savedTemplate;
    } catch (error) {
      this.logger.error('Failed to create notification template', error);
      throw error;
    }
  }

  /**
   * Get all notification templates
   */
  async findAll(
    filters?: {
      category?: string;
      platform?: 'android' | 'ios' | 'web';
      isActive?: boolean;
      search?: string;
    },
  ): Promise<NotificationTemplate[]> {
    try {
      const queryBuilder = this.templateRepository.createQueryBuilder('template');

      // Apply filters
      if (filters?.category) {
        queryBuilder.andWhere('template.category = :category', { category: filters.category });
      }

      if (filters?.platform) {
        queryBuilder.andWhere(':platform = ANY(template.platforms)', { platform: filters.platform });
      }

      if (filters?.isActive !== undefined) {
        queryBuilder.andWhere('template.isActive = :isActive', { isActive: filters.isActive });
      }

      if (filters?.search) {
        queryBuilder.andWhere(
          '(template.name ILIKE :search OR template.title ILIKE :search OR template.body ILIKE :search)',
          { search: `%${filters.search}%` }
        );
      }

      queryBuilder.orderBy('template.name', 'ASC');

      return await queryBuilder.getMany();
    } catch (error) {
      this.logger.error('Failed to retrieve notification templates', error);
      throw error;
    }
  }

  /**
   * Get notification template by ID
   */
  async findOne(id: string): Promise<NotificationTemplate> {
    try {
      const template = await this.templateRepository.findOne({
        where: { id },
      });

      if (!template) {
        throw new NotFoundException(`Notification template with ID ${id} not found`);
      }

      return template;
    } catch (error) {
      this.logger.error('Failed to retrieve notification template', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Get notification template by name
   */
  async findByName(name: string): Promise<NotificationTemplate | null> {
    try {
      return await this.templateRepository.findOne({
        where: { name },
      });
    } catch (error) {
      this.logger.error('Failed to retrieve notification template by name', { name, error: error.message });
      throw error;
    }
  }

  /**
   * Get notification templates by category
   */
  async findByCategory(category: string): Promise<NotificationTemplate[]> {
    try {
      return await this.templateRepository.find({
        where: { category, isActive: true },
        order: { name: 'ASC' },
      });
    } catch (error) {
      this.logger.error('Failed to retrieve notification templates by category', { category, error: error.message });
      throw error;
    }
  }

  /**
   * Update notification template
   */
  async updateTemplate(
    id: string,
    updateTemplateDto: UpdateNotificationTemplateDto,
  ): Promise<NotificationTemplate> {
    try {
      const template = await this.findOne(id);

      // Check if name is being changed and if it conflicts with existing templates
      if (updateTemplateDto.name && updateTemplateDto.name !== template.name) {
        const existingTemplate = await this.templateRepository.findOne({
          where: { name: updateTemplateDto.name },
        });

        if (existingTemplate) {
          throw new BadRequestException('Template with this name already exists');
        }
      }

      // Validate template variables if title or body is being updated
      if (updateTemplateDto.title) {
        this.validateTemplateVariables(updateTemplateDto.title, updateTemplateDto.variables || template.variables);
      }

      if (updateTemplateDto.body) {
        this.validateTemplateVariables(updateTemplateDto.body, updateTemplateDto.variables || template.variables);
      }

      // Update template
      Object.assign(template, updateTemplateDto);
      template.updatedAt = new Date();

      const updatedTemplate = await this.templateRepository.save(template);
      
      this.logger.log('Notification template updated successfully', { 
        templateId: id, 
        name: updatedTemplate.name 
      });

      return updatedTemplate;
    } catch (error) {
      this.logger.error('Failed to update notification template', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Delete notification template
   */
  async removeTemplate(id: string): Promise<void> {
    try {
      const template = await this.findOne(id);
      await this.templateRepository.remove(template);
      
      this.logger.log('Notification template deleted successfully', { id });
    } catch (error) {
      this.logger.error('Failed to delete notification template', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Activate notification template
   */
  async activateTemplate(id: string): Promise<NotificationTemplate> {
    try {
      const template = await this.findOne(id);
      template.isActive = true;
      template.updatedAt = new Date();

      const activatedTemplate = await this.templateRepository.save(template);
      
      this.logger.log('Notification template activated successfully', { id });

      return activatedTemplate;
    } catch (error) {
      this.logger.error('Failed to activate notification template', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Deactivate notification template
   */
  async deactivateTemplate(id: string): Promise<NotificationTemplate> {
    try {
      const template = await this.findOne(id);
      template.isActive = false;
      template.updatedAt = new Date();

      const deactivatedTemplate = await this.templateRepository.save(template);
      
      this.logger.log('Notification template deactivated successfully', { id });

      return deactivatedTemplate;
    } catch (error) {
      this.logger.error('Failed to deactivate notification template', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Duplicate notification template
   */
  async duplicateTemplate(
    id: string,
    newName: string,
  ): Promise<NotificationTemplate> {
    try {
      const originalTemplate = await this.findOne(id);
      
      const duplicatedTemplate = this.templateRepository.create({
        ...originalTemplate,
        id: undefined, // Let TypeORM generate new ID
        name: newName,
        isActive: false, // Start as inactive
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedTemplate = await this.templateRepository.save(duplicatedTemplate);
      
      this.logger.log('Notification template duplicated successfully', { 
        originalId: id, 
        newId: savedTemplate.id,
        newName 
      });

      return savedTemplate;
    } catch (error) {
      this.logger.error('Failed to duplicate notification template', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Get template categories
   */
  async getTemplateCategories(): Promise<string[]> {
    try {
      const categories = await this.templateRepository
        .createQueryBuilder('template')
        .select('DISTINCT template.category', 'category')
        .where('template.isActive = :isActive', { isActive: true })
        .orderBy('template.category', 'ASC')
        .getRawMany();

      return categories.map(cat => cat.category);
    } catch (error) {
      this.logger.error('Failed to get template categories', error);
      throw error;
    }
  }

  /**
   * Get template statistics
   */
  async getTemplateStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byCategory: Record<string, number>;
    byPlatform: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    try {
      const [total, active, inactive] = await Promise.all([
        this.templateRepository.count(),
        this.templateRepository.count({ where: { isActive: true } }),
        this.templateRepository.count({ where: { isActive: false } }),
      ]);

      // Get count by category
      const categories = await this.templateRepository
        .createQueryBuilder('template')
        .select('template.category', 'category')
        .addSelect('COUNT(*)', 'count')
        .groupBy('template.category')
        .getRawMany();

      const byCategory: Record<string, number> = {};
      categories.forEach(cat => {
        byCategory[cat.category] = parseInt(cat.count);
      });

      // Get count by platform
      const platforms = ['android', 'ios', 'web'] as const;
      const byPlatform: Record<string, number> = {};
      
      for (const platform of platforms) {
        const count = await this.templateRepository
          .createQueryBuilder('template')
          .where(`:platform = ANY(template.platforms)`, { platform })
          .getCount();
        byPlatform[platform] = count;
      }

      // Get count by priority
      const priorities = ['low', 'normal', 'high'] as const;
      const byPriority: Record<string, number> = {};
      
      for (const priority of priorities) {
        const count = await this.templateRepository.count({ where: { priority } });
        byPriority[priority] = count;
      }

      return {
        total,
        active,
        inactive,
        byCategory,
        byPlatform,
        byPriority,
      };
    } catch (error) {
      this.logger.error('Failed to get template statistics', error);
      throw error;
    }
  }

  /**
   * Validate template variables
   */
  private validateTemplateVariables(content: string, variables: string[]): void {
    const usedVariables = this.extractVariablesFromContent(content);
    const missingVariables = usedVariables.filter(v => !variables.includes(v));
    
    if (missingVariables.length > 0) {
      throw new BadRequestException(
        `Template content uses variables that are not defined: ${missingVariables.join(', ')}`
      );
    }
  }

  /**
   * Extract variables from template content
   */
  private extractVariablesFromContent(content: string): string[] {
    const variableRegex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      variables.push(match[1]);
    }

    return [...new Set(variables)]; // Remove duplicates
  }

  /**
   * Render template with variables
   */
  renderTemplate(
    template: NotificationTemplate,
    variables: Record<string, string>,
  ): { title: string; body: string } {
    try {
      let title = template.title;
      let body = template.body;

      // Replace variables in title and body
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        title = title.replace(regex, value);
        body = body.replace(regex, value);
      });

      return { title, body };
    } catch (error) {
      this.logger.error('Failed to render template', { templateId: template.id, error: error.message });
      throw new BadRequestException('Failed to render template');
    }
  }

  /**
   * Get default templates
   */
  async createDefaultTemplates(): Promise<void> {
    try {
      const defaultTemplates = [
        {
          name: 'quotation_created',
          title: 'New Quotation Created',
          body: 'A new quotation has been created for {{clientName}} with total amount {{amount}}.',
          category: 'quotation',
          platforms: ['android', 'ios', 'web'],
          priority: 'normal' as const,
          variables: ['clientName', 'amount'],
        },
        {
          name: 'quotation_approved',
          title: 'Quotation Approved',
          body: 'Your quotation for {{clientName}} has been approved!',
          category: 'quotation',
          platforms: ['android', 'ios', 'web'],
          priority: 'high' as const,
          variables: ['clientName'],
        },
        {
          name: 'quotation_rejected',
          title: 'Quotation Rejected',
          body: 'Your quotation for {{clientName}} has been rejected. Reason: {{reason}}',
          category: 'quotation',
          platforms: ['android', 'ios', 'web'],
          priority: 'high' as const,
          variables: ['clientName', 'reason'],
        },
        {
          name: 'payment_received',
          title: 'Payment Received',
          body: 'Payment of {{amount}} has been received for quotation {{quotationNumber}}.',
          category: 'payment',
          platforms: ['android', 'ios', 'web'],
          priority: 'high' as const,
          variables: ['amount', 'quotationNumber'],
        },
        {
          name: 'user_invited',
          title: 'You\'ve Been Invited',
          body: '{{inviterName}} has invited you to join {{companyName}}.',
          category: 'user',
          platforms: ['android', 'ios', 'web'],
          priority: 'normal' as const,
          variables: ['inviterName', 'companyName'],
        },
        {
          name: 'reminder',
          title: 'Reminder',
          body: '{{message}}',
          category: 'general',
          platforms: ['android', 'ios', 'web'],
          priority: 'normal' as const,
          variables: ['message'],
        },
      ];

      for (const templateData of defaultTemplates) {
        const existingTemplate = await this.findByName(templateData.name);
        if (!existingTemplate) {
          await this.createTemplate(templateData);
        }
      }

      this.logger.log('Default notification templates created successfully');
    } catch (error) {
      this.logger.error('Failed to create default templates', error);
      throw error;
    }
  }
}
