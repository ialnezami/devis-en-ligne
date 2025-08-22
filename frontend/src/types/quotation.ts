// Quotation Management Types

export interface Quotation {
  id: string;
  quotationNumber: string;
  title: string;
  description?: string;
  client: {
    id: string;
    name: string;
    email: string;
    company?: string;
    phone?: string;
  };
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  totalAmount: number;
  currency: string;
  validUntil: Date;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  viewedAt?: Date;
  respondedAt?: Date;
  expiresAt: Date;
  items: QuotationItem[];
  terms?: string;
  notes?: string;
  attachments: QuotationAttachment[];
  tags: string[];
  assignedTo?: string; // User ID
  projectId?: string;
  phaseId?: string;
  customFields: Record<string, any>;
}

export interface QuotationItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount?: number;
  tax?: number;
  total: number;
  category?: string;
  sku?: string;
}

export interface QuotationAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface QuotationFilter {
  status?: Quotation['status'][];
  priority?: Quotation['priority'][];
  clientId?: string;
  assignedTo?: string;
  projectId?: string;
  phaseId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
  search?: string;
}

export interface QuotationSort {
  field: 'quotationNumber' | 'title' | 'client.name' | 'status' | 'priority' | 'totalAmount' | 'createdAt' | 'validUntil' | 'expiresAt';
  direction: 'asc' | 'desc';
}

export interface QuotationBulkAction {
  action: 'updateStatus' | 'assignTo' | 'addTags' | 'removeTags' | 'export' | 'delete';
  quotationIds: string[];
  data?: Record<string, any>;
}

export interface QuotationPreview {
  quotation: Quotation;
  clientInfo: {
    name: string;
    company?: string;
    address?: string;
    phone?: string;
    email: string;
  };
  companyInfo: {
    name: string;
    logo?: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
  };
  summary: {
    subtotal: number;
    totalDiscount: number;
    totalTax: number;
    totalAmount: number;
    itemCount: number;
  };
}

export interface QuotationTemplate {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  header: {
    logo?: string;
    companyName: string;
    companyAddress: string;
    companyPhone: string;
    companyEmail: string;
    companyWebsite?: string;
  };
  footer: {
    terms?: string;
    notes?: string;
    signature?: string;
  };
  styling: {
    primaryColor: string;
    fontFamily: string;
    fontSize: string;
    lineHeight: string;
  };
  sections: QuotationTemplateSection[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface QuotationTemplateSection {
  id: string;
  name: string;
  type: 'header' | 'client-info' | 'items' | 'summary' | 'terms' | 'footer';
  content: string;
  order: number;
  isRequired: boolean;
  isVisible: boolean;
}

export interface QuotationAnalytics {
  totalQuotations: number;
  totalValue: number;
  averageValue: number;
  conversionRate: number;
  statusDistribution: {
    status: Quotation['status'];
    count: number;
    percentage: number;
    value: number;
  }[];
  monthlyTrends: {
    month: string;
    count: number;
    value: number;
  }[];
  topClients: {
    clientId: string;
    clientName: string;
    quotationCount: number;
    totalValue: number;
  }[];
  performanceMetrics: {
    averageResponseTime: number;
    averageValidUntil: number;
    overdueQuotations: number;
  };
}

export interface QuotationExport {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  filters: QuotationFilter;
  sort: QuotationSort;
  includeAttachments: boolean;
  includeCustomFields: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface QuotationNotification {
  id: string;
  type: 'quotation-sent' | 'quotation-viewed' | 'quotation-responded' | 'quotation-expiring' | 'quotation-overdue';
  quotationId: string;
  quotationNumber: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  createdAt: Date;
  scheduledFor?: Date;
  sent: boolean;
  sentAt?: Date;
}

// Export all types
export type {
  Quotation,
  QuotationItem,
  QuotationAttachment,
  QuotationFilter,
  QuotationSort,
  QuotationBulkAction,
  QuotationPreview,
  QuotationTemplate,
  QuotationTemplateSection,
  QuotationAnalytics,
  QuotationExport,
  QuotationNotification,
};
