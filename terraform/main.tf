# Main Terraform configuration for Online Quotation Tool
# This file orchestrates all infrastructure components

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "quotation-tool-terraform-state"
    key            = "global/s3/terraform.tfstate"
    region         = "us-west-2"
    dynamodb_table = "quotation-tool-terraform-locks"
    encrypt        = true
  }
}

# Configure AWS Provider
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "Online Quotation Tool"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "DevOps Team"
    }
  }
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# VPC and Networking
module "vpc" {
  source = "./modules/vpc"
  
  environment        = var.environment
  vpc_cidr          = var.vpc_cidr
  availability_zones = var.availability_zones
  public_subnets    = var.public_subnets
  private_subnets   = var.private_subnets
  
  tags = local.common_tags
}

# ECS Cluster
module "ecs" {
  source = "./modules/ecs"
  
  environment     = var.environment
  cluster_name    = "quotation-tool-${var.environment}"
  vpc_id          = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnets
  
  tags = local.common_tags
}

# RDS Database
module "database" {
  source = "./modules/rds"
  
  environment      = var.environment
  identifier       = "quotation-tool-${var.environment}"
  vpc_id          = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnets
  security_groups = [module.vpc.database_security_group_id]
  
  db_name     = var.db_name
  db_username = var.db_username
  db_password = var.db_password
  
  tags = local.common_tags
}

# Redis Cache
module "redis" {
  source = "./modules/elasticache"
  
  environment      = var.environment
  cluster_id       = "quotation-tool-${var.environment}"
  vpc_id          = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnets
  security_groups = [module.vpc.cache_security_group_id]
  
  tags = local.common_tags
}

# S3 Buckets
module "s3" {
  source = "./modules/s3"
  
  environment   = var.environment
  bucket_names  = var.s3_bucket_names
  
  tags = local.common_tags
}

# Application Load Balancer
module "alb" {
  source = "./modules/alb"
  
  environment      = var.environment
  vpc_id          = module.vpc.vpc_id
  public_subnets  = module.vpc.public_subnets
  security_groups = [module.vpc.alb_security_group_id]
  
  tags = local.common_tags
}

# CloudFront Distribution
module "cloudfront" {
  source = "./modules/cloudfront"
  
  environment = var.environment
  domain_name = var.domain_name
  s3_bucket_id = module.s3.frontend_bucket_id
  
  tags = local.common_tags
}

# Route 53 DNS
module "route53" {
  source = "./modules/route53"
  
  environment  = var.environment
  domain_name  = var.domain_name
  alb_dns_name = module.alb.alb_dns_name
  cloudfront_domain = module.cloudfront.cloudfront_domain
  
  tags = local.common_tags
}

# ACM SSL Certificates
module "acm" {
  source = "./modules/acm"
  
  environment = var.environment
  domain_name = var.domain_name
  
  tags = local.common_tags
}

# ECR Repositories
module "ecr" {
  source = "./modules/ecr"
  
  environment = var.environment
  repositories = var.ecr_repositories
  
  tags = local.common_tags
}

# CloudWatch Monitoring
module "cloudwatch" {
  source = "./modules/cloudwatch"
  
  environment = var.environment
  
  tags = local.common_tags
}

# IAM Roles and Policies
module "iam" {
  source = "./modules/iam"
  
  environment = var.environment
  account_id = data.aws_caller_identity.current.account_id
  
  tags = local.common_tags
}
