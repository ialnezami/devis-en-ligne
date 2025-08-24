import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import { CompanySettings } from '../entities/company-settings.entity';
import { CompanyBranding } from '../entities/company-branding.entity';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { CompanySettingsDto } from '../dto/company-settings.dto';
import { CompanyBrandingDto } from '../dto/company-branding.dto';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(CompanySettings)
    private readonly companySettingsRepository: Repository<CompanySettings>,
    @InjectRepository(CompanyBranding)
    private readonly companyBrandingRepository: Repository<CompanyBranding>,
  ) {}

  /**
   * Create a new company
   */
  async createCompany(createCompanyDto: CreateCompanyDto, userId: string): Promise<Company> {
    try {
      // Check if company with same name already exists
      const existingCompany = await this.companyRepository.findOne({
        where: { name: createCompanyDto.name },
      });

      if (existingCompany) {
        throw new BadRequestException('Company with this name already exists');
      }

      // Create company
      const company = this.companyRepository.create({
        ...createCompanyDto,
        createdBy: userId,
        status: 'active',
      });

      const savedCompany = await this.companyRepository.save(company);

      // Create default company settings
      const defaultSettings = this.companySettingsRepository.create({
        companyId: savedCompany.id,
        timezone: 'UTC',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
        security: {
          requireMFA: false,
          sessionTimeout: 3600,
          maxLoginAttempts: 5,
        },
        integrations: {
          crm: false,
          accounting: false,
          payment: false,
        },
      })[0];

      await this.companySettingsRepository.save(defaultSettings);

      // Create default company branding
      const defaultBranding = this.companyBrandingRepository.create({
        companyId: savedCompany.id,
        primaryColor: '#3B82F6',
        secondaryColor: '#6B7280',
        accentColor: '#10B981',
        logoUrl: null,
        faviconUrl: null,
        companyName: savedCompany.name,
        tagline: null,
        website: null,
        contactEmail: savedCompany.email,
        contactPhone: savedCompany.phone,
        address: savedCompany.address,
        socialMedia: {
          linkedin: null,
          twitter: null,
          facebook: null,
          instagram: null,
        },
        customCSS: null,
        customJS: null,
      })[0];

      await this.companyBrandingRepository.save(defaultBranding);

      this.logger.log('Company created successfully', { 
        companyId: savedCompany.id, 
        name: savedCompany.name 
      });

      return savedCompany;
    } catch (error) {
      this.logger.error('Failed to create company', error);
      throw error;
    }
  }

  /**
   * Get all companies with optional filtering
   */
  async findAll(
    filters?: {
      status?: string;
      industry?: string;
      size?: string;
      search?: string;
    },
    pagination?: {
      page: number;
      limit: number;
    },
  ): Promise<{ companies: Company[]; total: number; page: number; totalPages: number }> {
    try {
      const queryBuilder = this.companyRepository
        .createQueryBuilder('company')
        .leftJoinAndSelect('company.settings', 'settings')
        .leftJoinAndSelect('company.branding', 'branding')
        .leftJoinAndSelect('company.users', 'users');

      // Apply filters
      if (filters?.status) {
        queryBuilder.andWhere('company.status = :status', { status: filters.status });
      }

      if (filters?.industry) {
        queryBuilder.andWhere('company.industry = :industry', { industry: filters.industry });
      }

      if (filters?.size) {
        queryBuilder.andWhere('company.size = :size', { size: filters.size });
      }

      if (filters?.search) {
        queryBuilder.andWhere(
          '(company.name ILIKE :search OR company.email ILIKE :search OR company.description ILIKE :search)',
          { search: `%${filters.search}%` }
        );
      }

      // Apply pagination
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;

      queryBuilder
        .orderBy('company.createdAt', 'DESC')
        .skip(offset)
        .take(limit);

      const [companies, total] = await queryBuilder.getManyAndCount();

      return {
        companies,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error('Failed to retrieve companies', error);
      throw error;
    }
  }

  /**
   * Get company by ID
   */
  async findOne(id: string): Promise<Company> {
    try {
      const company = await this.companyRepository.findOne({
        where: { id },
        relations: ['settings', 'branding', 'users'],
      });

      if (!company) {
        throw new NotFoundException(`Company with ID ${id} not found`);
      }

      return company;
    } catch (error) {
      this.logger.error('Failed to retrieve company', { companyId: id, error: error.message });
      throw error;
    }
  }

  /**
   * Get company by name
   */
  async findByName(name: string): Promise<Company | null> {
    try {
      return await this.companyRepository.findOne({
        where: { name },
        relations: ['settings', 'branding'],
      });
    } catch (error) {
      this.logger.error('Failed to retrieve company by name', { name, error: error.message });
      throw error;
    }
  }

  /**
   * Update company
   */
  async updateCompany(id: string, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    try {
      const company = await this.findOne(id);

      // Check if name is being changed and if it conflicts with existing companies
      if (updateCompanyDto.name && updateCompanyDto.name !== company.name) {
        const existingCompany = await this.companyRepository.findOne({
          where: { name: updateCompanyDto.name },
        });

        if (existingCompany) {
          throw new BadRequestException('Company with this name already exists');
        }
      }

      // Update company
      Object.assign(company, updateCompanyDto);
      company.updatedAt = new Date();

      const updatedCompany = await this.companyRepository.save(company);

      this.logger.log('Company updated successfully', { 
        companyId: id, 
        name: updatedCompany.name 
      });

      return updatedCompany;
    } catch (error) {
      this.logger.error('Failed to update company', { companyId: id, error: error.message });
      throw error;
    }
  }

  /**
   * Delete company
   */
  async removeCompany(id: string): Promise<void> {
    try {
      const company = await this.findOne(id);

      // Check if company has active users
      if (company.users && company.users.length > 0) {
        throw new BadRequestException('Cannot delete company with active users');
      }

      // Delete related records first
      await this.companySettingsRepository.delete({ companyId: id });
      await this.companyBrandingRepository.delete({ companyId: id });

      // Delete company
      await this.companyRepository.remove(company);

      this.logger.log('Company deleted successfully', { companyId: id });
    } catch (error) {
      this.logger.error('Failed to delete company', { companyId: id, error: error.message });
      throw error;
    }
  }

  /**
   * Soft delete company (mark as inactive)
   */
  async deactivateCompany(id: string): Promise<Company> {
    try {
      const company = await this.findOne(id);
      company.status = 'inactive';
      company.updatedAt = new Date();

      const deactivatedCompany = await this.companyRepository.save(company);

      this.logger.log('Company deactivated successfully', { companyId: id });

      return deactivatedCompany;
    } catch (error) {
      this.logger.error('Failed to deactivate company', { companyId: id, error: error.message });
      throw error;
    }
  }

  /**
   * Reactivate company
   */
  async reactivateCompany(id: string): Promise<Company> {
    try {
      const company = await this.findOne(id);
      company.status = 'active';
      company.updatedAt = new Date();

      const reactivatedCompany = await this.companyRepository.save(company);

      this.logger.log('Company reactivated successfully', { companyId: id });

      return reactivatedCompany;
    } catch (error) {
      this.logger.error('Failed to reactivate company', { companyId: id, error: error.message });
      throw error;
    }
  }

  /**
   * Get company settings
   */
  async getCompanySettings(companyId: string): Promise<CompanySettings> {
    try {
      const settings = await this.companySettingsRepository.findOne({
        where: { companyId },
      });

      if (!settings) {
        throw new NotFoundException(`Company settings not found for company ${companyId}`);
      }

      return settings;
    } catch (error) {
      this.logger.error('Failed to retrieve company settings', { companyId, error: error.message });
      throw error;
    }
  }

  /**
   * Update company settings
   */
  async updateCompanySettings(companyId: string, settingsDto: CompanySettingsDto): Promise<CompanySettings> {
    try {
      let settings = await this.companySettingsRepository.findOne({
        where: { companyId },
      });

      if (!settings) {
        // Create settings if they don't exist
        settings = this.companySettingsRepository.create({
          companyId,
          ...settingsDto,
        })[0];
      } else {
        // Update existing settings
        Object.assign(settings, settingsDto);
        settings.updatedAt = new Date();
      }

      const updatedSettings = await this.companySettingsRepository.save(settings);

      this.logger.log('Company settings updated successfully', { companyId });

      return updatedSettings;
    } catch (error) {
      this.logger.error('Failed to update company settings', { companyId, error: error.message });
      throw error;
    }
  }

  /**
   * Get company branding
   */
  async getCompanyBranding(companyId: string): Promise<CompanyBranding> {
    try {
      const branding = await this.companyBrandingRepository.findOne({
        where: { companyId },
      });

      if (!branding) {
        throw new NotFoundException(`Company branding not found for company ${companyId}`);
      }

      return branding;
    } catch (error) {
      this.logger.error('Failed to retrieve company branding', { companyId, error: error.message });
      throw error;
    }
  }

  /**
   * Update company branding
   */
  async updateCompanyBranding(companyId: string, brandingDto: CompanyBrandingDto): Promise<CompanyBranding> {
    try {
      let branding = await this.companyBrandingRepository.findOne({
        where: { companyId },
      });

      if (!branding) {
        // Create branding if it doesn't exist
        branding = this.companyBrandingRepository.create({
          companyId,
          ...brandingDto,
        })[0];
      } else {
        // Update existing branding
        Object.assign(branding, brandingDto);
        branding.updatedAt = new Date();
      }

      const updatedBranding = await this.companyBrandingRepository.save(branding);

      this.logger.log('Company branding updated successfully', { companyId });

      return updatedBranding;
    } catch (error) {
      this.logger.error('Failed to update company branding', { companyId, error: error.message });
      throw error;
    }
  }

  /**
   * Upload company logo
   */
  async uploadCompanyLogo(companyId: string, logoUrl: string): Promise<CompanyBranding> {
    try {
      const branding = await this.getCompanyBranding(companyId);
      branding.logoUrl = logoUrl;
      branding.updatedAt = new Date();

      const updatedBranding = await this.companyBrandingRepository.save(branding);

      this.logger.log('Company logo uploaded successfully', { companyId, logoUrl });

      return updatedBranding;
    } catch (error) {
      this.logger.error('Failed to upload company logo', { companyId, error: error.message });
      throw error;
    }
  }

  /**
   * Upload company favicon
   */
  async uploadCompanyFavicon(companyId: string, faviconUrl: string): Promise<CompanyBranding> {
    try {
      const branding = await this.getCompanyBranding(companyId);
      branding.faviconUrl = faviconUrl;
      branding.updatedAt = new Date();

      const updatedBranding = await this.companyBrandingRepository.save(branding);

      this.logger.log('Company favicon uploaded successfully', { companyId, faviconUrl });

      return updatedBranding;
    } catch (error) {
      this.logger.error('Failed to upload company favicon', { companyId, error: error.message });
      throw error;
    }
  }

  /**
   * Get company statistics
   */
  async getCompanyStats(companyId: string): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalQuotations: number;
    activeQuotations: number;
    totalRevenue: number;
    monthlyGrowth: number;
  }> {
    try {
      const company = await this.findOne(companyId);
      
      // This would typically involve more complex queries
      // For now, return basic statistics
      const stats = {
        totalUsers: company.users?.length || 0,
        activeUsers: company.users?.filter(u => u.status === 'active').length || 0,
        totalQuotations: 0, // Would query quotations table
        activeQuotations: 0, // Would query quotations table
        totalRevenue: 0, // Would query invoices/payments table
        monthlyGrowth: 0, // Would calculate from historical data
      };

      return stats;
    } catch (error) {
      this.logger.error('Failed to get company statistics', { companyId, error: error.message });
      throw error;
    }
  }

  /**
   * Search companies
   */
  async searchCompanies(query: string): Promise<Company[]> {
    try {
      const companies = await this.companyRepository
        .createQueryBuilder('company')
        .leftJoinAndSelect('company.settings', 'settings')
        .leftJoinAndSelect('company.branding', 'branding')
        .where(
          'company.name ILIKE :query OR company.description ILIKE :query OR company.industry ILIKE :query',
          { query: `%${query}%` }
        )
        .andWhere('company.status = :status', { status: 'active' })
        .orderBy('company.name', 'ASC')
        .limit(20)
        .getMany();

      return companies;
    } catch (error) {
      this.logger.error('Failed to search companies', { query, error: error.message });
      throw error;
    }
  }

  /**
   * Get companies by industry
   */
  async getCompaniesByIndustry(industry: string): Promise<Company[]> {
    try {
      const companies = await this.companyRepository.find({
        where: { industry, status: 'active' },
        relations: ['branding'],
        order: { name: 'ASC' },
      });

      return companies;
    } catch (error) {
      this.logger.error('Failed to get companies by industry', { industry, error: error.message });
      throw error;
    }
  }

  /**
   * Get companies by size
   */
  async getCompaniesBySize(size: string): Promise<Company[]> {
    try {
      const companies = await this.companyRepository.find({
        where: { size, status: 'active' },
        relations: ['branding'],
        order: { name: 'ASC' },
      });

      return companies;
    } catch (error) {
      this.logger.error('Failed to get companies by size', { size, error: error.message });
      throw error;
    }
  }
}
