# Outil de Devis en Ligne - Online Quotation Tool

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Screenshots](#screenshots)
3. [Architecture](#architecture)
4. [Technology Stack](#technology-stack)
5. [Features & Functionalities](#features--functionalities)
6. [Project Structure](#project-structure)
7. [Setup & Installation](#setup--installation)
8. [Development Guide](#development-guide)
9. [Deployment](#deployment)
10. [API Documentation](#api-documentation)
11. [Contributing](#contributing)

---

## 🎯 Project Overview

The Online Quotation Tool is a comprehensive multi-platform solution that enables businesses to create, manage, and track quotations efficiently. The system provides web and mobile interfaces for both clients and administrators, with a robust backend API.

### Key Objectives
- Streamline quotation creation and management process
- Provide real-time quotation tracking and status updates
- Enable multi-platform access (web, mobile)
- Ensure scalable and maintainable architecture
- Implement secure user authentication and authorization

---

## 📸 Screenshots

### Landing Page
![Landing Page](./screenshots/Screenshot%202025-08-24%20at%2011.18.20.png)
*Professional landing page with product presentation, pricing, and waitlist signup*

### Product Features
![Product Features](./screenshots/Screenshot%202025-08-24%20at%2011.18.29.png)
*Key features and benefits of the quotation tool*

### Pricing Plans
![Pricing Plans](./screenshots/Screenshot%202025-08-24%20at%2011.18.52.png)
*Transparent pricing with monthly and annual subscription options*

### Contact & Information
![Contact & Information](./screenshots/Screenshot%202025-08-24%20at%2011.19.32.png)
*Contact form and detailed information about the platform*

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │  Mobile Client  │    │   Admin Panel   │
│   (React.js)    │    │ (React Native)  │    │   (React.js)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Load Balancer │
                    │     (AWS ALB)   │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Backend API   │
                    │   (NestJS)      │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │     Redis       │    │   File Storage  │
│   Database      │    │     Cache       │    │   (AWS S3)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 💻 Technology Stack

### Frontend - Web Application
- **Framework**: React.js 18+
- **State Management**: Redux Toolkit + RTK Query
- **Styling**: Tailwind CSS
- **UI Components**: Material-UI or Ant Design
- **Form Management**: React Hook Form + Yup validation
- **PDF Generation**: jsPDF / React-PDF
- **Charts**: Chart.js or Recharts

### Mobile Application
- **Framework**: React Native 0.72+
- **Navigation**: React Navigation 6
- **State Management**: Redux Toolkit
- **UI Components**: NativeBase or React Native Elements
- **Local Storage**: AsyncStorage
- **Push Notifications**: React Native Push Notification

### Backend API
- **Framework**: NestJS 10+
- **Language**: TypeScript
- **Database ORM**: TypeORM or Prisma
- **Authentication**: JWT + Passport.js
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **File Upload**: Multer
- **Email Service**: Nodemailer

### Database & Storage
- **Primary Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **File Storage**: AWS S3
- **Search Engine**: Elasticsearch (optional)

### DevOps & Infrastructure
- **Containerization**: Docker + Docker Compose
- **Infrastructure as Code**: Terraform
- **Cloud Platform**: AWS
- **Container Orchestration**: AWS ECS or EKS
- **CI/CD**: GitHub Actions or AWS CodePipeline
- **Monitoring**: AWS CloudWatch + Prometheus

---

## 🚀 Features & Functionalities

### Core Features

#### 1. User Management
- **Multi-role Authentication**
  - Client registration and login
  - Admin/Staff authentication
  - Role-based access control (RBAC)
  - Password reset functionality
  - Two-factor authentication (2FA)

#### 2. Quotation Management
- **Quotation Creation**
  - Dynamic form builder for different service types
  - Item/service catalog with pricing
  - Quantity and pricing calculations
  - Tax calculations (VAT, local taxes)
  - Discount management
  - Terms and conditions customization

- **Quotation Templates**
  - Pre-built templates for common services
  - Custom template creation
  - Template versioning
  - Brand customization (logo, colors, fonts)

- **Quotation Lifecycle**
  - Draft → Pending → Approved → Rejected → Expired
  - Automatic expiration handling
  - Revision management
  - Conversion to invoice

#### 3. Client Portal
- **Dashboard**
  - Overview of all quotations
  - Status tracking
  - Recent activity feed
  - Quick actions panel

- **Quotation Interaction**
  - View detailed quotations
  - Accept/reject quotations
  - Request modifications
  - Download PDF versions
  - Digital signature capability

#### 4. Admin Panel
- **Analytics Dashboard**
  - Quotation metrics (conversion rates, average values)
  - Revenue projections
  - Client activity analytics
  - Performance reports

- **Business Management**
  - Service/product catalog management
  - Pricing rule configuration
  - Tax rate management
  - Company profile settings

#### 5. Communication
- **Notifications**
  - Real-time push notifications (mobile)
  - Email notifications
  - SMS notifications (optional)
  - In-app notification center

- **Messaging System**
  - Internal messaging between admin and clients
  - Comment system on quotations
  - Automated follow-up messages

#### 6. Document Management
- **PDF Generation**
  - Professional quotation PDFs
  - Branded document templates
  - Multi-language support
  - Digital watermarking

- **File Attachments**
  - Technical specifications upload
  - Image attachments
  - Document versioning
  - Secure file storage

### Advanced Features

#### 1. Integration Capabilities
- **CRM Integration**
  - Salesforce, HubSpot compatibility
  - Customer data synchronization
  - Lead management integration

- **Accounting Software**
  - QuickBooks integration
  - Sage compatibility
  - Automatic invoice generation

- **Payment Gateways**
  - Stripe integration
  - PayPal support
  - Bank transfer handling

#### 2. Automation
- **Workflow Automation**
  - Automatic quotation routing
  - Approval workflows
  - Follow-up sequences
  - Expiration reminders

- **Smart Pricing**
  - Dynamic pricing rules
  - Volume discounts
  - Seasonal pricing
  - Competitor price monitoring

#### 3. Reporting & Analytics
- **Business Intelligence**
  - Conversion funnel analysis
  - Customer lifetime value
  - Seasonal trend analysis
  - Performance benchmarking

- **Export Capabilities**
  - CSV/Excel exports
  - PDF report generation
  - API data access
  - Scheduled reports

---

## 📁 Project Structure

```
online-quotation-tool/
├── README.md
├── docker-compose.yml
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── modules/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── auth/
│   │   ├── quotations/
│   │   ├── users/
│   │   ├── notifications/
│   │   ├── common/
│   │   └── database/
│   └── test/
├── frontend-web/
│   ├── Dockerfile
│   ├── package.json
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── services/
│   │   └── utils/
│   └── build/
├── mobile-app/
│   ├── package.json
│   ├── android/
│   ├── ios/
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── store/
│   │   ├── services/
│   │   └── utils/
│   └── __tests__/
├── docs/
│   ├── api.md
│   ├── deployment.md
│   └── user-guide.md
└── scripts/
    ├── setup.sh
    ├── deploy.sh
    └── backup.sh
```

---

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- Docker and Docker Compose
- AWS CLI configured
- Terraform installed
- Git

### Local Development Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/your-org/online-quotation-tool.git
cd online-quotation-tool
```

#### 2. Environment Configuration
```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend-web/.env.example frontend-web/.env
cp mobile-app/.env.example mobile-app/.env

# Edit environment variables
nano backend/.env
nano frontend-web/.env
nano mobile-app/.env
```

#### 3. Start Development Environment
```bash
# Start all services with Docker Compose
docker-compose up -d

# Install dependencies
cd backend && npm install
cd ../frontend-web && npm install
cd ../mobile-app && npm install
```

#### 4. Database Setup
```bash
# Run database migrations
cd backend
npm run migration:run

# Seed initial data
npm run seed
```

#### 5. Start Development Servers
```bash
# Terminal 1 - Backend API
cd backend
npm run start:dev

# Terminal 2 - Web Frontend
cd frontend-web
npm start

# Terminal 3 - Mobile App
cd mobile-app
npx react-native start
npx react-native run-android # or run-ios
```

---

## 🔧 Development Guide

### Backend Development (NestJS)

#### Project Structure
```
backend/src/
├── main.ts              # Application entry point
├── app.module.ts        # Root module
├── auth/               # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── guards/
│   └── strategies/
├── quotations/         # Quotation management
│   ├── quotations.controller.ts
│   ├── quotations.service.ts
│   ├── quotations.module.ts
│   ├── dto/
│   └── entities/
├── users/              # User management
├── notifications/      # Notification system
├── common/            # Shared utilities
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
└── database/          # Database configuration
    ├── migrations/
    └── seeds/
```

#### Key Commands
```bash
# Generate new module
nest g module quotations

# Generate controller
nest g controller quotations

# Generate service
nest g service quotations

# Run tests
npm run test
npm run test:e2e

# Build for production
npm run build
```

### Frontend Web Development (React.js)

#### Project Structure
```
frontend-web/src/
├── components/         # Reusable components
│   ├── common/
│   ├── forms/
│   ├── layout/
│   └── ui/
├── pages/             # Page components
│   ├── auth/
│   ├── dashboard/
│   ├── quotations/
│   └── profile/
├── hooks/             # Custom React hooks
├── store/             # Redux store configuration
│   ├── index.ts
│   ├── slices/
│   └── api/
├── services/          # API services
├── utils/             # Utility functions
├── constants/         # Application constants
└── types/            # TypeScript type definitions
```

#### Key Commands
```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Type checking
npm run type-check
```

### Mobile App Development (React Native)

#### Project Structure
```
mobile-app/src/
├── components/        # Reusable components
├── screens/          # Screen components
├── navigation/       # Navigation configuration
├── store/           # Redux store
├── services/        # API services
├── utils/          # Utility functions
├── constants/      # App constants
├── assets/        # Images, fonts, etc.
└── types/        # TypeScript types
```

#### Key Commands
```bash
# Start Metro bundler
npx react-native start

# Run on Android
npx react-native run-android

# Run on iOS
npx react-native run-ios

# Build for production
cd android && ./gradlew assembleRelease

# Generate APK
cd android && ./gradlew bundleRelease
```

---

## 🚀 Deployment

### Infrastructure Setup with Terraform

#### 1. AWS Infrastructure
```hcl
# terraform/main.tf
provider "aws" {
  region = var.aws_region
}

# VPC and Networking
module "vpc" {
  source = "./modules/vpc"
  
  cidr_block           = "10.0.0.0/16"
  availability_zones   = ["us-west-2a", "us-west-2b"]
  public_subnets      = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets     = ["10.0.3.0/24", "10.0.4.0/24"]
}

# ECS Cluster
module "ecs" {
  source = "./modules/ecs"
  
  cluster_name = "quotation-tool"
  vpc_id       = module.vpc.vpc_id
  subnets      = module.vpc.private_subnets
}

# RDS Database
module "database" {
  source = "./modules/rds"
  
  identifier     = "quotation-db"
  engine        = "postgres"
  engine_version = "15.3"
  instance_class = "db.t3.micro"
  
  db_name  = "quotation_tool"
  username = var.db_username
  password = var.db_password
}

# Redis Cache
module "redis" {
  source = "./modules/elasticache"
  
  cluster_id      = "quotation-cache"
  node_type       = "cache.t3.micro"
  num_cache_nodes = 1
}

# S3 Bucket for file storage
module "s3" {
  source = "./modules/s3"
  
  bucket_name = "quotation-tool-files"
  versioning  = true
}
```

#### 2. Deploy Infrastructure
```bash
cd terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var-file="prod.tfvars"

# Apply changes
terraform apply -var-file="prod.tfvars"
```

### Docker Configuration

#### Backend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: quotation_tool
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend-web
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend-web && npm ci
      
      - name: Run tests
        run: |
          cd backend && npm test
          cd ../frontend-web && npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-west-2
      
      - name: Build and push Docker images
        run: |
          docker build -t quotation-backend ./backend
          docker build -t quotation-frontend ./frontend-web
          
          aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REGISTRY
          
          docker tag quotation-backend:latest $ECR_REGISTRY/quotation-backend:latest
          docker tag quotation-frontend:latest $ECR_REGISTRY/quotation-frontend:latest
          
          docker push $ECR_REGISTRY/quotation-backend:latest
          docker push $ECR_REGISTRY/quotation-frontend:latest
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster quotation-tool --service backend --force-new-deployment
          aws ecs update-service --cluster quotation-tool --service frontend --force-new-deployment
```

---

## 📚 API Documentation

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "companyName": "Acme Corp",
  "role": "client"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### POST /auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Quotation Endpoints

#### GET /quotations
Get all quotations for authenticated user.

**Query Parameters:**
- `page` (number): Page number for pagination
- `limit` (number): Items per page
- `status` (string): Filter by status
- `search` (string): Search term

**Response:**
```json
{
  "success": true,
  "data": {
    "quotations": [
      {
        "id": "uuid",
        "number": "QUO-2024-001",
        "title": "Website Development",
        "status": "pending",
        "totalAmount": 5000.00,
        "createdAt": "2024-01-15T10:30:00Z",
        "expiresAt": "2024-02-15T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

#### POST /quotations
Create a new quotation.

**Request Body:**
```json
{
  "title": "Website Development Project",
  "description": "Complete website redesign and development",
  "clientId": "client_uuid",
  "items": [
    {
      "name": "Frontend Development",
      "description": "React.js frontend development",
      "quantity": 1,
      "unitPrice": 3000.00
    },
    {
      "name": "Backend Development",
      "description": "Node.js API development",
      "quantity": 1,
      "unitPrice": 2000.00
    }
  ],
  "taxes": [
    {
      "name": "VAT",
      "rate": 20,
      "amount": 1000.00
    }
  ],
  "discount": {
    "type": "percentage",
    "value": 10
  },
  "validUntil": "2024-02-15T23:59:59Z",
  "terms": "Payment within 30 days of acceptance"
}
```

### User Management Endpoints

#### GET /users/profile
Get current user profile.

#### PUT /users/profile
Update user profile.

#### GET /users/notifications
Get user notifications.

#### PUT /users/notifications/:id/read
Mark notification as read.

### File Upload Endpoints

#### POST /files/upload
Upload file attachment.

**Request:** Multipart form data with file

**Response:**
```json
{
  "success": true,
  "data": {
    "fileId": "uuid",
    "fileName": "document.pdf",
    "fileSize": 1024000,
    "mimeType": "application/pdf",
    "url": "https://s3.amazonaws.com/bucket/path/to/file"
  }
}
```

---

## 🤝 Contributing

### Development Workflow

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-username/online-quotation-tool.git
   cd online-quotation-tool
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/quotation-templates
   ```

3. **Make Changes and Test**
   ```bash
   # Make your changes
   npm test
   npm run lint
   ```

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add quotation template system"
   git push origin feature/quotation-templates
   ```

5. **Create Pull Request**

### Code Standards

#### Backend (NestJS)
- Use TypeScript strict mode
- Follow NestJS naming conventions
- Implement proper error handling
- Write unit tests for services
- Document APIs with Swagger

#### Frontend (React)
- Use functional components with hooks
- Implement proper TypeScript typing
- Follow React best practices
- Write component tests
- Use meaningful component names

#### Mobile (React Native)
- Follow React Native best practices
- Implement proper navigation structure
- Handle platform-specific code
- Test on both iOS and Android
- Optimize for performance

### Testing Guidelines

#### Unit Tests
```bash
# Backend tests
cd backend && npm run test

# Frontend tests
cd frontend-web && npm run test

# Mobile tests
cd mobile-app && npm run test
```

#### Integration Tests
```bash
# API integration tests
cd backend && npm run test:e2e

# Frontend integration tests
cd frontend-web && npm run test:integration
```

#### End-to-End Tests
```bash
# Using Playwright or Cypress
npm run test:e2e
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For support and questions:
- Email: support@quotation-tool.com
- Documentation: https://docs.quotation-tool.com
- Issue Tracker: https://github.com/your-org/online-quotation-tool/issues

---

## 🗺️ Roadmap

### Phase 1 (Q1 2024)
- ✅ Core quotation management
- ✅ User authentication
- ✅ Basic web interface
- ✅ Mobile app MVP

### Phase 2 (Q2 2024)
- 🔄 Advanced quotation templates
- 🔄 PDF generation system
- 🔄 Email notifications
- 🔄 Payment integration

### Phase 3 (Q3 2024)
- ⏳ CRM integrations
- ⏳ Advanced analytics
- ⏳ Multi-language support
- ⏳ API for third-party integrations

### Phase 4 (Q4 2024)
- ⏳ AI-powered quotation suggestions
- ⏳ Advanced workflow automation
- ⏳ Enterprise features
- ⏳ White-label solution

---

## 🔗 Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [Terraform Documentation](https://developer.hashicorp.com/terraform)
- [AWS Documentation](https://docs.aws.amazon.com/)

---

*Last updated: August 2025*