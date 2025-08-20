# CI/CD Pipeline Setup Guide

## Overview

This guide sets up a complete CI/CD pipeline using GitHub Actions for the Online Quotation Tool project.

## Prerequisites

1. **GitHub repository** with the project code
2. **AWS credentials** configured as GitHub secrets
3. **ECR repositories** created in AWS
4. **ECS cluster** running with services configured

## Step 1: GitHub Secrets Configuration

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add the following secrets:

### AWS Credentials
```
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-west-2
```

### ECR Configuration
```
ECR_REGISTRY=your_account_id.dkr.ecr.us-west-2.amazonaws.com
ECR_REPOSITORY_BACKEND=quotation-backend
ECR_REPOSITORY_FRONTEND=quotation-frontend
ECR_REPOSITORY_ADMIN=quotation-admin
```

### ECS Configuration
```
ECS_CLUSTER_NAME=quotation-tool-dev
ECS_SERVICE_BACKEND=quotation-tool-dev-backend
ECS_SERVICE_FRONTEND=quotation-tool-dev-frontend
ECS_SERVICE_ADMIN=quotation-tool-dev-admin
```

### Environment Variables
```
NODE_ENV=development
NPM_TOKEN=your_npm_token_if_needed
```

## Step 2: GitHub Actions Workflow Files

### Main CI/CD Workflow

Create `.github/workflows/main.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  AWS_REGION: us-west-2
  ECR_REGISTRY: ${{ secrets.ECR_REGISTRY }}

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend-web && npm ci
          cd ../admin-panel && npm ci
          
      - name: Run backend tests
        run: |
          cd backend
          npm run test
          npm run test:e2e
          
      - name: Run frontend tests
        run: |
          cd frontend-web
          npm run test
          npm run build
          
      - name: Run admin tests
        run: |
          cd admin-panel
          npm run test
          npm run build
          
      - name: Run linting
        run: |
          cd backend && npm run lint
          cd ../frontend-web && npm run lint
          cd ../admin-panel && npm run lint

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
          
      - name: Upload Trivy scan results to GitHub Security tab
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'

  build-and-push:
    name: Build and Push Docker Images
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
          
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
        
      - name: Build, tag, and push backend image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: ${{ secrets.ECR_REPOSITORY_BACKEND }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd backend
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:latest .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT
          
      - name: Build, tag, and push frontend image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: ${{ secrets.ECR_REPOSITORY_FRONTEND }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd frontend-web
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:latest .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT
          
      - name: Build, tag, and push admin image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: ${{ secrets.ECR_REPOSITORY_ADMIN }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd admin-panel
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:latest .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

  deploy-dev:
    name: Deploy to Development
    runs-on: ubuntu-latest
    needs: build-and-push
    if: github.ref == 'refs/heads/develop'
    environment: development
    
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
          
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster ${{ secrets.ECS_CLUSTER_NAME }} \
            --service ${{ secrets.ECS_SERVICE_BACKEND }} \
            --force-new-deployment
          
          aws ecs update-service \
            --cluster ${{ secrets.ECS_CLUSTER_NAME }} \
            --service ${{ secrets.ECS_SERVICE_FRONTEND }} \
            --force-new-deployment
          
          aws ecs update-service \
            --cluster ${{ secrets.ECS_CLUSTER_NAME }} \
            --service ${{ secrets.ECS_SERVICE_ADMIN }} \
            --force-new-deployment
          
      - name: Wait for deployment to complete
        run: |
          aws ecs wait services-stable \
            --cluster ${{ secrets.ECS_CLUSTER_NAME }} \
            --services ${{ secrets.ECS_SERVICE_BACKEND }} ${{ secrets.ECS_SERVICE_FRONTEND }} ${{ secrets.ECS_SERVICE_ADMIN }}

  deploy-prod:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build-and-push
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
          
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster quotation-tool-prod \
            --service quotation-tool-prod-backend \
            --force-new-deployment
          
          aws ecs update-service \
            --cluster quotation-tool-prod \
            --service quotation-tool-prod-frontend \
            --force-new-deployment
          
          aws ecs update-service \
            --cluster quotation-tool-prod \
            --service quotation-tool-prod-admin \
            --force-new-deployment
          
      - name: Wait for deployment to complete
        run: |
          aws ecs wait services-stable \
            --cluster quotation-tool-prod \
            --services quotation-tool-prod-backend quotation-tool-prod-frontend quotation-tool-prod-admin

  notify:
    name: Notify Team
    runs-on: ubuntu-latest
    needs: [deploy-dev, deploy-prod]
    if: always()
    
    steps:
      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
        if: always()
```

### Pull Request Workflow

Create `.github/workflows/pr.yml`:

```yaml
name: Pull Request Checks

on:
  pull_request:
    branches: [main, develop]

jobs:
  code-quality:
    name: Code Quality
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend-web && npm ci
          cd ../admin-panel && npm ci
          
      - name: Run ESLint
        run: |
          cd backend && npm run lint
          cd ../frontend-web && npm run lint
          cd ../admin-panel && npm run lint
          
      - name: Run Prettier check
        run: |
          cd backend && npm run format:check
          cd ../frontend-web && npm run format:check
          cd ../admin-panel && npm run format:check
          
      - name: Run type checking
        run: |
          cd backend && npm run type-check
          cd ../frontend-web && npm run type-check
          cd ../admin-panel && npm run type-check

  security:
    name: Security Scan
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
          
      - name: Upload Trivy scan results to GitHub Security tab
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'
```

## Step 3: Environment Protection Rules

### Development Environment
- **Required reviewers**: 1
- **Wait timer**: 0 minutes
- **Deployment branches**: `develop`

### Production Environment
- **Required reviewers**: 2
- **Wait timer**: 5 minutes
- **Deployment branches**: `main`
- **Required status checks**: All must pass

## Step 4: Branch Protection Rules

Go to Settings → Branches and configure:

### Main Branch
- ✅ Require a pull request before merging
- ✅ Require approvals (2 reviewers)
- ✅ Dismiss stale PR approvals when new commits are pushed
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging

### Develop Branch
- ✅ Require a pull request before merging
- ✅ Require approvals (1 reviewer)
- ✅ Require status checks to pass before merging

## Step 5: Automated Testing

### Backend Tests
```bash
# Unit tests
npm run test

# Integration tests
npm run test:e2e

# Coverage report
npm run test:cov
```

### Frontend Tests
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## Step 6: Monitoring and Alerting

### CloudWatch Alarms
- **ECS Service Health**: Monitor service health checks
- **CPU Utilization**: Alert on high CPU usage
- **Memory Utilization**: Alert on high memory usage
- **Error Rate**: Monitor 4xx and 5xx errors

### GitHub Notifications
- **Deployment status** to Slack/Teams
- **Failed builds** notifications
- **Security vulnerabilities** alerts

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for syntax errors in code

2. **Deployment Failures**
   - Verify ECS services exist
   - Check IAM permissions
   - Verify ECR repository access

3. **Test Failures**
   - Run tests locally first
   - Check test environment configuration
   - Verify database connectivity

### Rollback Procedures

```bash
# Rollback to previous ECS task definition
aws ecs update-service \
  --cluster <cluster-name> \
  --service <service-name> \
  --task-definition <previous-task-definition-arn>
```

## Next Steps

After CI/CD is set up:
1. **Configure monitoring** and alerting
2. **Set up performance testing**
3. **Implement blue-green deployments**
4. **Add security scanning** to the pipeline
5. **Set up automated rollbacks**
