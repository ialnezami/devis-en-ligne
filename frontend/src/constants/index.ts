// Application constants

export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'Online Quotation Tool',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  ENVIRONMENT: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
} as const;

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  VERSION: import.meta.env.VITE_API_VERSION || 'v1',
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  ENDPOINTS: {
    AUTH: '/auth',
    USERS: '/users',
    COMPANIES: '/companies',
    QUOTATIONS: '/quotations',
    CLIENTS: '/clients',
    TEMPLATES: '/templates',
    FILES: '/files',
    NOTIFICATIONS: '/notifications',
    ANALYTICS: '/analytics',
    WEBHOOKS: '/webhooks',
  },
} as const;

export const FEATURE_FLAGS = {
  ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  FILE_UPLOAD: import.meta.env.VITE_ENABLE_FILE_UPLOAD === 'true',
  WEBSOCKETS: import.meta.env.VITE_ENABLE_WEBSOCKETS === 'true',
  DEBUG_MODE: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
  MOCK_DATA: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  PAGE_SIZES: [10, 20, 50, 100],
} as const;

export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_TIME: 'MMM dd, yyyy HH:mm',
  API: 'yyyy-MM-dd',
  API_TIME: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  SHORT: 'MM/dd/yyyy',
  TIME: 'HH:mm',
  MONTH_YEAR: 'MMMM yyyy',
} as const;

export const CURRENCY_FORMATS = {
  USD: {
    symbol: '$',
    position: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
  },
  EUR: {
    symbol: '€',
    position: 'after',
    decimalPlaces: 2,
    thousandSeparator: '.',
    decimalSeparator: ',',
  },
  GBP: {
    symbol: '£',
    position: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
  },
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_FILES: 10,
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'],
    DOCUMENTS: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ],
    ARCHIVES: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
  },
  CATEGORIES: ['quotation', 'invoice', 'contract', 'proposal', 'other'],
} as const;

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

export const QUOTATION_STATUSES = {
  DRAFT: 'draft',
  SENT: 'sent',
  VIEWED: 'viewed',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  VIEWER: 'viewer',
} as const;

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const;

export const LOCAL_STORAGE_KEYS = {
  THEME: 'quotation-tool-theme',
  LANGUAGE: 'quotation-tool-language',
  USER_PREFERENCES: 'quotation-tool-user-preferences',
  AUTH_TOKEN: 'quotation-tool-auth-token',
  REFRESH_TOKEN: 'quotation-tool-refresh-token',
} as const;

export const SESSION_STORAGE_KEYS = {
  CURRENT_PAGE: 'quotation-tool-current-page',
  FILTERS: 'quotation-tool-filters',
  SORT: 'quotation-tool-sort',
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You do not have permission to view this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
} as const;

export const SUCCESS_MESSAGES = {
  CREATED: 'Successfully created.',
  UPDATED: 'Successfully updated.',
  DELETED: 'Successfully deleted.',
  SAVED: 'Changes saved successfully.',
  UPLOADED: 'File uploaded successfully.',
  SENT: 'Message sent successfully.',
} as const;

export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
} as const;

export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#64748b',
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#06b6d4',
  LIGHT: '#f8fafc',
  DARK: '#0f172a',
} as const;

export const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv',
  JSON: 'json',
} as const;

export const DATE_RANGES = {
  '7D': '7d',
  '30D': '30d',
  '90D': '90d',
  '1Y': '1y',
  CUSTOM: 'custom',
} as const;
