# Terraform Infrastructure Setup Guide

## Prerequisites

1. **Terraform installed** (version >= 1.0)
2. **AWS CLI configured** with appropriate credentials
3. **S3 bucket created** for Terraform state storage
4. **DynamoDB table created** for state locking

## Step 1: Initialize Terraform

```bash
cd terraform

# Initialize Terraform with S3 backend
terraform init \
  -backend-config="bucket=quotation-tool-terraform-state" \
  -backend-config="key=global/s3/terraform.tfstate" \
  -backend-config="region=us-west-2" \
  -backend-config="dynamodb_table=quotation-tool-terraform-locks"
```

## Step 2: Create Environment-Specific Configuration

### Development Environment
```bash
# Create dev.tfvars
cat > environments/dev/dev.tfvars << EOF
environment = "dev"
aws_region = "us-west-2"
db_username = "dev_user"
db_password = "dev_password_123"
domain_name = "dev.quotation-tool.example.com"
instance_type = "t3.micro"
min_size = 1
max_size = 2
desired_capacity = 1
db_instance_class = "db.t3.micro"
redis_node_type = "cache.t3.micro"
enable_monitoring = false
backup_retention_period = 1
EOF
```

### Staging Environment
```bash
# Create staging.tfvars
cat > environments/staging/staging.tfvars << EOF
environment = "staging"
aws_region = "us-west-2"
db_username = "staging_user"
db_password = "staging_password_456"
domain_name = "staging.quotation-tool.example.com"
instance_type = "t3.small"
min_size = 2
max_size = 4
desired_capacity = 2
db_instance_class = "db.t3.small"
redis_node_type = "cache.t3.small"
enable_monitoring = true
backup_retention_period = 3
EOF
```

### Production Environment
```bash
# Create prod.tfvars
cat > environments/prod/prod.tfvars << EOF
environment = "prod"
aws_region = "us-west-2"
db_username = "prod_user"
db_password = "prod_password_789"
domain_name = "quotation-tool.example.com"
instance_type = "t3.medium"
min_size = 3
max_size = 10
desired_capacity = 3
db_instance_class = "db.t3.medium"
redis_node_type = "cache.t3.medium"
enable_monitoring = true
backup_retention_period = 7
EOF
```

## Step 3: Plan Infrastructure Deployment

### Development
```bash
cd environments/dev
terraform plan -var-file="dev.tfvars" -out=dev.tfplan
```

### Staging
```bash
cd environments/staging
terraform plan -var-file="staging.tfvars" -out=staging.tfplan
```

### Production
```bash
cd environments/prod
terraform plan -var-file="prod.tfvars" -out=prod.tfplan
```

## Step 4: Apply Infrastructure

### Development
```bash
cd environments/dev
terraform apply "dev.tfplan"
```

### Staging
```bash
cd environments/staging
terraform apply "staging.tfplan"
```

### Production
```bash
cd environments/prod
terraform apply "prod.tfplan"
```

## Step 5: Verify Infrastructure

```bash
# Check all resources
terraform show

# List outputs
terraform output

# Test connectivity
aws ecs list-clusters
aws rds describe-db-instances
aws elasticache describe-cache-clusters
```

## Important Notes

### Security Considerations
- **Never commit** `.tfvars` files to version control
- **Use AWS Secrets Manager** for production passwords
- **Enable encryption** for all resources
- **Restrict access** using IAM policies

### Cost Optimization
- **Use Spot instances** for non-critical workloads
- **Enable auto-scaling** based on demand
- **Monitor costs** with CloudWatch and Cost Explorer
- **Use reserved instances** for predictable workloads

### Backup Strategy
- **Enable automated backups** for RDS
- **Configure S3 versioning** for file storage
- **Set up cross-region replication** for critical data
- **Test restore procedures** regularly

## Troubleshooting

### Common Issues

1. **State Lock Issues**
   ```bash
   # Force unlock if needed
   terraform force-unlock <LOCK_ID>
   ```

2. **Permission Errors**
   - Verify IAM user/role has required permissions
   - Check AWS credentials are valid
   - Ensure S3 bucket and DynamoDB table exist

3. **Resource Creation Failures**
   - Check AWS service limits
   - Verify subnet CIDR blocks don't conflict
   - Ensure VPC has internet connectivity

### Rollback Procedures

```bash
# Rollback to previous state
terraform plan -var-file="<env>.tfvars" -out=rollback.tfplan
terraform apply "rollback.tfplan"

# Or destroy and recreate
terraform destroy -var-file="<env>.tfvars"
```

## Next Steps

After infrastructure is deployed:
1. **Configure DNS** in Route 53
2. **Set up SSL certificates** in ACM
3. **Deploy applications** to ECS
4. **Configure monitoring** and alerting
5. **Set up CI/CD pipeline**
