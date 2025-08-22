// Quotation Creation & Editing Types

export interface QuotationForm {
  id: string;
  mode: 'create' | 'edit' | 'duplicate' | 'template';
  isDirty: boolean;
  hasUnsavedChanges: boolean;
  lastSaved: Date;
  autoSaveInterval: number;
  version: number;
  
  // Form Data
  data: QuotationData;
  
  // Validation
  validation: QuotationValidation;
  errors: QuotationValidationError[];
  warnings: QuotationValidationWarning[];
  
  // State
  status: 'draft' | 'saving' | 'saved' | 'error';
  saveError?: string;
}

export interface QuotationData {
  // Basic Information
  quotationNumber: string;
  title: string;
  description?: string;
  reference?: string;
  projectType: 'service' | 'product' | 'consulting' | 'maintenance' | 'custom';
  
  // Client Information
  client: QuotationClient;
  
  // Quotation Details
  issueDate: Date;
  validUntil: Date;
  currency: string;
  language: string;
  exchangeRate?: number;
  
  // Items and Services
  items: QuotationFormItem[];
  services: QuotationFormService[];
  
  // Pricing
  subtotal: number;
  discount: QuotationDiscount;
  tax: QuotationTax;
  shipping?: QuotationShipping;
  total: number;
  
  // Terms and Conditions
  terms: string;
  notes?: string;
  specialConditions: string[];
  
  // Timeline and Delivery
  timeline: QuotationTimeline;
  
  // Payment Terms
  paymentTerms: QuotationPaymentTerms;
  
  // Attachments and Documents
  attachments: QuotationAttachment[];
  relatedDocuments: QuotationRelatedDocument[];
  
  // Approval and Status
  approvalWorkflow: QuotationApprovalStep[];
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
  versionHistory: QuotationVersionHistory[];
}

export interface QuotationClient {
  id?: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  address: QuotationAddress;
  taxId?: string;
  website?: string;
  contactPerson?: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
}

export interface QuotationAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isShippingAddress: boolean;
  isBillingAddress: boolean;
}

export interface QuotationFormItem {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount?: QuotationItemDiscount;
  tax?: QuotationItemTax;
  total: number;
  isCustom: boolean;
  supplier?: string;
  availability: 'in-stock' | 'out-of-stock' | 'backorder' | 'custom';
  leadTime?: number;
  leadTimeUnit?: 'days' | 'weeks';
  minimumOrder?: number;
  maximumOrder?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
}

export interface QuotationFormService {
  id: string;
  name: string;
  description?: string;
  category: string;
  type: 'hourly' | 'fixed' | 'percentage' | 'tiered';
  rate: number;
  quantity: number;
  unit: string;
  discount?: QuotationItemDiscount;
  tax?: QuotationItemTax;
  total: number;
  estimatedHours?: number;
  complexity: 'simple' | 'medium' | 'complex' | 'expert';
  dependencies?: string[];
  deliverables: string[];
  prerequisites?: string[];
  exclusions?: string[];
}

