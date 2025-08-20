# API Documentation Setup Guide

This guide provides comprehensive instructions for setting up and maintaining the API documentation for the Online Quotation Tool.

## 🚀 Overview

The API documentation is built using **Swagger/OpenAPI 3.0** and provides:
- Interactive API documentation
- Request/response examples
- Authentication information
- Error handling details
- Code samples in multiple languages
- API testing capabilities

## 📋 Prerequisites

- Node.js 18+ and npm
- NestJS application with Swagger module installed
- Access to the backend codebase

## 🛠️ Installation & Setup

### 1. Install Dependencies

```bash
npm install @nestjs/swagger swagger-ui-express
npm install --save-dev @types/swagger-ui-express
```

### 2. Configure Swagger in main.ts

The main application file (`src/main.ts`) is already configured with comprehensive Swagger setup.

### 3. Environment Configuration

Add these environment variables to your `.env` file:

```env
# Swagger Configuration
ENABLE_SWAGGER=true
SWAGGER_TITLE="Online Quotation Tool API"
SWAGGER_DESCRIPTION="Comprehensive API for quotation management"
SWAGGER_VERSION="1.0.0"

# API Configuration
API_PREFIX="api/v1"
API_DOCS_PATH="api/docs"
```

## 📚 Documentation Structure

### Core Configuration Files

1. **`src/main.ts`** - Main Swagger configuration
2. **`src/config/swagger.config.ts`** - Detailed Swagger configuration
3. **`src/config/api-versioning.config.ts`** - API versioning strategy
4. **`src/common/dto/`** - DTOs with Swagger decorators

### Documentation Organization

The API is organized into logical groups using tags:

- **Authentication** - User authentication and authorization
- **Users** - User management operations
- **Companies** - Company management
- **Quotations** - Quotation CRUD operations
- **Templates** - Quotation templates
- **Clients** - Client management
- **Files** - File upload and management
- **Notifications** - Email, push, and in-app notifications
- **Analytics** - Business intelligence and reporting
- **Integrations** - Third-party service integrations
- **Webhooks** - Webhook management
- **Admin** - Administrative operations

## 🔧 Adding Documentation to Endpoints

### 1. Controller-Level Documentation

```typescript
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Quotations')
@Controller('quotations')
export class QuotationsController {
  
  @ApiOperation({
    summary: 'Create a new quotation',
    description: 'Creates a new quotation with the provided details. The quotation will be in draft status initially.',
  })
  @ApiResponse({
    status: 201,
    description: 'Quotation created successfully',
    type: QuotationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors',
    type: ValidationErrorDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @Post()
  async createQuotation(@Body() createQuotationDto: CreateQuotationDto) {
    // Implementation
  }
}
```

