// Customizable Estimates Types

export interface CompanyBranding {
  id: string;
  companyName: string;
  logo: {
    url: string;
    altText: string;
    size: 'small' | 'medium' | 'large';
    position: 'left' | 'center' | 'right';
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
    accent: string;
  };
  contactInfo: {
    address: string;
    phone: string;
    email: string;
    website: string;
    socialMedia: {
      linkedin?: string;
      twitter?: string;
      facebook?: string;
      instagram?: string;
    };
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EstimateTemplate {
  id: string;
  name: string;
  description: string;
  category: EstimateCategory;
  industry: string;
  isDefault: boolean;
  isPublic: boolean;
  isActive: boolean;
  
  // Template Structure
  sections: EstimateSection[];
  
  // Styling
  styling: EstimateStyling;
  
  // Default Content
  defaults: {
    terms: string;
    notes: string;
    validUntil: number; // days
    currency: string;
    language: string;
    includeTax: boolean;
    taxRate: number;
    paymentTerms: string;
  };
  
  // Pricing Configuration
  pricing: PricingConfiguration;
  
  // Branding
  branding: CompanyBranding;
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  usageCount: number;
  rating: number;
  reviews: EstimateTemplateReview[];
}

export interface EstimateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  industry: string;
  subcategories: EstimateSubcategory[];
  templates: EstimateTemplate[];
}

export interface EstimateSubcategory {
  id: string;
  name: string;
  description: string;
  parentCategory: string;
  templates: EstimateTemplate[];
}

export interface EstimateSection {
  id: string;
  name: string;
  type: 'header' | 'company-info' | 'client-info' | 'project-details' | 'services' | 'pricing' | 'timeline' | 'terms' | 'footer' | 'signature';
  content: string;
  order: number;
  isRequired: boolean;
  isVisible: boolean;
  isEditable: boolean;
  isCollapsible: boolean;
  isCollapsed: boolean;
  styling: SectionStyling;
}

export interface EstimateStyling {
  layout: 'modern' | 'classic' | 'minimal' | 'creative' | 'professional';
  theme: 'light' | 'dark' | 'auto';
  spacing: 'compact' | 'comfortable' | 'spacious';
  borders: 'none' | 'subtle' | 'prominent';
  shadows: 'none' | 'subtle' | 'prominent';
  animations: boolean;
  customCSS?: string;
}

export interface SectionStyling {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderRadius?: string;
  padding?: string;
  margin?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}

export interface PricingConfiguration {
  currency: string;
  decimalPlaces: number;
  showTax: boolean;
  taxRate: number;
  taxLabel: string;
  showDiscount: boolean;
  discountTypes: DiscountType[];
  showSubtotal: boolean;
  showTotal: boolean;
  rounding: 'none' | 'nearest' | 'up' | 'down';
  minimumAmount: number;
  maximumAmount: number;
}

export interface DiscountType {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'tiered';
  value: number;
  description: string;
  isActive: boolean;
  conditions: DiscountCondition[];
}

export interface DiscountCondition {
  field: 'amount' | 'quantity' | 'category' | 'client' | 'date';
  operator: 'equals' | 'greater-than' | 'less-than' | 'contains' | 'between';
  value: any;
  secondValue?: any; // for 'between' operator
}

export interface PaymentTerms {
  id: string;
  name: string;
  description: string;
  netDays: number;
  earlyPaymentDiscount?: {
    percentage: number;
    days: number;
  };
  latePaymentPenalty?: {
    percentage: number;
    days: number;
  };
  isDefault: boolean;
  isActive: boolean;
}

export interface IndustryTemplate {
  id: string;
  industry: string;
  name: string;
  description: string;
  category: EstimateCategory;
  templates: EstimateTemplate[];
  commonServices: CommonService[];
  pricingModels: PricingModel[];
  bestPractices: string[];
  compliance: ComplianceRequirement[];
}

export interface CommonService {
  id: string;
  name: string;
  description: string;
  category: string;
  typicalPricing: {
    min: number;
    max: number;
    unit: string;
    currency: string;
  };
  isPopular: boolean;
  tags: string[];
}

export interface PricingModel {
  id: string;
  name: string;
  description: string;
  type: 'hourly' | 'fixed' | 'percentage' | 'tiered' | 'subscription';
  structure: any;
  advantages: string[];
  disadvantages: string[];
  bestFor: string[];
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  type: 'legal' | 'industry' | 'certification' | 'safety';
  requirements: string[];
  documentation: string[];
  isRequired: boolean;
}

export interface EstimatePersonalization {
  id: string;
  userId: string;
  companyId: string;
  
