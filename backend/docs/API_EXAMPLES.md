# API Examples & Usage Guide

This document provides comprehensive examples for all API endpoints in the Online Quotation Tool.

## 🔐 Authentication Examples

### 1. User Login

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@company.com",
    "password": "securepassword123"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "user@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin",
    "companyId": "company-456"
  }
}
```

### 2. Using JWT Token

```bash
curl -X GET http://localhost:3001/api/v1/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. API Key Authentication

```bash
curl -X GET http://localhost:3001/api/v1/quotations \
  -H "X-API-Key: sk_live_1234567890abcdef"
```

## 👥 User Management Examples

### 1. Create User

```bash
curl -X POST http://localhost:3001/api/v1/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@company.com",
    "password": "SecurePass123!",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "user",
    "companyId": "company-456"
  }'
```

### 2. Update User Profile

```bash
curl -X PUT http://localhost:3001/api/v1/users/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Johnson",
    "phone": "+1-555-0123"
  }'
```

### 3. Get Users with Pagination

```bash
curl -X GET "http://localhost:3001/api/v1/users?page=1&limit=10&sort=createdAt&order=desc" \
  -H "Authorization: Bearer <token>"
```

## 🏢 Company Management Examples

### 1. Create Company

```bash
curl -X POST http://localhost:3001/api/v1/companies \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "description": "Leading technology solutions provider",
    "address": {
      "street": "123 Business Ave",
      "city": "Tech City",
      "state": "CA",
      "zipCode": "90210",
      "country": "USA"
    },
    "contact": {
      "email": "info@acme.com",
      "phone": "+1-555-0123",
      "website": "https://acme.com"
    },
    "settings": {
      "currency": "USD",
      "timezone": "America/Los_Angeles",
      "language": "en"
    }
  }'
```

### 2. Update Company Branding

```bash
curl -X PUT http://localhost:3001/api/v1/companies/company-456/branding \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "logo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "primaryColor": "#2563eb",
    "secondaryColor": "#1e40af",
    "fontFamily": "Inter",
    "customCSS": ".header { background: linear-gradient(90deg, #2563eb, #1e40af); }"
  }'
```

## 📋 Quotation Management Examples

### 1. Create Quotation

```bash
curl -X POST http://localhost:3001/api/v1/quotations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "E-commerce Website Development",
    "description": "Complete e-commerce platform with payment integration",
    "clientId": "client-789",
    "items": [
      {
        "name": "Frontend Development",
        "description": "React.js frontend with responsive design",
        "quantity": 1,
        "unitPrice": 5000,
        "taxRate": 20,
        "discount": 0
      },
      {
        "name": "Backend API",
        "description": "Node.js backend with PostgreSQL",
        "quantity": 1,
        "unitPrice": 4000,
        "taxRate": 20,
        "discount": 0
      },
      {
        "name": "Payment Integration",
        "description": "Stripe payment gateway integration",
        "quantity": 1,
        "unitPrice": 2000,
        "taxRate": 20,
        "discount": 0
      }
    ],
    "validUntil": "2024-02-15T00:00:00.000Z",
    "paymentTerms": "Net 30",
    "notes": "Project to be completed within 12 weeks",
    "templateId": "template-123"
  }'
```

### 2. Get Quotations with Filters

```bash
curl -X GET "http://localhost:3001/api/v1/quotations?status=pending&dateFrom=2024-01-01&search=website&page=1&limit=20" \
  -H "Authorization: Bearer <token>"
```

### 3. Update Quotation Status

```bash
curl -X PATCH http://localhost:3001/api/v1/quotations/quote-456/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "sent",
    "sentAt": "2024-01-15T10:30:00.000Z",
    "notes": "Quotation sent to client via email"
  }'
```

### 4. Add Quotation Items

```bash
curl -X POST http://localhost:3001/api/v1/quotations/quote-456/items \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SEO Optimization",
    "description": "Search engine optimization for better visibility",
    "quantity": 1,
    "unitPrice": 1500,
    "taxRate": 20,
    "discount": 0
  }'
```

## 📄 Template Management Examples

### 1. Create Quotation Template

```bash
curl -X POST http://localhost:3001/api/v1/templates \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Standard Service Template",
    "description": "Template for standard service quotations",
    "type": "service",
    "content": {
      "header": {
        "logo": true,
        "companyInfo": true,
        "clientInfo": true
      },
      "sections": [
        {
          "type": "items",
          "title": "Services",
          "showTax": true,
          "showDiscount": true
        },
        {
          "type": "terms",
          "title": "Terms & Conditions",
          "content": "Standard terms and conditions apply..."
        }
      ],
      "footer": {
        "total": true,
        "validity": true,
        "contactInfo": true
      }
    },
    "isDefault": false,
    "visibility": "company"
  }'
```

