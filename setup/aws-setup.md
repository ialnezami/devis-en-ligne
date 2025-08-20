# AWS Initial Setup Guide

## Prerequisites
- AWS Account
- Administrator access
- AWS CLI installed

## Step 1: Create AWS Account and Configure Billing Alerts

### 1.1 Create AWS Account
1. Go to [AWS Console](https://aws.amazon.com/)
2. Click "Create an AWS Account"
3. Follow the registration process
4. Verify your email and phone number
5. Complete the account setup

### 1.2 Configure Billing Alerts
1. Go to AWS Billing Console
2. Click "Billing Preferences"
3. Enable "Receive Billing Alerts"
4. Set up CloudWatch billing alarms:
   - Go to CloudWatch → Alarms
   - Create alarm for estimated charges
   - Set threshold (e.g., $50, $100, $200)
   - Configure SNS notifications

## Step 2: Set up IAM Users and Roles

### 2.1 Create IAM Admin User
```bash
# Create admin user (do this from root account)
aws iam create-user --user-name admin-user
aws iam attach-user-policy --user-name admin-user --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```

### 2.2 Create IAM Roles for Applications
```bash
# Create ECS Task Execution Role
aws iam create-role --role-name ECS-TaskExecutionRole --assume-role-policy-document file://ecs-task-execution-trust-policy.json

# Create ECS Service Role
aws iam create-role --role-name ECS-ServiceRole --assume-role-policy-document file://ecs-service-trust-policy.json

# Create Lambda Execution Role (if needed)
aws iam create-role --role-name LambdaExecutionRole --assume-role-policy-document file://lambda-trust-policy.json
```

### 2.3 Create IAM Policies
```bash
# Create custom policies for specific services
aws iam create-policy --policy-name QuotationToolS3Policy --policy-document file://s3-policy.json
aws iam create-policy --policy-name QuotationToolRDSPolicy --policy-document file://rds-policy.json
```

## Step 3: Configure AWS CLI and Credentials

### 3.1 Install AWS CLI
```bash
# macOS
brew install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Windows
# Download from AWS website
```

### 3.2 Configure AWS Credentials
```bash
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key
# Enter your default region (e.g., us-west-2)
# Enter your output format (json)
```

### 3.3 Create Named Profiles
```bash
# Create different profiles for different environments
aws configure --profile dev
aws configure --profile staging
aws configure --profile prod
```

## Step 4: Create S3 Bucket for Terraform State

### 4.1 Create S3 Bucket
```bash
# Create bucket for Terraform state
aws s3 mb s3://quotation-tool-terraform-state --region us-west-2

# Enable versioning
aws s3api put-bucket-versioning --bucket quotation-tool-terraform-state --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption --bucket quotation-tool-terraform-state --server-side-encryption-configuration '{
  "Rules": [
    {
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }
  ]
}'
```

### 4.2 Create DynamoDB Table for State Locking
```bash
aws dynamodb create-table \
  --table-name quotation-tool-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-west-2
```

## Step 5: Set up AWS Organizations (Optional)

### 5.1 Create Organization
```bash
# Only from the master account
aws organizations create-organization --feature-set ALL
```

### 5.2 Create Member Accounts
```bash
# Create development account
aws organizations create-account \
  --email dev@yourcompany.com \
  --account-name "Development" \
  --role-name OrganizationAccountAccessRole

# Create staging account
aws organizations create-account \
  --email staging@yourcompany.com \
  --account-name "Staging" \
  --role-name OrganizationAccountAccessRole

# Create production account
aws organizations create-account \
  --email prod@yourcompany.com \
  --account-name "Production" \
  --role-name OrganizationAccountAccessRole
```

## Security Best Practices

### 5.3 Enable MFA for Root Account
1. Go to IAM → Users → Root user
2. Click "Security credentials"
3. Enable MFA device
4. Use hardware device or authenticator app

### 5.4 Enable CloudTrail
```bash
aws cloudtrail create-trail \
  --name quotation-tool-trail \
  --s3-bucket-name quotation-tool-logs \
  --is-multi-region-trail
```

### 5.5 Enable GuardDuty
```bash
aws guardduty create-detector \
  --enable \
  --region us-west-2
```

## Next Steps
After completing this setup:
1. Proceed to Terraform Infrastructure setup
2. Configure environment-specific variables
3. Set up CI/CD pipeline
4. Configure monitoring and alerting

## Important Notes
- Never commit AWS credentials to version control
- Use IAM roles instead of access keys when possible
- Regularly rotate access keys
- Monitor AWS costs and set up budget alerts
- Follow the principle of least privilege for IAM policies