  // Personal Preferences
  preferences: {
    defaultTemplate: string;
    defaultCurrency: string;
    defaultLanguage: string;
    defaultPaymentTerms: string;
    autoSave: boolean;
    emailNotifications: boolean;
    defaultTaxRate: number;
  };
  
  // Custom Fields
  customFields: CustomField[];
  
  // Saved Items
  savedItems: SavedItem[];
  
  // Recent Estimates
  recentEstimates: RecentEstimate[];
  
  // Favorites
  favoriteTemplates: string[];
  favoriteServices: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'phone' | 'date' | 'select' | 'textarea' | 'checkbox';
  value?: any;
  options?: string[]; // for select type
  isRequired: boolean;
  isVisible: boolean;
  order: number;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'url';
  value?: any;
  message: string;
}

export interface SavedItem {
  id: string;
  name: string;
  type: 'service' | 'product' | 'package' | 'custom';
  description?: string;
  price: number;
  unit: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  usageCount: number;
  lastUsed: Date;
  createdAt: Date;
}

export interface RecentEstimate {
  id: string;
  estimateNumber: string;
  title: string;
  clientName: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected';
  lastModified: Date;
  template: string;
}

export interface BrandConsistency {
  id: string;
  companyId: string;
  
  // Brand Guidelines
  guidelines: {
    logoUsage: LogoUsageGuideline[];
    colorUsage: ColorUsageGuideline[];
    typography: TypographyGuideline[];
    spacing: SpacingGuideline[];
    imagery: ImageryGuideline[];
  };
  
  // Templates
  templates: EstimateTemplate[];
  
  // Validation Rules
  validationRules: BrandValidationRule[];
  
  // Compliance
  compliance: {
    industryStandards: string[];
    legalRequirements: string[];
    accessibility: AccessibilityRequirement[];
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface LogoUsageGuideline {
  id: string;
  rule: string;
  description: string;
  examples: string[];
  restrictions: string[];
  isRequired: boolean;
}

export interface ColorUsageGuideline {
  id: string;
  color: string;
  usage: string;
  restrictions: string[];
  alternatives: string[];
}

export interface TypographyGuideline {
  id: string;
  element: string;
  font: string;
  size: string;
  weight: string;
  color: string;
  spacing: string;
}

export interface SpacingGuideline {
  id: string;
  element: string;
  margin: string;
  padding: string;
  spacing: string;
}

export interface ImageryGuideline {
  id: string;
  type: string;
  style: string;
  quality: string;
  restrictions: string[];
  sources: string[];
}

export interface BrandValidationRule {
  id: string;
  field: string;
  rule: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  isActive: boolean;
}

export interface AccessibilityRequirement {
  id: string;
  requirement: string;
  description: string;
  level: 'A' | 'AA' | 'AAA';
  implementation: string[];
  testing: string[];
}

export interface EstimateTemplateReview {
  id: string;
  templateId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  pros: string[];
  cons: string[];
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Export all types
export type {
  CompanyBranding,
  EstimateTemplate,
  EstimateCategory,
  EstimateSubcategory,
  EstimateSection,
  EstimateStyling,
  SectionStyling,
  PricingConfiguration,
  DiscountType,
  DiscountCondition,
  PaymentTerms,
  IndustryTemplate,
  CommonService,
  PricingModel,
  ComplianceRequirement,
  EstimatePersonalization,
  CustomField,
  ValidationRule,
  SavedItem,
  RecentEstimate,
  BrandConsistency,
  LogoUsageGuideline,
  ColorUsageGuideline,
  TypographyGuideline,
  SpacingGuideline,
  ImageryGuideline,
  BrandValidationRule,
  AccessibilityRequirement,
  EstimateTemplateReview,
};