### 2. Apply Template to Quotation

```bash
curl -X POST http://localhost:3001/api/v1/quotations/quote-456/apply-template \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "template-123",
    "overwriteExisting": false
  }'
```

## 👥 Client Management Examples

### 1. Create Client

```bash
curl -X POST http://localhost:3001/api/v1/clients \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TechStart Inc",
    "email": "contact@techstart.com",
    "phone": "+1-555-0124",
    "company": "TechStart Inc",
    "position": "CTO",
    "address": {
      "street": "456 Innovation Blvd",
      "city": "Startup City",
      "state": "CA",
      "zipCode": "90211",
      "country": "USA"
    },
    "notes": "Startup company looking for MVP development",
    "tags": ["startup", "technology", "mvp"]
  }'
```

### 2. Search Clients

```bash
curl -X GET "http://localhost:3001/api/v1/clients/search?q=tech&fields=name,email,company&fuzzy=true" \
  -H "Authorization: Bearer <token>"
```

## 📁 File Management Examples

### 1. Upload File

```bash
curl -X POST http://localhost:3001/api/v1/files/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@document.pdf" \
  -F "category=quotation" \
  -F "metadata={\"quotationId\":\"quote-456\",\"type\":\"contract\"}"
```

### 2. Get Files with Filters

```bash
curl -X GET "http://localhost:3001/api/v1/files?category=quotation&dateFrom=2024-01-01&page=1&limit=20" \
  -H "Authorization: Bearer <token>"
```

### 3. Download File

```bash
curl -X GET http://localhost:3001/api/v1/files/file-123/download \
  -H "Authorization: Bearer <token>" \
  --output downloaded-file.pdf
```

## 📧 Notification Examples

### 1. Send Email Notification

```bash
curl -X POST http://localhost:3001/api/v1/notifications/email \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "client@example.com",
    "subject": "Your Quotation is Ready",
    "template": "quotation-sent",
    "data": {
      "quotationNumber": "Q-2024-001",
      "clientName": "John Doe",
      "totalAmount": 8400,
      "validUntil": "2024-02-15"
    }
  }'
```

### 2. Send Push Notification

```bash
curl -X POST http://localhost:3001/api/v1/notifications/push \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "title": "New Quotation Request",
    "body": "You have a new quotation request from TechStart Inc",
    "data": {
      "type": "quotation_request",
      "quotationId": "quote-789"
    }
  }'
```

## 📊 Analytics Examples

### 1. Get Revenue Analytics

```bash
curl -X GET "http://localhost:3001/api/v1/analytics/revenue?range=30d&groupBy=day" \
  -H "Authorization: Bearer <token>"
```

### 2. Get Quotation Analytics

```bash
curl -X GET "http://localhost:3001/api/v1/analytics/quotations?range=90d&status=accepted" \
  -H "Authorization: Bearer <token>"
```

### 3. Export Analytics Data

```bash
curl -X POST http://localhost:3001/api/v1/analytics/export \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "excel",
    "dateRange": "30d",
    "metrics": ["revenue", "conversions", "quotations"],
    "includeMetadata": true
  }'
```

## 🔗 Integration Examples

### 1. Create Webhook

```bash
curl -X POST http://localhost:3001/api/v1/webhooks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CRM Integration",
    "url": "https://crm.company.com/webhook",
    "events": ["quotation.created", "quotation.updated", "quotation.accepted"],
    "secret": "webhook-secret-123",
    "isActive": true,
    "retryCount": 3
  }'
```

### 2. Test Webhook

```bash
curl -X POST http://localhost:3001/api/v1/webhooks/webhook-123/test \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "quotation.created",
    "data": {
      "quotationId": "quote-456",
      "clientId": "client-789"
    }
  }'
```

## 🔑 API Key Management Examples

### 1. Create API Key

```bash
curl -X POST http://localhost:3001/api/v1/api-keys \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "External Integration Key",
    "description": "API key for CRM integration",
    "permissions": [
      "quotations:read",
      "clients:read",
      "analytics:read"
    ],
    "expiresAt": "2024-12-31T23:59:59.999Z"
  }'
```

### 2. List API Keys

```bash
curl -X GET http://localhost:3001/api/v1/api-keys \
  -H "Authorization: Bearer <token>"
```

### 3. Regenerate API Key

```bash
curl -X POST http://localhost:3001/api/v1/api-keys/api-key-123/regenerate \
  -H "Authorization: Bearer <token>"
```

## 📱 WebSocket Examples

### 1. Connect to Notifications

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001/notifications', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('connect', () => {
  console.log('Connected to notifications');
});

socket.on('notification', (data) => {
  console.log('New notification:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected from notifications');
});
```

### 2. Join Company Channel

```javascript
socket.emit('join', {
  companyId: 'company-456',
  userId: 'user-123'
});

