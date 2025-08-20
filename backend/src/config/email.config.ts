import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  // SMTP Configuration
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  
  // Authentication
  user: process.env.EMAIL_USER || '',
  password: process.env.EMAIL_PASSWORD || '',
  
  // From address
  from: process.env.EMAIL_FROM || 'noreply@company.com',
  
  // TLS Configuration
  tls: {
    rejectUnauthorized: process.env.EMAIL_TLS_REJECT_UNAUTHORIZED !== 'false',
  },
  
  // Rate Limiting
  rateLimit: {
    maxEmailsPerMinute: parseInt(process.env.EMAIL_RATE_LIMIT_MAX_PER_MINUTE, 10) || 60,
    maxEmailsPerHour: parseInt(process.env.EMAIL_RATE_LIMIT_MAX_PER_HOUR, 10) || 1000,
    maxEmailsPerDay: parseInt(process.env.EMAIL_RATE_LIMIT_MAX_PER_DAY, 10) || 10000,
  },
  
  // Queue Configuration
  queue: {
    maxRetries: parseInt(process.env.EMAIL_QUEUE_MAX_RETRIES, 10) || 3,
    retryDelay: parseInt(process.env.EMAIL_QUEUE_RETRY_DELAY, 10) || 5000,
    maxConcurrency: parseInt(process.env.EMAIL_QUEUE_MAX_CONCURRENCY, 10) || 5,
  },
  
  // Tracking Configuration
  tracking: {
    enabled: process.env.EMAIL_TRACKING_ENABLED !== 'false',
    pixelTracking: process.env.EMAIL_PIXEL_TRACKING !== 'false',
    linkTracking: process.env.EMAIL_LINK_TRACKING !== 'false',
    retentionDays: parseInt(process.env.EMAIL_TRACKING_RETENTION_DAYS, 10) || 90,
  },
  
  // Template Configuration
  templates: {
    defaultCategory: process.env.EMAIL_DEFAULT_CATEGORY || 'general',
    allowCustomTemplates: process.env.EMAIL_ALLOW_CUSTOM_TEMPLATES !== 'false',
    maxTemplateSize: parseInt(process.env.EMAIL_MAX_TEMPLATE_SIZE, 10) || 100000, // 100KB
  },
  
  // Unsubscribe Configuration
  unsubscribe: {
    enabled: process.env.EMAIL_UNSUBSCRIBE_ENABLED !== 'false',
    globalUnsubscribe: process.env.EMAIL_GLOBAL_UNSUBSCRIBE !== 'false',
    categoryUnsubscribe: process.env.EMAIL_CATEGORY_UNSUBSCRIBE !== 'false',
    unsubscribeEmail: process.env.EMAIL_UNSUBSCRIBE_EMAIL || 'unsubscribe@company.com',
  },
  
  // Bulk Email Configuration
  bulk: {
    maxRecipients: parseInt(process.env.EMAIL_BULK_MAX_RECIPIENTS, 10) || 1000,
    batchSize: parseInt(process.env.EMAIL_BULK_BATCH_SIZE, 10) || 100,
    delayBetweenBatches: parseInt(process.env.EMAIL_BULK_DELAY_BETWEEN_BATCHES, 10) || 1000,
  },
  
  // Security Configuration
  security: {
    maxAttachmentSize: parseInt(process.env.EMAIL_MAX_ATTACHMENT_SIZE, 10) || 10485760, // 10MB
    allowedAttachmentTypes: process.env.EMAIL_ALLOWED_ATTACHMENT_TYPES?.split(',') || [
      'pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif'
    ],
    blockSuspiciousContent: process.env.EMAIL_BLOCK_SUSPICIOUS_CONTENT !== 'false',
    requireAuthentication: process.env.EMAIL_REQUIRE_AUTHENTICATION !== 'false',
  },
  
  // Monitoring Configuration
  monitoring: {
    healthCheckEnabled: process.env.EMAIL_HEALTH_CHECK_ENABLED !== 'false',
    healthCheckInterval: parseInt(process.env.EMAIL_HEALTH_CHECK_INTERVAL, 10) || 300000, // 5 minutes
    logLevel: process.env.EMAIL_LOG_LEVEL || 'info',
    metricsEnabled: process.env.EMAIL_METRICS_ENABLED !== 'false',
  },
}));
