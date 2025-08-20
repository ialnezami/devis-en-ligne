import { registerAs } from '@nestjs/config';

export default registerAs('firebase', () => ({
  // Firebase Project Configuration
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  privateKey: process.env.FIREBASE_PRIVATE_KEY || '',

  // Firebase Cloud Messaging Configuration
  messaging: {
    // Default notification settings
    defaultNotification: {
      sound: 'default',
      priority: 'normal',
      timeToLive: 2419200, // 28 days in seconds
    },

    // Android-specific settings
    android: {
      defaultChannelId: 'default',
      defaultChannelName: 'Default Channel',
      defaultChannelDescription: 'Default notification channel',
      defaultChannelImportance: 'high',
      defaultChannelSound: 'default',
      defaultChannelVibration: true,
      defaultChannelLights: true,
    },

    // iOS-specific settings
    apns: {
      defaultSound: 'default',
      defaultBadge: 1,
      defaultCategory: 'general',
      defaultThreadId: 'general',
      defaultContentAvailable: false,
      defaultMutableContent: false,
    },

    // Web-specific settings
    webpush: {
      defaultTTL: 2419200, // 28 days in seconds
      defaultUrgency: 'normal',
      defaultTopic: 'general',
      defaultRequireInteraction: false,
      defaultSilent: false,
    },
  },

  // Topic Management
  topics: {
    // Default topics
    default: ['general', 'quotation', 'payment', 'user', 'system'],
    
    // Topic permissions (who can subscribe to which topics)
    permissions: {
      general: ['user', 'admin', 'manager'],
      quotation: ['user', 'admin', 'manager'],
      payment: ['user', 'admin', 'manager'],
      user: ['admin', 'manager'],
      system: ['admin'],
    },

    // Topic limits
    limits: {
      maxTopicsPerDevice: 20,
      maxDevicesPerTopic: 1000000, // Firebase limit
      maxTopicsPerProject: 2000, // Firebase limit
    },
  },

  // Rate Limiting
  rateLimiting: {
    // Per-device limits
    perDevice: {
      maxNotificationsPerMinute: 10,
      maxNotificationsPerHour: 100,
      maxNotificationsPerDay: 1000,
    },

    // Per-topic limits
    perTopic: {
      maxNotificationsPerMinute: 100,
      maxNotificationsPerHour: 1000,
      maxNotificationsPerDay: 10000,
    },

    // Global limits
    global: {
      maxNotificationsPerMinute: 1000,
      maxNotificationsPerHour: 10000,
      maxNotificationsPerDay: 100000,
    },
  },

  // Retry Configuration
  retry: {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    exponentialBackoff: true,
    maxRetryDelay: 30000, // 30 seconds
  },

  // Error Handling
  errorHandling: {
    // Invalid token handling
    invalidToken: {
      removeOnError: true,
      logError: true,
      notifyAdmin: false,
    },

    // Rate limit handling
    rateLimit: {
      queueOnLimit: true,
      maxQueueSize: 10000,
      retryAfterLimit: true,
    },

    // Network error handling
    networkError: {
      retryOnError: true,
      maxRetries: 3,
      backoffMultiplier: 2,
    },
  },

  // Monitoring and Analytics
  monitoring: {
    enabled: true,
    logLevel: process.env.FIREBASE_LOG_LEVEL || 'info',
    metricsEnabled: true,
    performanceMonitoring: true,
    errorReporting: true,
  },

  // Security
  security: {
    // Token validation
    tokenValidation: {
      enabled: true,
      validateFormat: true,
      validateExpiry: true,
      maxTokenAge: 365 * 24 * 60 * 60 * 1000, // 1 year in milliseconds
    },

    // Topic security
    topicSecurity: {
      requireAuthentication: true,
      validatePermissions: true,
      preventTopicInjection: true,
    },

    // Rate limiting security
    rateLimitSecurity: {
      preventAbuse: true,
      detectAnomalies: true,
      blockSuspiciousActivity: true,
    },
  },

  // Development and Testing
  development: {
    // Test mode
    testMode: process.env.NODE_ENV === 'development',
    
    // Mock responses for testing
    mockResponses: process.env.FIREBASE_MOCK_RESPONSES === 'true',
    
    // Test tokens
    testTokens: process.env.FIREBASE_TEST_TOKENS?.split(',') || [],
    
    // Test topics
    testTopics: process.env.FIREBASE_TEST_TOPICS?.split(',') || ['test'],
  },
}));
