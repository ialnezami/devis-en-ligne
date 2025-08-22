// Quick Quote Creation Types

export interface QuoteCreationForm {
  id: string;
  step: number;
  totalSteps: number;
  isComplete: boolean;
  data: QuoteFormData;
  validation: QuoteValidation;
  errors: QuoteValidationError[];
}

export interface QuoteFormData {
  // Basic Information
  title: string;
  description?: string;
  quotationNumber?: string;
  
  // Client Information
  client: {
    id?: string;
    name: string;
    email: string;
    company?: string;
    phone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  
  // Quote Details
  validUntil: Date;
  currency: string;
  language: string;
  
  // Items
  items: QuoteItem[];
  
  // Pricing
  subtotal: number;
  discount: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  tax: {
    rate: number;
    amount: number;
  };
  total: number;
  
  // Terms and Conditions
  terms?: string;
  notes?: string;
  
  // Template
  templateId?: string;
  
  // Settings
  autoCalculate: boolean;
  includeTax: boolean;
  sendEmail: boolean;
  saveAsDraft: boolean;
}

export interface QuoteItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  tax?: {
    rate: number;
    amount: number;
  };
  total: number;
  category?: string;
  sku?: string;
  isCustom: boolean;
}

export interface QuoteTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'service' | 'product' | 'consulting' | 'custom';
  isDefault: boolean;
  isPublic: boolean;
  
  // Template Structure
  sections: QuoteTemplateSection[];
  
  // Default Values
  defaults: {
    currency: string;
    language: string;
    validUntil: number; // days from creation
    terms: string;
    notes: string;
    includeTax: boolean;
    taxRate: number;
  };
  
  // Styling
  styling: {
    primaryColor: string;
    fontFamily: string;
    logo?: string;
    headerStyle: 'minimal' | 'professional' | 'creative';
  };
  
  // Items Template
  itemTemplates: QuoteItemTemplate[];
  
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface QuoteTemplateSection {
  id: string;
  name: string;
  type: 'header' | 'client-info' | 'items' | 'summary' | 'terms' | 'footer' | 'signature';
  content: string;
  order: number;
  isRequired: boolean;
  isVisible: boolean;
  isEditable: boolean;
}

export interface QuoteItemTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  unitPrice: number;
  unit: string;
  isDefault: boolean;
  tags: string[];
}

export interface QuoteValidation {
  isValid: boolean;
  errors: QuoteValidationError[];
  warnings: QuoteValidationWarning[];
}

export interface QuoteValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  step: number;
}

export interface QuoteValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

export interface QuoteCreationWizard {
  id: string;
  currentStep: number;
  steps: WizardStep[];
  isComplete: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  progress: number;
}

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  isRequired: boolean;
  isComplete: boolean;
  hasErrors: boolean;
  validation: string[];
}

export interface SmartFormAutoCompletion {
  field: string;
  suggestions: AutoCompletionSuggestion[];
  lastUsed: Date;
  frequency: number;
}

export interface AutoCompletionSuggestion {
  value: string;
  label: string;
  category: string;
  confidence: number;
  lastUsed: Date;
  frequency: number;
}

export interface BulkQuoteOperation {
  id: string;
  type: 'create' | 'update' | 'duplicate' | 'delete';
  templateId: string;
  items: BulkQuoteItem[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  results: BulkQuoteResult[];
  createdAt: Date;
  completedAt?: Date;
}

export interface BulkQuoteItem {
  id: string;
  clientName: string;
  clientEmail: string;
  company?: string;
  title: string;
  description?: string;
  amount: number;
  status: 'pending' | 'success' | 'error';
  errorMessage?: string;
}

export interface BulkQuoteResult {
  quotationId: string;
  quotationNumber: string;
  status: 'success' | 'error';
  message: string;
  url?: string;
}

export interface QuotePreview {
  quotation: QuoteFormData;
  renderedHtml: string;
  pdfUrl?: string;
  isGenerating: boolean;
  lastGenerated: Date;
}

export interface QuoteValidationRule {
  field: string;
  rule: 'required' | 'email' | 'minLength' | 'maxLength' | 'minValue' | 'maxValue' | 'pattern' | 'custom';
  value?: any;
  message: string;
  step: number;
}

// Export all types
export type {
  QuoteCreationForm,
  QuoteFormData,
  QuoteItem,
  QuoteTemplate,
  QuoteTemplateSection,
  QuoteItemTemplate,
  QuoteValidation,
  QuoteValidationError,
  QuoteValidationWarning,
  QuoteCreationWizard,
  WizardStep,
  SmartFormAutoCompletion,
  AutoCompletionSuggestion,
  BulkQuoteOperation,
  BulkQuoteItem,
  BulkQuoteResult,
  QuotePreview,
  QuoteValidationRule,
};
