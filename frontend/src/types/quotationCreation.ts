// Quotation Creation & Editing Types

export interface QuotationCreationForm {
  id: string;
  step: number;
  totalSteps: number;
  isComplete: boolean;
  data: QuotationFormData;
  validation: QuotationValidation;
  errors: QuotationValidationError[];
  isDraft: boolean;
  lastSaved: Date;
  version: number;
}

export interface QuotationFormData {
  // Basic Information
  quotationNumber: string;
  title: string;
  description?: string;
  reference?: string;
  projectType: 'service' | 'product' | 'consulting' | 'maintenance' | 'custom';
  
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
    taxId?: string;
    website?: string;
  };
  
  // Quotation Details
  issueDate: Date;
  validUntil: Date;
  currency: string;
  language: string;
  exchangeRate?: number;
  
  // Items and Services
  items: QuotationItem[];
  services: QuotationService[];
  
  // Pricing
  subtotal: number;
  discount: {
    type: 'percentage' | 'fixed' | 'tiered';
    value: number;
    description?: string;
  };
  tax: {
    rate: number;
    amount: number;
    isInclusive: boolean;
    breakdown: TaxBreakdown[];
  };
  shipping?: {
    method: string;
    cost: number;
    description?: string;
  };
  total: number;
  
  // Terms and Conditions
  terms: string;
  notes?: string;
  specialConditions?: string[];
  
  // Timeline and Delivery
  timeline: {
    startDate?: Date;
    estimatedDuration: number;
    durationUnit: 'days' | 'weeks' | 'months';
    milestones: Milestone[];
  };
  
  // Payment Terms
  paymentTerms: {
    netDays: number;
    earlyPaymentDiscount?: {
      percentage: number;
      days: number;
    };
    latePaymentPenalty?: {
      percentage: number;
      days: number;
    };
    depositRequired: boolean;
    depositPercentage?: number;
    installmentPlan?: InstallmentPlan[];
  };
  
  // Attachments and Documents
  attachments: QuotationAttachment[];
  relatedDocuments: RelatedDocument[];
  
  // Approval and Status
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'expired' | 'accepted';
  approvalWorkflow: ApprovalStep[];
  currentApprover?: string;
  
  // Metadata
  tags: string[];
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: 'manual' | 'lead' | 'opportunity' | 'referral';
  
  // Settings
  autoCalculate: boolean;
  includeTax: boolean;
  sendEmail: boolean;
  trackViews: boolean;
  allowComments: boolean;
  
  // History
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
  versionHistory: VersionHistory[];
}

export interface QuotationItem {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  category: string;
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
  isCustom: boolean;
  supplier?: string;
  availability: 'in-stock' | 'out-of-stock' | 'backorder' | 'custom';
  leadTime?: number;
  leadTimeUnit?: 'days' | 'weeks';
  minimumOrder?: number;
  maximumOrder?: number;
}

export interface QuotationService {
  id: string;
  name: string;
  description?: string;
  category: string;
  type: 'hourly' | 'fixed' | 'percentage' | 'tiered';
  rate: number;
  quantity: number;
  unit: string;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  tax?: {
    rate: number;
    amount: number;
  };
  total: number;
  estimatedHours?: number;
  complexity: 'simple' | 'medium' | 'complex' | 'expert';
  dependencies?: string[];
  deliverables: string[];
}

export interface TaxBreakdown {
  type: string;
  rate: number;
  amount: number;
  description?: string;
}

export interface Milestone {
  id: string;
  name: string;
  description?: string;
  dueDate: Date;
  deliverable: string;
  paymentPercentage?: number;
  isCompleted: boolean;
  dependencies?: string[];
}

export interface InstallmentPlan {
  id: string;
  installment: number;
  dueDate: Date;
  amount: number;
  percentage: number;
  description?: string;
  isPaid: boolean;
}

export interface QuotationAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'spreadsheet' | 'presentation' | 'other';
  url: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
  description?: string;
  isPublic: boolean;
}

export interface RelatedDocument {
  id: string;
  type: 'contract' | 'proposal' | 'invoice' | 'purchase-order' | 'other';
  name: string;
  url: string;
  reference: string;
  status: string;
  lastModified: Date;
}

export interface ApprovalStep {
  id: string;
  step: number;
  approver: string;
  approverRole: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  comments?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  isRequired: boolean;
}

export interface VersionHistory {
  version: number;
  changes: string[];
  changedBy: string;
  changedAt: Date;
  comments?: string;
}