export interface QuotationItemDiscount {
  type: 'percentage' | 'fixed';
  value: number;
  reason?: string;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface QuotationItemTax {
  rate: number;
  amount: number;
  type: string;
  isInclusive: boolean;
  description?: string;
}

export interface QuotationDiscount {
  type: 'percentage' | 'fixed' | 'tiered';
  value: number;
  description?: string;
  conditions?: QuotationDiscountCondition[];
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  maxAmount?: number;
}

export interface QuotationDiscountCondition {
  field: 'amount' | 'quantity' | 'category' | 'client' | 'date' | 'payment';
  operator: 'equals' | 'greater-than' | 'less-than' | 'contains' | 'between' | 'in';
  value: any;
  secondValue?: any;
  description: string;
}

export interface QuotationTax {
  rate: number;
  amount: number;
  isInclusive: boolean;
  breakdown: QuotationTaxBreakdown[];
  isCompound: boolean;
  exemptions?: string[];
}

export interface QuotationTaxBreakdown {
  type: string;
  rate: number;
  amount: number;
  description?: string;
  isExempt: boolean;
  exemptionReason?: string;
}

export interface QuotationShipping {
  method: string;
  cost: number;
  description?: string;
  estimatedDays: number;
  trackingNumber?: string;
  insurance?: {
    included: boolean;
    amount: number;
    cost: number;
  };
  restrictions?: string[];
}

export interface QuotationTimeline {
  startDate?: Date;
  estimatedDuration: number;
  durationUnit: 'days' | 'weeks' | 'months';
  milestones: QuotationMilestone[];
  dependencies: QuotationDependency[];
  constraints: QuotationConstraint[];
  isFlexible: boolean;
  bufferDays: number;
}

export interface QuotationMilestone {
  id: string;
  name: string;
  description?: string;
  dueDate: Date;
  deliverable: string;
  paymentPercentage?: number;
  isCompleted: boolean;
  dependencies?: string[];
  assignee?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  actualCompletionDate?: Date;
  notes?: string;
}

export interface QuotationDependency {
  id: string;
  type: 'internal' | 'external' | 'client' | 'supplier';
  description: string;
  isCritical: boolean;
  estimatedDuration: number;
  responsibleParty: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
}

export interface QuotationConstraint {
  id: string;
  type: 'resource' | 'time' | 'budget' | 'technical' | 'regulatory';
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  mitigation?: string;
  isResolved: boolean;
}

export interface QuotationPaymentTerms {
  netDays: number;
  earlyPaymentDiscount?: QuotationEarlyPaymentDiscount;
  latePaymentPenalty?: QuotationLatePaymentPenalty;
  depositRequired: boolean;
  depositPercentage?: number;
  installmentPlan?: QuotationInstallmentPlan[];
  acceptedPaymentMethods: string[];
  currency: string;
  exchangeRate?: number;
  isFixedRate: boolean;
}

export interface QuotationEarlyPaymentDiscount {
  percentage: number;
  days: number;
  description?: string;
  isAutomatic: boolean;
}

export interface QuotationLatePaymentPenalty {
  percentage: number;
  days: number;
  description?: string;
  isCompound: boolean;
  maxPenalty?: number;
}

export interface QuotationInstallmentPlan {
  id: string;
  installment: number;
  dueDate: Date;
  amount: number;
  percentage: number;
  description?: string;
  isPaid: boolean;
  paymentDate?: Date;
  paymentMethod?: string;
  reference?: string;
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
  tags: string[];
  version: number;
  isLatest: boolean;
}

export interface QuotationRelatedDocument {
  id: string;
  type: 'contract' | 'proposal' | 'invoice' | 'purchase-order' | 'other';
  name: string;
  url: string;
  reference: string;
  status: string;
  lastModified: Date;
  relationship: 'parent' | 'child' | 'related' | 'replaces' | 'replaced-by';
}

export interface QuotationApprovalStep {
  id: string;
  step: number;
  approver: string;
  approverRole: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped' | 'delegated';
  comments?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  delegatedTo?: string;
  isRequired: boolean;
  canDelegate: boolean;
  deadline?: Date;
  reminders: QuotationApprovalReminder[];
}

export interface QuotationApprovalReminder {
  id: string;
  sentAt: Date;
  sentTo: string;
  type: 'email' | 'notification' | 'sms';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  response?: string;
}

export interface QuotationVersionHistory {
  version: number;
  changes: QuotationChange[];
  changedBy: string;
  changedAt: Date;
  comments?: string;
  isMajorVersion: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
}

export interface QuotationChange {
  id: string;
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
  description: string;
  type: 'add' | 'edit' | 'delete' | 'move' | 'reorder';
  impact: 'low' | 'medium' | 'high';
  requiresApproval: boolean;
}

export interface QuotationValidation {
  isValid: boolean;
  errors: QuotationValidationError[];
  warnings: QuotationValidationWarning[];
  suggestions: QuotationValidationSuggestion[];
  lastValidated: Date;
  validationRules: QuotationValidationRule[];
}

export interface QuotationValidationError {
  id: string;
  field: string;
  message: string;
  severity: 'error' | 'critical';
  step: number;
  code: string;
  suggestion?: string;
  helpUrl?: string;
  isBlocking: boolean;
}

export interface QuotationValidationWarning {
  id: string;
  field: string;
  message: string;
  impact: 'low' | 'medium' | 'high';
  step: number;
  recommendation: string;
  isActionable: boolean;
  actionUrl?: string;
}

export interface QuotationValidationSuggestion {
  id: string;
  field: string;
  message: string;
  benefit: string;
  implementation: string;
  priority: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  estimatedTime?: number;
}

export interface QuotationValidationRule {
  id: string;
  name: string;
  description: string;
  field: string;
  rule: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'url' | 'phone' | 'currency' | 'percentage' | 'date' | 'custom';
  value?: any;
  message: string;
  severity: 'error' | 'warning' | 'info';
  step: number;
  isActive: boolean;
  conditions?: QuotationValidationCondition[];
  customFunction?: string;
}

export interface QuotationValidationCondition {
  field: string;
  operator: 'equals' | 'not-equals' | 'greater-than' | 'less-than' | 'contains' | 'not-contains' | 'in' | 'not-in';
  value: any;
  secondValue?: any;
  logicalOperator?: 'and' | 'or';
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
  sections: QuotationTemplateSection[];
  fields: QuotationTemplateField[];
  