### 2. DTO Documentation

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateQuotationDto {
  @ApiProperty({
    description: 'Title of the quotation',
    example: 'Website Development Project',
    maxLength: 255,
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Detailed description of the quotation',
    example: 'Complete website development for e-commerce platform',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Client ID for the quotation',
    example: 'client-123',
  })
  @IsString()
  clientId: string;

  @ApiProperty({
    description: 'Expiration date for the quotation',
    example: '2024-02-15T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  validUntil?: string;
}
```

### 3. Response Documentation

```typescript
export class QuotationResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the quotation',
    example: 'quote-456',
  })
  id: string;

  @ApiProperty({
    description: 'Quotation number',
    example: 'Q-2024-001',
  })
  number: string;

  @ApiProperty({
    description: 'Current status of the quotation',
    example: 'draft',
    enum: ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'],
  })
  status: string;

  @ApiProperty({
    description: 'Total amount of the quotation',
    example: 8400,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'When the quotation was created',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: string;
}
```

## 🌐 Accessing the Documentation

### Development Environment

- **Swagger UI**: `http://localhost:3001/api/docs`
- **Health Check**: `http://localhost:3001/health`
- **API Status**: `http://localhost:3001/api/status`

### Production Environment

- **Swagger UI**: `https://api.company.com/api/docs`
- **Health Check**: `https://api.company.com/health`
- **API Status**: `https://api.company.com/api/status`

## 📖 Documentation Features

### 1. Interactive Testing

- **Try It Out**: Test endpoints directly from the documentation
- **Request Builder**: Build requests with proper headers and body
- **Response Viewer**: View actual API responses
- **Authentication**: Test with JWT tokens and API keys

### 2. Code Examples

The documentation includes code examples in:
- JavaScript/TypeScript
- Python
- Java
- .NET
- PHP

### 3. Authentication

- **JWT Bearer Token**: Primary authentication method
- **API Key**: For external integrations
- **OAuth 2.0**: Future implementation

### 4. Error Handling

Comprehensive error documentation including:
- HTTP status codes
- Error response formats
- Validation error details
- Rate limiting information

## 🔒 Security Documentation

### Rate Limiting

```typescript
@ApiResponse({
  status: 429,
  description: 'Too Many Requests - rate limit exceeded',
  schema: {
    type: 'object',
    properties: {
      statusCode: { type: 'number', example: 429 },
      message: { type: 'string', example: 'Rate limit exceeded' },
      retryAfter: { type: 'number', example: 60 },
    },
  },
})
```

### Authentication Requirements

```typescript
@ApiBearerAuth('JWT-auth')
@ApiSecurity('API-Key')
@UseGuards(JwtAuthGuard, ApiKeyGuard)
```

## 📊 API Examples

### Request Examples

```typescript
@ApiBody({
  description: 'Quotation creation data',
  examples: {
    'Basic Quotation': {
      summary: 'Basic quotation with minimal data',
      value: {
        title: 'Website Development',
        clientId: 'client-123',
        items: [
          { name: 'Frontend Development', quantity: 1, unitPrice: 3000 }
        ],
      },
    },
    'Detailed Quotation': {
      summary: 'Detailed quotation with all fields',
      value: {
        title: 'E-commerce Platform Development',
        description: 'Complete e-commerce solution with payment integration',
        clientId: 'client-456',
        items: [
          { name: 'Frontend Development', quantity: 1, unitPrice: 5000 },
          { name: 'Backend API', quantity: 1, unitPrice: 4000 },
          { name: 'Payment Integration', quantity: 1, unitPrice: 2000 },
        ],
        validUntil: '2024-02-15T00:00:00.000Z',
        paymentTerms: 'Net 30',
        notes: 'Project to be completed within 12 weeks',
      },
    },
  },
})
```

### Response Examples

```typescript
@ApiResponse({
  status: 200,
  description: 'Quotations retrieved successfully',
  schema: {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/QuotationResponseDto' },
      },
      pagination: { $ref: '#/components/schemas/PaginationMetaDto' },
    },
  },
})
```

## 🚀 Advanced Features

### 1. Custom Swagger UI

The documentation includes custom CSS and JavaScript for:
- Branded appearance
- Enhanced readability
- Custom functionality
- Mobile responsiveness

### 2. API Versioning

- **URI Versioning**: `/api/v1/`, `/api/v2/`
- **Version Deprecation**: Automatic warnings for deprecated versions
- **Migration Guides**: Links to version migration documentation

### 3. WebSocket Documentation

```typescript
@ApiTags('WebSocket')
@WebSocketGateway('notifications')
export class NotificationsGateway {
  
  @SubscribeMessage('join')
  @ApiOperation({
    summary: 'Join notification channel',
    description: 'Subscribe to real-time notifications',
  })
  async handleJoin(@MessageBody() data: JoinNotificationDto) {
    // Implementation
  }
}
```

## 📝 Maintaining Documentation

### 1. Regular Updates

- Update documentation with each API change
- Review and update examples regularly
- Keep error codes and messages current
- Update rate limiting information

### 2. Documentation Standards

- Use consistent naming conventions
- Provide clear examples
- Include all possible response codes
- Document breaking changes

### 3. Testing Documentation

- Test all examples in the documentation
- Verify authentication flows
- Test error scenarios
- Validate response schemas

## 🔍 Troubleshooting

### Common Issues

1. **Swagger UI not loading**
   - Check if Swagger module is properly imported
   - Verify the documentation path is correct
   - Check console for JavaScript errors

2. **Missing endpoints**
   - Ensure controllers are properly decorated
   - Check if modules are imported in AppModule
   - Verify route decorators are correct

3. **Authentication not working**
   - Check JWT configuration
   - Verify API key setup
   - Test with Postman or similar tool

### Debug Mode

Enable debug mode for detailed logging:

```typescript
// In main.ts
const document = SwaggerModule.createDocument(app, config, {
  extraModels: [],
  deepScanRoutes: true,
  ignoreGlobalPrefix: false,
});
```

## 📚 Additional Resources

### Official Documentation

- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)

### Tools & Extensions

- **Swagger Editor**: Online API editor
- **Swagger Codegen**: Generate client libraries
- **Postman**: API testing and documentation
- **Insomnia**: Alternative API client

### Best Practices

1. **Keep it Simple**: Don't over-document simple endpoints
2. **Be Consistent**: Use consistent patterns across all endpoints
3. **Provide Examples**: Include realistic examples for all operations
4. **Update Regularly**: Keep documentation synchronized with code
5. **Test Everything**: Verify all examples work correctly

## 🎯 Next Steps

1. **Review Current Documentation**: Ensure all endpoints are documented
2. **Add Missing Examples**: Include examples for complex operations
3. **Test Authentication**: Verify JWT and API key flows
4. **Update DTOs**: Add Swagger decorators to all DTOs
5. **Create Migration Guides**: Document API version changes
6. **Add Integration Examples**: Include third-party integration examples

## 📞 Support

For questions about API documentation:

- **Email**: api-support@company.com
- **Documentation Issues**: GitHub repository issues
- **Feature Requests**: Product team backlog
- **Technical Support**: Development team

---

*This documentation is maintained by the development team and updated with each release.*
