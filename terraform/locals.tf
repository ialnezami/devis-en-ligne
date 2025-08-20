# Local values for Online Quotation Tool Infrastructure

locals {
  common_tags = merge(
    var.tags,
    {
      Project     = "Online Quotation Tool"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "DevOps Team"
      Version     = "1.0.0"
      CostCenter  = "Engineering"
      DataClass   = "Internal"
    }
  )
  
  # Environment-specific configurations
  environment_configs = {
    dev = {
      instance_count = 1
      db_instance_class = "db.t3.micro"
      redis_node_type = "cache.t3.micro"
      enable_monitoring = false
      backup_retention = 1
    }
    staging = {
      instance_count = 2
      db_instance_class = "db.t3.small"
      redis_node_type = "cache.t3.small"
      enable_monitoring = true
      backup_retention = 3
    }
    prod = {
      instance_count = 3
      db_instance_class = "db.t3.medium"
      redis_node_type = "cache.t3.medium"
      enable_monitoring = true
      backup_retention = 7
    }
  }
  
  # Current environment config
  current_env_config = local.environment_configs[var.environment]
  
  # Naming conventions
  name_prefix = "quotation-tool-${var.environment}"
  
  # Common ports
  common_ports = {
    http  = 80
    https = 443
    ssh   = 22
    postgres = 5432
    redis = 6379
    backend = 3000
    frontend = 80
  }
  
  # CIDR blocks for security groups
  allowed_cidr_blocks = {
    vpc = var.vpc_cidr
    office = "10.0.0.0/8"  # Adjust based on your office network
    internet = "0.0.0.0/0"
  }
}