  // Default Values
  defaults: QuotationTemplateDefaults;
  
  // Styling
  styling: QuotationTemplateStyling;
  
  // Usage
  usageCount: number;
  rating: number;
  reviews: QuotationTemplateReview[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface QuotationTemplateSection {
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
  styling: QuotationSectionStyling;
}

export interface QuotationTemplateField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'phone' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file' | 'currency' | 'percentage';
  value?: any;
  options?: QuotationFieldOption[];
  validation: QuotationFieldValidation[];
  isRequired: boolean;
  isVisible: boolean;
  order: number;
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  dependsOn?: string;
  showCondition?: string;
  isCalculated: boolean;
  calculationFormula?: string;
}

export interface QuotationFieldOption {
  value: string;
  label: string;
  isDefault?: boolean;
  isDisabled?: boolean;
  description?: string;
  icon?: string;
}

export interface QuotationFieldValidation {
  type: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'url' | 'phone' | 'currency' | 'percentage' | 'date' | 'custom';
  value?: any;
  message: string;
  severity: 'error' | 'warning';
  customFunction?: string;
}

export interface QuotationSectionStyling {
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
  customCSS?: string;
}

export interface QuotationTemplateDefaults {
  currency: string;
  language: string;
  validUntil: number;
  terms: string;
  notes: string;
  includeTax: boolean;
  taxRate: number;
  paymentTerms: string;
  projectTypes: string[];
  defaultItems: QuotationTemplateDefaultItem[];
  defaultServices: QuotationTemplateDefaultService[];
}

export interface QuotationTemplateDefaultItem {
  name: string;
  description?: string;
  category: string;
  unitPrice: number;
  unit: string;
  isOptional: boolean;
}

export interface QuotationTemplateDefaultService {
  name: string;
  description?: string;
  category: string;
  rate: number;
  type: 'hourly' | 'fixed';
  unit: string;
  isOptional: boolean;
}

export interface QuotationTemplateStyling {
  layout: 'modern' | 'classic' | 'minimal' | 'creative' | 'professional';
  theme: 'light' | 'dark' | 'auto';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
  };
  fonts: {
    heading: string;
    body: string;
    accent: string;
  };
  spacing: 'compact' | 'comfortable' | 'spacious';
  borders: 'none' | 'subtle' | 'prominent';
  shadows: 'none' | 'subtle' | 'prominent';
  animations: boolean;
  customCSS?: string;
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
  helpful: number;
  notHelpful: number;
}

// Export all types
export type {
  QuotationForm,
  QuotationData,
  QuotationClient,
  QuotationAddress,
  QuotationFormItem,
  QuotationFormService,
  QuotationItemDiscount,
  QuotationItemTax,
  QuotationDiscount,
  QuotationDiscountCondition,
  QuotationTax,
  QuotationTaxBreakdown,
  QuotationShipping,
  QuotationTimeline,
  QuotationMilestone,
  QuotationDependency,
  QuotationConstraint,
  QuotationPaymentTerms,
  QuotationEarlyPaymentDiscount,
  QuotationLatePaymentPenalty,
  QuotationInstallmentPlan,
  QuotationAttachment,
  QuotationRelatedDocument,
  QuotationApprovalStep,
  QuotationApprovalReminder,
  QuotationVersionHistory,
  QuotationChange,
  QuotationValidation,
  QuotationValidationError,
  QuotationValidationWarning,
  QuotationValidationSuggestion,
  QuotationValidationRule,
  QuotationValidationCondition,
  QuotationTemplate,
  QuotationTemplateSection,
  QuotationTemplateField,
  QuotationFieldOption,
  QuotationFieldValidation,
  QuotationSectionStyling,
  QuotationTemplateDefaults,
  QuotationTemplateDefaultItem,
  QuotationTemplateDefaultService,
  QuotationTemplateStyling,
  QuotationTemplateReview,
};
