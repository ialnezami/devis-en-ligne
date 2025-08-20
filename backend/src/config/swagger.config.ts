import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Online Quotation Tool API')
  .setDescription(`
    # Online Quotation Tool - REST API Documentation
    
    ## 🚀 Overview
    This API provides comprehensive functionality for managing quotations, clients, users, and business operations in the Online Quotation Tool platform.
    
    ## ✨ Key Features
    - **User Management**: Complete user authentication, authorization, and profile management
    - **Quotation System**: End-to-end quotation creation, management, and workflow
    - **Client Management**: Comprehensive client database and relationship tracking
    - **Company Management**: Multi-company support with branding and settings
    - **File Management**: Secure document upload, storage, and management
    - **Notifications**: Multi-channel notifications (email, push, in-app)
    - **Analytics**: Business intelligence and reporting capabilities
    - **Integrations**: Third-party service integrations and webhooks
    
    ## 🔐 Authentication
    Most endpoints require JWT authentication. Include your token in the Authorization header:
    \`\`\`
    Authorization: Bearer <your-jwt-token>
    \`\`\`
    
    ### Getting a JWT Token
    1. Use the \`POST /api/v1/auth/login\` endpoint
    2. Provide your email and password
    3. Receive a JWT token in the response
    4. Include this token in subsequent requests
    
    ## 📊 Rate Limiting
    API endpoints are rate-limited to ensure fair usage:
    - **Public endpoints**: 100 requests per minute
    - **Authenticated endpoints**: 1000 requests per minute
    - **Admin endpoints**: 2000 requests per minute
    
    ## ⚠️ Error Handling
    The API uses standard HTTP status codes and returns detailed error messages:
    
    | Status | Code | Description |
    |--------|------|-------------|
    | 200 | OK | Request successful |
    | 201 | Created | Resource created successfully |
    | 400 | Bad Request | Invalid input data or parameters |
    | 401 | Unauthorized | Missing or invalid authentication |
    | 403 | Forbidden | Insufficient permissions for resource |
    | 404 | Not Found | Requested resource doesn't exist |
    | 409 | Conflict | Resource conflict (e.g., duplicate email) |
    | 422 | Unprocessable Entity | Validation errors in request data |
    | 429 | Too Many Requests | Rate limit exceeded |
    | 500 | Internal Server Error | Server-side error occurred |
    
    ### Error Response Format
    \`\`\`json
    {
      "statusCode": 400,
      "message": "Validation failed",
      "error": "Bad Request",
      "details": [
        {
          "field": "email",
          "message": "Email must be a valid email address"
        }
      ],
      "timestamp": "2024-01-15T10:30:00.000Z",
      "path": "/api/v1/users"
    }
    \`\`\`
    
    ## 📄 Pagination
    List endpoints support pagination with the following query parameters:
    
    | Parameter | Type | Default | Description |
    |-----------|------|---------|-------------|
    | \`page\` | number | 1 | Page number (1-based) |
    | \`limit\` | number | 20 | Items per page (max: 100) |
    | \`sort\` | string | "createdAt" | Field to sort by |
    | \`order\` | string | "desc" | Sort order ("asc" or "desc") |
    
    ### Pagination Response Format
    \`\`\`json
    {
      "data": [...],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 150,
        "totalPages": 8,
        "hasNext": true,
        "hasPrev": false
      }
    }
    \`\`\`
    
    ## 🔍 Filtering
    Many endpoints support filtering with query parameters:
    
    | Parameter | Type | Description |
    |-----------|------|-------------|
    | \`status\` | string | Filter by status (e.g., "active", "pending") |
    | \`dateFrom\` | string | Filter from date (ISO 8601 format) |
    | \`dateTo\` | string | Filter to date (ISO 8601 format) |
    | \`search\` | string | Text search across relevant fields |
    | \`category\` | string | Filter by category |
    | \`tags\` | string[] | Filter by tags (comma-separated) |
    
    ## 📁 File Uploads
    File upload endpoints accept \`multipart/form-data\`:
    
    ### Supported File Types
    - **Documents**: PDF, DOC, DOCX, XLS, XLSX, TXT
    - **Images**: JPG, JPEG, PNG, GIF, SVG
    - **Archives**: ZIP, RAR, 7Z
    
    ### File Size Limits
    - **Maximum file size**: 50MB
    - **Maximum files per request**: 10
    - **Total request size**: 100MB
    
    ### Security Features
    - **Virus scanning**: All uploaded files are automatically scanned
    - **File validation**: File type and content validation
    - **Encryption**: Files are encrypted at rest
    - **Access control**: File access is restricted to authorized users
    
    ## 🌐 WebSocket Support
    Real-time features are available via WebSocket connections:
    
    ### Available Namespaces
    - \`/notifications\`: Real-time notification delivery
    - \`/chat\`: Live messaging between users
    - \`/updates\`: Real-time data synchronization
    
    ### WebSocket Authentication
    Include your JWT token in the WebSocket handshake:
    \`\`\`
    const socket = io('ws://localhost:3001/notifications', {
      auth: {
        token: 'your-jwt-token'
      }
    });
    \`\`\`
    
    ## 🔄 API Versioning
    This is version 1 of the API. Breaking changes will be introduced in new versions.
    
    ### Version Strategy
    - **Current version**: \`/api/v1\`
    - **Future versions**: \`/api/v2\`, \`/api/v3\`, etc.
    - **Deprecation policy**: 6 months notice before removing endpoints
    - **Migration guides**: Provided for major version changes
    
    ## 🛠️ SDKs and Libraries
    Official client libraries are available for:
    
    ### JavaScript/TypeScript
    \`\`\`bash
    npm install @company/quotation-api-client
    \`\`\`
    
    ### Python
    \`\`\`bash
    pip install quotation-api-client
    \`\`\`
    
    ### Java
    \`\`\`xml
    <dependency>
      <groupId>com.company</groupId>
      <artifactId>quotation-api-client</artifactId>
      <version>1.0.0</version>
    </dependency>
    \`\`\`
    
    ### .NET
    \`\`\`bash
    dotnet add package Company.QuotationApiClient
    \`\`\`
    
    ### PHP
    \`\`\`bash
    composer require company/quotation-api-client
    \`\`\`
    
    ## 📚 Code Examples
    
    ### JavaScript/TypeScript
    \`\`\`typescript
    import { QuotationApiClient } from '@company/quotation-api-client';
    
    const client = new QuotationApiClient({
      baseUrl: 'https://api.company.com',
      apiKey: 'your-api-key'
    });
    
    // Create a quotation
    const quotation = await client.quotations.create({
      clientId: 'client-123',
      items: [
        { name: 'Web Development', quantity: 1, price: 5000 }
      ],
      validUntil: '2024-02-15'
    });
    
    // Get quotations with pagination
    const quotations = await client.quotations.list({
      page: 1,
      limit: 20,
      status: 'pending'
    });
    \`\`\`
    
    ### Python
    \`\`\`python
    from quotation_api_client import QuotationApiClient
    
    client = QuotationApiClient(
        base_url='https://api.company.com',
        api_key='your-api-key'
    )
    
    # Create a quotation
    quotation = client.quotations.create(
        client_id='client-123',
        items=[
            {'name': 'Web Development', 'quantity': 1, 'price': 5000}
        ],
        valid_until='2024-02-15'
    )
    
    # Get quotations with pagination
    quotations = client.quotations.list(
        page=1,
        limit=20,
        status='pending'
    )
    \`\`\`
    
    ## 🚦 Status Codes and Monitoring
    
    ### Health Check
    - **Endpoint**: \`GET /health\`
    - **Purpose**: Basic application health status
    - **Response**: Application status, uptime, environment
    
    ### API Status
    - **Endpoint**: \`GET /api/status\`
    - **Purpose**: Detailed API and service status
    - **Response**: Service status, last updated, individual service health
    
    ### Monitoring Endpoints
    - **Metrics**: \`GET /metrics\` (Prometheus format)
    - **Logs**: \`GET /logs\` (recent application logs)
    - **Performance**: \`GET /performance\` (response times, throughput)
    
    ## 🔒 Security Features
    
    ### Authentication
    - **JWT tokens**: Secure, stateless authentication
    - **Refresh tokens**: Automatic token renewal
    - **Multi-factor authentication**: Enhanced security for sensitive operations
    
    ### Authorization
    - **Role-based access control**: Fine-grained permissions
    - **Resource-level permissions**: Control access to specific resources
    - **Company isolation**: Multi-tenant security
    
    ### Data Protection
    - **HTTPS only**: All communications encrypted
    - **Data encryption**: Sensitive data encrypted at rest
    - **Audit logging**: Complete audit trail of all operations
    
    ## 📋 Request/Response Examples
    
    ### Create Quotation
    \`\`\`http
    POST /api/v1/quotations
    Authorization: Bearer <jwt-token>
    Content-Type: application/json
    
    {
      "clientId": "client-123",
      "title": "Website Development Project",
      "description": "Complete website development for e-commerce",
      "items": [
        {
          "name": "Frontend Development",
          "description": "React.js frontend with responsive design",
          "quantity": 1,
          "unitPrice": 3000,
          "taxRate": 20
        },
        {
          "name": "Backend Development",
          "description": "Node.js API with PostgreSQL",
          "quantity": 1,
          "unitPrice": 4000,
          "taxRate": 20
        }
      ],
      "validUntil": "2024-02-15",
      "paymentTerms": "Net 30",
      "notes": "Project to be completed within 8 weeks"
    }
    \`\`\`
    
    ### Response
    \`\`\`json
    {
      "id": "quote-456",
      "number": "Q-2024-001",
      "clientId": "client-123",
      "title": "Website Development Project",
      "status": "draft",
      "totalAmount": 8400,
      "taxAmount": 1400,
      "grandTotal": 9800,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
    \`\`\`
    
    ## 🆘 Support and Resources
    
    ### Documentation
    - **API Reference**: This Swagger UI
    - **Getting Started**: https://docs.company.com/getting-started
    - **Tutorials**: https://docs.company.com/tutorials
    - **Examples**: https://docs.company.com/examples
    
    ### Support Channels
    - **Email**: api-support@company.com
    - **Chat**: https://support.company.com/chat
    - **Phone**: +1 (555) 123-4567
    - **Status Page**: https://status.company.com
    
    ### Community
    - **GitHub**: https://github.com/company/quotation-api
    - **Discord**: https://discord.gg/company
    - **Stack Overflow**: Tag questions with "company-quotation-api"
    
    ## 📈 Changelog
    
    ### v1.0.0 (Current Release)
    - **Initial API release** with core functionality
    - **Complete quotation management** system
    - **User authentication and authorization**
    - **File management system** with security features
    - **Multi-channel notification services**
    - **Analytics and reporting** capabilities
    - **WebSocket support** for real-time features
    
    ### Upcoming Features (v1.1.0)
    - **Advanced analytics** with machine learning insights
    - **Enhanced reporting** with custom templates
    - **Bulk operations** for improved efficiency
    - **Advanced search** with full-text capabilities
    - **Webhook management** for integrations
    
    ### Breaking Changes
    - No breaking changes in v1.0.0
    - Future versions will provide migration guides
    - Deprecated endpoints will have 6-month notice period
  `)
  .setVersion('1.0.0')
  .setContact(
    'API Support Team',
    'https://company.com/support',
    'api-support@company.com'
  )
  .setLicense(
    'MIT License',
    'https://opensource.org/licenses/MIT'
  )
  .addServer(
    'http://localhost:3001',
    'Development Server',
    {
      description: 'Local development environment',
      variables: {
        environment: {
          default: 'development',
          enum: ['development', 'testing']
        }
      }
    }
  )
  .addServer(
    'https://staging-api.company.com',
    'Staging Server',
    {
      description: 'Staging environment for testing',
      variables: {
        environment: {
          default: 'staging',
          enum: ['staging', 'testing']
        }
      }
    }
  )
  .addServer(
    'https://api.company.com',
    'Production Server',
    {
      description: 'Production environment',
      variables: {
        environment: {
          default: 'production',
          enum: ['production']
        }
      }
    }
  )
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token for authentication',
      in: 'header',
    },
    'JWT-auth'
  )
  .addApiKey(
    {
      type: 'apiKey',
      name: 'X-API-Key',
      in: 'header',
      description: 'API key for external integrations and webhooks',
    },
    'API-Key'
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

export const swaggerCustomOptions: SwaggerCustomOptions = {
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
    responseInterceptor: (res: any) => {
      // Add response processing if needed
      return res;
    },
  },
  customSiteTitle: 'Online Quotation Tool API Documentation',
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { font-size: 2.5em; }
    .swagger-ui .info .description { font-size: 1.1em; line-height: 1.6; }
    .swagger-ui .scheme-container { margin: 20px 0; }
    .swagger-ui .auth-wrapper { margin: 20px 0; }
    .swagger-ui .opblock-summary-description { font-size: 0.9em; }
    .swagger-ui .opblock-tag { font-size: 1.1em; font-weight: 600; }
    .swagger-ui .opblock-summary-operation-id { font-size: 0.8em; }
    .swagger-ui .opblock-summary-path { font-size: 0.9em; }
    .swagger-ui .opblock-summary-method { font-size: 0.8em; }
  `,
  customJs: [
    'https://cdn.jsdelivr.net/npm/swagger-ui-dist@4.15.5/swagger-ui-bundle.js',
  ],
};