export interface QuotationValidation {
  isValid: boolean;
  errors: QuotationValidationError[];
  warnings: QuotationValidationWarning[];
  suggestions: QuotationValidationSuggestion[];
}

export interface QuotationValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  step: number;
  code: string;
  suggestion?: string;
}

export interface QuotationValidationWarning {
  field: string;
  message: string;
  impact: 'low' | 'medium' | 'high';
  step: number;
  recommendation: string;
}

export interface QuotationValidationSuggestion {
  field: string;
  message: string;
  benefit: string;
  implementation: string;
  priority: 'low' | 'medium' | 'high';
}

export interface QuotationEditor {
  id: string;
  quotationId: string;
  mode: 'create' | 'edit' | 'duplicate' | 'template';
  isDirty: boolean;
  hasUnsavedChanges: boolean;
  autoSaveInterval: number;
  lastAutoSave: Date;
  collaboration: {
    isCollaborative: boolean;
    collaborators: Collaborator[];
    comments: Comment[];
    changes: Change[];
  };
  history: {
    undoStack: UndoAction[];
    redoStack: RedoAction[];
    canUndo: boolean;
    canRedo: boolean;
  };
}

export interface Collaborator {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'viewer' | 'editor' | 'approver' | 'admin';
  joinedAt: Date;
  lastActive: Date;
  permissions: Permission[];
}

export interface Permission {
  action: string;
  resource: string;
  isAllowed: boolean;
  conditions?: any;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  replies: Comment[];
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  mentions: string[];
}

export interface Change {
  id: string;
  userId: string;
  userName: string;
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
  description: string;
  type: 'add' | 'edit' | 'delete' | 'move';
}

export interface UndoAction {
  id: string;
  action: string;
  data: any;
  timestamp: Date;
}

export interface RedoAction {
  id: string;
  action: string;
  data: any;
  timestamp: Date;
}

export interface QuotationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  industry: string;
  isDefault: boolean;
  isPublic: boolean;
  isActive: boolean;
  
  // Template Structure
  sections: QuotationSection[];
  fields: QuotationField[];
  
  // Default Values
  defaults: {
    currency: string;
    language: string;
    validUntil: number;
    terms: string;
    notes: string;
    includeTax: boolean;
    taxRate: number;
    paymentTerms: string;
    projectTypes: string[];
  };
  
  // Styling
  styling: {
    layout: 'modern' | 'classic' | 'minimal' | 'creative' | 'professional';
    theme: 'light' | 'dark' | 'auto';
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
  };
  
  // Usage
  usageCount: number;
  rating: number;
  reviews: QuotationTemplateReview[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface QuotationSection {
  id: string;
  name: string;
  type: 'header' | 'client-info' | 'project-details' | 'items' | 'services' | 'pricing' | 'timeline' | 'terms' | 'footer';
  content: string;
  order: number;
  isRequired: boolean;
  isVisible: boolean;
  isEditable: boolean;
  isCollapsible: boolean;
  isCollapsed: boolean;
  fields: string[];
  styling: SectionStyling;
}

export interface QuotationField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'phone' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file' | 'currency' | 'percentage';
  value?: any;
  options?: FieldOption[];
  validation: FieldValidation[];
  isRequired: boolean;
  isVisible: boolean;
  order: number;
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  dependsOn?: string;
  showCondition?: string;
}

export interface FieldOption {
  value: string;
  label: string;
  isDefault?: boolean;
  isDisabled?: boolean;
}

export interface FieldValidation {
  type: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'url' | 'phone' | 'currency' | 'percentage';
  value?: any;
  message: string;
  severity: 'error' | 'warning';
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
  display?: 'block' | 'inline' | 'flex' | 'grid';
}

export interface QuotationTemplateReview {
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
  QuotationCreationForm,
  QuotationFormData,
  QuotationItem,
  QuotationService,
  TaxBreakdown,
  Milestone,
  InstallmentPlan,
  QuotationAttachment,
  RelatedDocument,
  ApprovalStep,
  VersionHistory,
  QuotationValidation,
  QuotationValidationError,
  QuotationValidationWarning,
  QuotationValidationSuggestion,
  QuotationEditor,
  Collaborator,
  Permission,
  Comment,
  Change,
  UndoAction,
  RedoAction,
  QuotationTemplate,
  QuotationSection,
  QuotationField,
  FieldOption,
  FieldValidation,
  SectionStyling,
  QuotationTemplateReview,
};
