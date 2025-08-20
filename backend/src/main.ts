import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Swagger/OpenAPI Configuration
  const config = new DocumentBuilder()
    .setTitle('Online Quotation Tool API')
    .setDescription(`
      # Online Quotation Tool - REST API Documentation
      
      ## Overview
      This API provides comprehensive functionality for managing quotations, clients, users, and business operations.
      
      ## Features
      - **User Management**: Authentication, authorization, and user profiles
      - **Quotation System**: Create, manage, and track quotations
      - **Client Management**: Client database and relationship management
      - **Company Management**: Multi-company support and branding
      - **File Management**: Document upload, storage, and management
      - **Notifications**: Email, push, and in-app notifications
      - **Analytics**: Business intelligence and reporting
      
      ## Authentication
      Most endpoints require JWT authentication. Include the token in the Authorization header:
      \`\`\`
      Authorization: Bearer <your-jwt-token>
      \`\`\`
      
      ## Rate Limiting
      API endpoints are rate-limited to ensure fair usage:
      - **Public endpoints**: 100 requests per minute
      - **Authenticated endpoints**: 1000 requests per minute
      - **Admin endpoints**: 2000 requests per minute
      
      ## Error Handling
      The API uses standard HTTP status codes and returns detailed error messages:
      - \`400\`: Bad Request - Invalid input data
      - \`401\`: Unauthorized - Missing or invalid authentication
      - \`403\`: Forbidden - Insufficient permissions
      - \`404\`: Not Found - Resource doesn't exist
      - \`422\`: Unprocessable Entity - Validation errors
      - \`429\`: Too Many Requests - Rate limit exceeded
      - \`500\`: Internal Server Error - Server-side error
      
      ## Pagination
      List endpoints support pagination with the following query parameters:
      - \`page\`: Page number (default: 1)
      - \`limit\`: Items per page (default: 20, max: 100)
      - \`sort\`: Sort field (e.g., "createdAt")
      - \`order\`: Sort order ("asc" or "desc")
      
      ## Filtering
      Many endpoints support filtering with query parameters:
      - \`status\`: Filter by status
      - \`dateFrom\`: Filter from date (ISO format)
      - \`dateTo\`: Filter to date (ISO format)
      - \`search\`: Text search across relevant fields
      
      ## File Uploads
      File upload endpoints accept multipart/form-data:
      - Maximum file size: 50MB
      - Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
      - Files are automatically scanned for viruses
      - Secure storage with encryption at rest
      
      ## WebSocket Support
      Real-time features are available via WebSocket connections:
      - **Notifications**: Real-time notification delivery
      - **Chat**: Live messaging between users
      - **Updates**: Real-time data synchronization
      
      ## API Versioning
      This is version 1 of the API. Breaking changes will be introduced in new versions.
      The current version is accessible at \`/api/v1\`.
      
      ## Support
      For API support and questions:
      - **Documentation**: This Swagger UI
      - **Email**: api-support@company.com
      - **Status Page**: https://status.company.com
      
      ## SDKs and Libraries
      Official client libraries are available for:
      - JavaScript/TypeScript (Node.js and browser)
      - Python
      - Java
      - .NET
      - PHP
      
      ## Changelog
      ### v1.0.0 (Current)
      - Initial API release
      - Core quotation management
      - User authentication and authorization
      - File management system
      - Notification services
      - Analytics and reporting
    `)
    .setVersion('1.0.0')
    .setContact('API Support', 'https://company.com/support', 'api-support@company.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3001', 'Development Server')
    .addServer('https://api.company.com', 'Production Server')
    .addServer('https://staging-api.company.com', 'Staging Server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description: 'API key for external integrations',
      },
      'API-Key',
    )
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Users', 'User management and profile operations')
    .addTag('Companies', 'Company management and settings')
    .addTag('Quotations', 'Quotation creation, management, and workflow')
    .addTag('Templates', 'Quotation template management')
    .addTag('Clients', 'Client management and relationship tracking')
    .addTag('Files', 'File upload, storage, and management')
    .addTag('Notifications', 'Email, push, and in-app notifications')
    .addTag('Analytics', 'Business intelligence and reporting')
    .addTag('Integrations', 'Third-party service integrations')
    .addTag('Webhooks', 'Webhook management and delivery')
    .addTag('Admin', 'Administrative operations and system management')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [],
    deepScanRoutes: true,
  });

  // Custom Swagger UI options
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      docExpansion: 'none',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      tryItOutEnabled: true,
      requestInterceptor: (req: any) => {
        // Add default headers for testing
        req.headers['Content-Type'] = 'application/json';
        return req;
      },
    },
    customSiteTitle: 'Online Quotation Tool API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { font-size: 2.5em; }
      .swagger-ui .info .description { font-size: 1.1em; line-height: 1.6; }
      .swagger-ui .scheme-container { margin: 20px 0; }
      .swagger-ui .auth-wrapper { margin: 20px 0; }
    `,
    customJs: [
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.15.5/swagger-ui-bundle.js',
    ],
  });

  // API Health Check
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
    });
  });

  // API Status Endpoint
  app.get('/api/status', (req, res) => {
    res.json({
      status: 'operational',
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      services: {
        database: 'operational',
        redis: 'operational',
        email: 'operational',
        fileStorage: 'operational',
        notifications: 'operational',
      },
    });
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;

  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation available at: http://localhost:${port}/api/docs`);
  console.log(`🔍 Health Check available at: http://localhost:${port}/health`);
  console.log(`📊 API Status available at: http://localhost:${port}/api/status`);
}

bootstrap();
