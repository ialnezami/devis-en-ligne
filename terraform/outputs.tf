# Outputs for Online Quotation Tool Infrastructure

output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "vpc_cidr" {
  description = "CIDR block of the VPC"
  value       = module.vpc.vpc_cidr
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = module.vpc.private_subnet_ids
}

output "ecs_cluster_id" {
  description = "ID of the ECS cluster"
  value       = module.ecs.cluster_id
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = module.ecs.cluster_name
}

output "ecs_cluster_arn" {
  description = "ARN of the ECS cluster"
  value       = module.ecs.cluster_arn
}

output "rds_instance_id" {
  description = "ID of the RDS instance"
  value       = module.database.instance_id
}

output "rds_endpoint" {
  description = "Endpoint of the RDS instance"
  value       = module.database.endpoint
}

output "rds_port" {
  description = "Port of the RDS instance"
  value       = module.database.port
}

output "redis_endpoint" {
  description = "Endpoint of the Redis cluster"
  value       = module.redis.endpoint
}

output "redis_port" {
  description = "Port of the Redis cluster"
  value       = module.redis.port
}

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.alb.dns_name
}

output "alb_zone_id" {
  description = "Zone ID of the Application Load Balancer"
  value       = module.alb.zone_id
}

output "cloudfront_domain" {
  description = "Domain name of the CloudFront distribution"
  value       = module.cloudfront.domain_name
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = module.cloudfront.distribution_id
}

output "s3_bucket_names" {
  description = "Names of the S3 buckets"
  value       = module.s3.bucket_names
}

output "s3_bucket_arns" {
  description = "ARNs of the S3 buckets"
  value       = module.s3.bucket_arns
}

output "ecr_repository_urls" {
  description = "URLs of the ECR repositories"
  value       = module.ecr.repository_urls
}

output "ecr_repository_names" {
  description = "Names of the ECR repositories"
  value       = module.ecr.repository_names
}

output "acm_certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = module.acm.certificate_arn
}

output "route53_name_servers" {
  description = "Name servers for the Route 53 hosted zone"
  value       = module.route53.name_servers
}

output "route53_zone_id" {
  description = "ID of the Route 53 hosted zone"
  value       = module.route53.zone_id
}

output "iam_role_arns" {
  description = "ARNs of the IAM roles"
  value       = module.iam.role_arns
}

output "iam_policy_arns" {
  description = "ARNs of the IAM policies"
  value       = module.iam.policy_arns
}

output "cloudwatch_log_group_names" {
  description = "Names of the CloudWatch log groups"
  value       = module.cloudwatch.log_group_names
}

output "cloudwatch_dashboard_names" {
  description = "Names of the CloudWatch dashboards"
  value       = module.cloudwatch.dashboard_names
}

# Security Group IDs
output "alb_security_group_id" {
  description = "ID of the ALB security group"
  value       = module.vpc.alb_security_group_id
}

output "ecs_security_group_id" {
  description = "ID of the ECS security group"
  value       = module.vpc.ecs_security_group_id
}

output "database_security_group_id" {
  description = "ID of the database security group"
  value       = module.vpc.database_security_group_id
}

output "cache_security_group_id" {
  description = "ID of the cache security group"
  value       = module.vpc.cache_security_group_id
}

# Environment Information
output "environment" {
  description = "Current environment"
  value       = var.environment
}

output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
}

output "account_id" {
  description = "AWS account ID"
  value       = data.aws_caller_identity.current.account_id
}

# URLs for applications
output "backend_url" {
  description = "URL for the backend API"
  value       = "https://${var.domain_name}/api"
}

output "frontend_url" {
  description = "URL for the frontend application"
  value       = "https://${var.domain_name}"
}

output "admin_url" {
  description = "URL for the admin panel"
  value       = "https://admin.${var.domain_name}"
}

# Connection Information
output "database_connection_string" {
  description = "Database connection string (without password)"
  value       = "postgresql://${var.db_username}@${module.database.endpoint}:${module.database.port}/${var.db_name}"
  sensitive   = true
}

output "redis_connection_string" {
  description = "Redis connection string"
  value       = "redis://${module.redis.endpoint}:${module.redis.port}"
}

# Deployment Information
output "deployment_instructions" {
  description = "Instructions for deploying applications"
  value = <<-EOT
    To deploy the applications:
    
    1. Build and push Docker images to ECR:
       aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com
    
    2. Update ECS services with new images
    
    3. Monitor deployment in CloudWatch
    
    Backend URL: ${output.backend_url.value}
    Frontend URL: ${output.frontend_url.value}
    Admin URL: ${output.admin_url.value}
  EOT
}