socket.on('company_update', (data) => {
  console.log('Company update:', data);
});
```

## 🚀 Advanced Usage Examples

### 1. Batch Operations

```bash
curl -X POST http://localhost:3001/api/v1/quotations/batch \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "operations": [
      {
        "action": "create",
        "data": {
          "title": "Website Design",
          "clientId": "client-123",
          "items": [{"name": "Design", "quantity": 1, "unitPrice": 2000}]
        }
      },
      {
        "action": "update",
        "id": "quote-456",
        "data": {"status": "sent"}
      }
    ]
  }'
```

### 2. Advanced Search

```bash
curl -X POST http://localhost:3001/api/v1/search/advanced \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "website development",
    "filters": {
      "type": "quotation",
      "status": ["draft", "sent"],
      "dateRange": {
        "from": "2024-01-01",
        "to": "2024-12-31"
      },
      "amountRange": {
        "min": 1000,
        "max": 10000
      }
    },
    "sort": {
      "field": "createdAt",
      "order": "desc"
    },
    "pagination": {
      "page": 1,
      "limit": 20
    }
  }'
```

### 3. Data Export

```bash
curl -X POST http://localhost:3001/api/v1/export/quotations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "excel",
    "filters": {
      "status": "accepted",
      "dateFrom": "2024-01-01"
    },
    "fields": ["id", "number", "title", "clientName", "totalAmount", "status"],
    "includeMetadata": true,
    "filename": "accepted-quotations-2024"
  }'
```

## 🔍 Error Handling Examples

### 1. Validation Error Response

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Email must be a valid email address",
      "value": "invalid-email"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters long",
      "value": "123"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/users"
}
```

### 2. Rate Limit Error

```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "error": "Rate limit exceeded",
  "retryAfter": 60,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/quotations"
}
```

### 3. Authentication Error

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid or expired token",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/users/profile"
}
```

## 📚 SDK Usage Examples

### JavaScript/TypeScript

```typescript
import { QuotationApiClient } from '@company/quotation-api-client';

const client = new QuotationApiClient({
  baseUrl: 'https://api.company.com',
  apiKey: 'your-api-key'
});

// Create quotation
const quotation = await client.quotations.create({
  title: 'Website Development',
  clientId: 'client-123',
  items: [
    { name: 'Frontend', quantity: 1, unitPrice: 3000 }
  ]
});

// Get quotations with pagination
const quotations = await client.quotations.list({
  page: 1,
  limit: 20,
  status: 'pending'
});
```

### Python

```python
from quotation_api_client import QuotationApiClient

client = QuotationApiClient(
    base_url='https://api.company.com',
    api_key='your-api-key'
)

# Create quotation
quotation = client.quotations.create(
    title='Website Development',
    client_id='client-123',
    items=[
        {'name': 'Frontend', 'quantity': 1, 'unit_price': 3000}
    ]
)

# Get quotations with pagination
quotations = client.quotations.list(
    page=1,
    limit=20,
    status='pending'
)
```

## 🧪 Testing Examples

### 1. Test with Postman

1. **Import Collection**: Use the provided Postman collection
2. **Set Environment Variables**:
   - `base_url`: `http://localhost:3001`
   - `api_version`: `v1`
   - `auth_token`: Your JWT token
3. **Run Tests**: Execute the collection tests

### 2. Test with cURL

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test authentication
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test protected endpoint
curl -X GET http://localhost:3001/api/v1/users/profile \
  -H "Authorization: Bearer <token>"
```

### 3. Test with JavaScript

```javascript
// Test API endpoints
async function testAPI() {
  try {
    // Health check
    const health = await fetch('http://localhost:3001/health');
    console.log('Health:', await health.json());
    
    // Login
    const login = await fetch('http://localhost:3001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const { access_token } = await login.json();
    
    // Get profile
    const profile = await fetch('http://localhost:3001/api/v1/users/profile', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });
    
    console.log('Profile:', await profile.json());
  } catch (error) {
    console.error('API test failed:', error);
  }
}

testAPI();
```

## 📖 Best Practices

### 1. Error Handling

- Always check HTTP status codes
- Handle rate limiting gracefully
- Implement retry logic for transient errors
- Log errors for debugging

### 2. Authentication

- Store tokens securely
- Implement token refresh logic
- Use API keys for server-to-server communication
- Rotate API keys regularly

### 3. Performance

- Use pagination for large datasets
- Implement caching where appropriate
- Use batch operations for multiple items
- Monitor API usage and limits

### 4. Security

- Never log sensitive data
- Validate all input data
- Use HTTPS in production
- Implement proper access controls

---

*For more examples and detailed documentation, visit the Swagger UI at `/api/docs`*
