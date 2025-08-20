// Common types used throughout the application

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  VIEWER = 'viewer',
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  address: Address;
  contact: Contact;
  settings: CompanySettings;
  branding: CompanyBranding;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Contact {
  email: string;
  phone?: string;
  website?: string;
}

export interface CompanySettings {
  currency: string;
  timezone: string;
  language: string;
  dateFormat: string;
  numberFormat: string;
}

export interface CompanyBranding {
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  customCSS?: string;
}

export interface Quotation {
  id: string;
  number: string;
  title: string;
  description?: string;
  clientId: string;
  client: Client;
  items: QuotationItem[];
  status: QuotationStatus;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  validUntil: string;
  paymentTerms: string;
  notes?: string;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
}

export enum QuotationStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export interface QuotationItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
  total: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  address?: Address;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  details?: ValidationError[];
  timestamp: string;
  path: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface FilterOptions {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  category?: string;
  tags?: string[];
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeMetadata?: boolean;
  filename?: string;
}

// Theme and UI types
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

// Notification types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

// File types
export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  category: string;
  metadata?: Record<string, any>;
  uploadedBy: string;
  createdAt: string;
}

// Chart and analytics types
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalQuotations: number;
    conversionRate: number;
    averageResponseTime: number;
  };
  trends: ChartData;
  performance: ChartData;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

// API configuration types
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

// WebSocket types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface WebSocketConfig {
  url: string;
  options: {
    autoConnect: boolean;
    reconnection: boolean;
    reconnectionAttempts: number;
    reconnectionDelay: number;
  };
}
