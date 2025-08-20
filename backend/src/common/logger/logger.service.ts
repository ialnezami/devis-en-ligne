import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Logger implements NestLoggerService {
  private logger: winston.Logger;

  constructor(private configService: ConfigService) {
    this.initializeLogger();
  }

  private initializeLogger() {
    const logLevel = this.configService.get('logging.level', 'info');
    const enableConsole = this.configService.get('logging.enableConsole', true);
    const enableFile = this.configService.get('logging.enableFile', false);
    const logDir = this.configService.get('logging.logDir', './logs');
    const maxSize = this.configService.get('logging.maxSize', '20m');
    const maxFiles = this.configService.get('logging.maxFiles', '14d');

    const transports: winston.transport[] = [];

    // Console transport
    if (enableConsole) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context, trace }) => {
              return `${timestamp} [${context}] ${level}: ${message}${trace ? `\n${trace}` : ''}`;
            }),
          ),
        }),
      );
    }

    // File transport for errors
    if (enableFile) {
      transports.push(
        new DailyRotateFile({
          filename: `${logDir}/error-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize,
          maxFiles,
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json(),
          ),
        }),
      );

      // File transport for all logs
      transports.push(
        new DailyRotateFile({
          filename: `${logDir}/combined-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize,
          maxFiles,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      );
    }

    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: { service: 'quotation-tool-backend' },
      transports,
    });
  }

  log(message: any, contextOrMeta?: string | any) {
    if (typeof contextOrMeta === 'string') {
      this.logger.info(message, { context: contextOrMeta });
    } else if (typeof contextOrMeta === 'object') {
      this.logger.info(message, contextOrMeta);
    } else {
      this.logger.info(message);
    }
  }

  error(message: any, traceOrMeta?: string | any, context?: string) {
    if (typeof traceOrMeta === 'string') {
      this.logger.error(message, { trace: traceOrMeta, context });
    } else if (typeof traceOrMeta === 'object') {
      this.logger.error(message, traceOrMeta);
    } else {
      this.logger.error(message, { context });
    }
  }

  warn(message: any, contextOrMeta?: string | any) {
    if (typeof contextOrMeta === 'string') {
      this.logger.warn(message, { context: contextOrMeta });
    } else if (typeof contextOrMeta === 'object') {
      this.logger.warn(message, contextOrMeta);
    } else {
      this.logger.warn(message);
    }
  }

  debug(message: any, contextOrMeta?: string | any) {
    if (typeof contextOrMeta === 'string') {
      this.logger.debug(message, { context: contextOrMeta });
    } else if (typeof contextOrMeta === 'object') {
      this.logger.debug(message, contextOrMeta);
    } else {
      this.logger.debug(message);
    }
  }

  verbose(message: any, contextOrMeta?: string | any) {
    if (typeof contextOrMeta === 'string') {
      this.logger.verbose(message, { context: contextOrMeta });
    } else if (typeof contextOrMeta === 'object') {
      this.logger.verbose(message, contextOrMeta);
    } else {
      this.logger.verbose(message);
    }
  }

  // Additional methods for structured logging
  logWithMeta(message: string, meta: any, context?: string) {
    this.logger.info(message, { ...meta, context });
  }

  errorWithMeta(message: string, meta: any, context?: string) {
    this.logger.error(message, { ...meta, context });
  }

  // Performance logging
  logPerformance(operation: string, duration: number, context?: string) {
    this.logger.info(`Performance: ${operation} took ${duration}ms`, {
      operation,
      duration,
      context,
    });
  }

  // Security logging
  logSecurity(event: string, details: any, context?: string) {
    this.logger.warn(`Security Event: ${event}`, {
      event,
      details,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  // Business logic logging
  logBusinessEvent(event: string, data: any, context?: string) {
    this.logger.info(`Business Event: ${event}`, {
      event,
      data,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  // Database operation logging
  logDatabaseOperation(operation: string, table: string, duration: number, context?: string) {
    this.logger.debug(`Database: ${operation} on ${table} took ${duration}ms`, {
      operation,
      table,
      duration,
      context,
    });
  }

  // API request logging
  logApiRequest(method: string, url: string, duration: number, statusCode: number, context?: string) {
    const level = statusCode >= 400 ? 'warn' : 'info';
    this.logger[level](`API Request: ${method} ${url} - ${statusCode} (${duration}ms)`, {
      method,
      url,
      duration,
      statusCode,
      context,
    });
  }

  // User action logging
  logUserAction(userId: string, action: string, details: any, context?: string) {
    this.logger.info(`User Action: ${action}`, {
      userId,
      action,
      details,
      context,
      timestamp: new Date().toISOString(),
    });
  }
}
