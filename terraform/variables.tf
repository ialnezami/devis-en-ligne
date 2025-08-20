# Variables for Online Quotation Tool Infrastructure

variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["us-west-2a", "us-west-2b"]
}

variable "public_subnets" {
  description = "List of public subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnets" {
  description = "List of private subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.3.0/24", "10.0.4.0/24"]
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "quotation_tool"
}

variable "db_username" {
  description = "Database username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "s3_bucket_names" {
  description = "List of S3 bucket names to create"
  type        = list(string)
  default = [
    "quotation-tool-files",
    "quotation-tool-backups",
    "quotation-tool-logs"
  ]
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "quotation-tool.example.com"
}

variable "ecr_repositories" {
  description = "List of ECR repository names"
  type        = list(string)
  default = [
    "quotation-backend",
    "quotation-frontend",
    "quotation-mobile"
  ]
}

variable "instance_type" {
  description = "EC2 instance type for ECS tasks"
  type        = string
  default     = "t3.micro"
}

variable "min_size" {
  description = "Minimum size for Auto Scaling Group"
  type        = number
  default     = 1
}

variable "max_size" {
  description = "Maximum size for Auto Scaling Group"
  type        = number
  default     = 5
}

variable "desired_capacity" {
  description = "Desired capacity for Auto Scaling Group"
  type        = number
  default     = 2
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_num_cache_nodes" {
  description = "Number of Redis cache nodes"
  type        = number
  default     = 1
}

variable "enable_encryption" {
  description = "Enable encryption for resources"
  type        = bool
  default     = true
}

variable "enable_backup" {
  description = "Enable backup for resources"
  type        = bool
  default     = true
}

variable "backup_retention_period" {
  description = "Backup retention period in days"
  type        = number
  default     = 7
}

variable "enable_monitoring" {
  description = "Enable CloudWatch monitoring"
  type        = bool
  default     = true
}

variable "enable_logging" {
  description = "Enable logging for resources"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Additional tags for resources"
  type        = map(string)
  default     = {}
}
