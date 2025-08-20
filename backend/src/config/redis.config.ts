import { registerAs } from '@nestjs/config';

export const RedisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB, 10) || 0,
  
  // Connection settings
  retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY, 10) || 100,
  maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES, 10) || 3,
  
  // Cluster settings
  enableReadyCheck: process.env.REDIS_ENABLE_READY_CHECK !== 'false',
  maxLoadingTimeout: parseInt(process.env.REDIS_MAX_LOADING_TIMEOUT, 10) || 10000,
  
  // TLS settings
  tls: process.env.REDIS_TLS === 'true' ? {
    rejectUnauthorized: process.env.REDIS_TLS_REJECT_UNAUTHORIZED !== 'false',
    ca: process.env.REDIS_TLS_CA,
    key: process.env.REDIS_TLS_KEY,
    cert: process.env.REDIS_TLS_CERT,
  } : undefined,
  
  // Sentinel settings
  sentinels: process.env.REDIS_SENTINELS ? 
    process.env.REDIS_SENTINELS.split(',').map(s => {
      const [host, port] = s.trim().split(':');
      return { host, port: parseInt(port, 10) || 26379 };
    }) : undefined,
  
  sentinelPassword: process.env.REDIS_SENTINEL_PASSWORD,
  name: process.env.REDIS_SENTINEL_NAME || 'mymaster',
  
  // Key prefix
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'quotation_tool:',
  
  // Cache settings
  cache: {
    ttl: parseInt(process.env.REDIS_CACHE_TTL, 10) || 3600, // 1 hour
    maxKeys: parseInt(process.env.REDIS_CACHE_MAX_KEYS, 10) || 10000,
  },
  
  // Session settings
  session: {
    ttl: parseInt(process.env.REDIS_SESSION_TTL, 10) || 86400, // 24 hours
    prefix: process.env.REDIS_SESSION_PREFIX || 'sess:',
  },
  
  // Queue settings
  queue: {
    prefix: process.env.REDIS_QUEUE_PREFIX || 'queue:',
    defaultJobOptions: {
      removeOnComplete: parseInt(process.env.REDIS_QUEUE_REMOVE_ON_COMPLETE, 10) || 100,
      removeOnFail: parseInt(process.env.REDIS_QUEUE_REMOVE_ON_FAIL, 10) || 200,
      attempts: parseInt(process.env.REDIS_QUEUE_ATTEMPTS, 10) || 3,
      backoff: {
        type: 'exponential',
        delay: parseInt(process.env.REDIS_QUEUE_BACKOFF_DELAY, 10) || 2000,
      },
    },
  },
}));
