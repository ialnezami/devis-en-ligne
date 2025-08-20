import { registerAs } from '@nestjs/config';

export const DatabaseConfig = registerAs('database', () => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  name: process.env.DB_NAME || 'quotation_tool',
  
  // Connection settings
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production',
  
  // Connection pool
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
  acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT, 10) || 60000,
  timeout: parseInt(process.env.DB_TIMEOUT, 10) || 60000,
  
  // Migration settings
  migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true',
  migrationsTableName: process.env.DB_MIGRATIONS_TABLE || 'migrations',
  
  // Entity settings
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  subscribers: [__dirname + '/../database/subscribers/*{.ts,.js}'],
  
  // SSL configuration for production
  sslConfig: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false,
    ca: process.env.DB_SSL_CA,
    key: process.env.DB_SSL_KEY,
    cert: process.env.DB_SSL_CERT,
  } : undefined,
  
  // Extra options
  extra: {
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
    acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT, 10) || 60000,
    timeout: parseInt(process.env.DB_TIMEOUT, 10) || 60000,
    charset: 'utf8mb4',
    timezone: 'UTC',
  },
}));
