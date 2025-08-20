# ECS Module for Online Quotation Tool

# Create ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = var.cluster_name
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
  
  configuration {
    execute_command_configuration {
      logging = "DEFAULT"
    }
  }
  
  tags = var.tags
}

# Create ECS Cluster Capacity Providers
resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name
  
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]
  
  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = "FARGATE"
  }
}

# Create ECS Task Definition for Backend
resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.cluster_name}-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.backend_cpu
  memory                   = var.backend_memory
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  
  container_definitions = jsonencode([
    {
      name  = "backend"
      image = "${var.ecr_repository_url}/quotation-backend:latest"
      
      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]
      
      environment = [
        {
          name  = "NODE_ENV"
          value = var.environment
        },
        {
          name  = "PORT"
          value = "3000"
        }
      ]
      
      secrets = [
        {
          name      = "DB_HOST"
          valueFrom = aws_ssm_parameter.db_host.arn
        },
        {
          name      = "DB_PORT"
          valueFrom = aws_ssm_parameter.db_port.arn
        },
        {
          name      = "DB_NAME"
          valueFrom = aws_ssm_parameter.db_name.arn
        },
        {
          name      = "DB_USERNAME"
          valueFrom = aws_ssm_parameter.db_username.arn
        },
        {
          name      = "DB_PASSWORD"
          valueFrom = aws_ssm_parameter.db_password.arn
        },
        {
          name      = "REDIS_HOST"
          valueFrom = aws_ssm_parameter.redis_host.arn
        },
        {
          name      = "REDIS_PORT"
          valueFrom = aws_ssm_parameter.redis_port.arn
        },
        {
          name      = "JWT_SECRET"
          valueFrom = aws_ssm_parameter.jwt_secret.arn
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.backend.name
          awslogs-region        = data.aws_region.current.name
          awslogs-stream-prefix = "ecs"
        }
      }
      
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"]
        interval   = 30
        timeout    = 5
        retries    = 3
        startPeriod = 60
      }
    }
  ])
  
  tags = var.tags
}

# Create ECS Task Definition for Frontend
resource "aws_ecs_task_definition" "frontend" {
  family                   = "${var.cluster_name}-frontend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.frontend_cpu
  memory                   = var.frontend_memory
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  
  container_definitions = jsonencode([
    {
      name  = "frontend"
      image = "${var.ecr_repository_url}/quotation-frontend:latest"
      
      portMappings = [
        {
          containerPort = 80
          protocol      = "tcp"
        }
      ]
      
      environment = [
        {
          name  = "NODE_ENV"
          value = var.environment
        },
        {
          name  = "REACT_APP_API_URL"
          value = "https://${var.domain_name}/api"
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.frontend.name
          awslogs-region        = data.aws_region.current.name
          awslogs-stream-prefix = "ecs"
        }
      }
      
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:80/health || exit 1"]
        interval   = 30
        timeout    = 5
        retries    = 3
        startPeriod = 60
      }
    }
  ])
  
  tags = var.tags
}

# Create ECS Service for Backend
resource "aws_ecs_service" "backend" {
  name            = "${var.cluster_name}-backend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = var.backend_desired_count
  launch_type     = "FARGATE"
  
  network_configuration {
    subnets          = var.private_subnets
    security_groups  = var.security_groups
    assign_public_ip = false
  }
  
  load_balancer {
    target_group_arn = var.backend_target_group_arn
    container_name   = "backend"
    container_port   = 3000
  }
  
  depends_on = [aws_lb_listener.backend]
  
  tags = var.tags
}

# Create ECS Service for Frontend
resource "aws_ecs_service" "frontend" {
  name            = "${var.cluster_name}-frontend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = var.frontend_desired_count
  launch_type     = "FARGATE"
  
  network_configuration {
    subnets          = var.private_subnets
    security_groups  = var.security_groups
    assign_public_ip = false
  }
  
  load_balancer {
    target_group_arn = var.frontend_target_group_arn
    container_name   = "frontend"
    container_port   = 80
  }
  
  depends_on = [aws_lb_listener.frontend]
  
  tags = var.tags
}

# Create Auto Scaling for Backend Service
resource "aws_appautoscaling_target" "backend" {
  max_capacity       = var.backend_max_count
  min_capacity       = var.backend_min_count
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.backend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "backend_cpu" {
  name               = "${var.cluster_name}-backend-cpu"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.backend.resource_id
  scalable_dimension = aws_appautoscaling_target.backend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.backend.service_namespace
  
  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}

# Create Auto Scaling for Frontend Service
resource "aws_appautoscaling_target" "frontend" {
  max_capacity       = var.frontend_max_count
  min_capacity       = var.frontend_min_count
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.frontend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "frontend_cpu" {
  name               = "${var.cluster_name}-frontend-cpu"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.frontend.resource_id
  scalable_dimension = aws_appautoscaling_target.frontend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.frontend.service_namespace
  
  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}

# Create IAM Roles
resource "aws_iam_role" "ecs_execution_role" {
  name = "${var.cluster_name}-ecs-execution-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
  
  tags = var.tags
}

resource "aws_iam_role" "ecs_task_role" {
  name = "${var.cluster_name}-ecs-task-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
  
  tags = var.tags
}

# Attach policies to execution role
resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy_attachment" "ecs_execution_role_ssm" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess"
}

# Attach policies to task role
resource "aws_iam_role_policy_attachment" "ecs_task_role_s3" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.s3_access.arn
}

resource "aws_iam_role_policy_attachment" "ecs_task_role_cloudwatch" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
}

# Create S3 access policy
resource "aws_iam_policy" "s3_access" {
  name = "${var.cluster_name}-s3-access-policy"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::${var.s3_bucket_name}",
          "arn:aws:s3:::${var.s3_bucket_name}/*"
        ]
      }
    ]
  })
  
  tags = var.tags
}

# Create CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${var.cluster_name}/backend"
  retention_in_days = 30
  
  tags = var.tags
}

resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/ecs/${var.cluster_name}/frontend"
  retention_in_days = 30
  
  tags = var.tags
}

# Create SSM Parameters for configuration
resource "aws_ssm_parameter" "db_host" {
  name  = "/${var.cluster_name}/database/host"
  type  = "String"
  value = var.database_host
  
  tags = var.tags
}

resource "aws_ssm_parameter" "db_port" {
  name  = "/${var.cluster_name}/database/port"
  type  = "String"
  value = var.database_port
  
  tags = var.tags
}

resource "aws_ssm_parameter" "db_name" {
  name  = "/${var.cluster_name}/database/name"
  type  = "String"
  value = var.database_name
  
  tags = var.tags
}

resource "aws_ssm_parameter" "db_username" {
  name  = "/${var.cluster_name}/database/username"
  type  = "String"
  value = var.database_username
  
  tags = var.tags
}

resource "aws_ssm_parameter" "db_password" {
  name  = "/${var.cluster_name}/database/password"
  type  = "SecureString"
  value = var.database_password
  
  tags = var.tags
}

resource "aws_ssm_parameter" "redis_host" {
  name  = "/${var.cluster_name}/redis/host"
  type  = "String"
  value = var.redis_host
  
  tags = var.tags
}

resource "aws_ssm_parameter" "redis_port" {
  name  = "/${var.cluster_name}/redis/port"
  type  = "String"
  value = var.redis_port
  
  tags = var.tags
}

resource "aws_ssm_parameter" "jwt_secret" {
  name  = "/${var.cluster_name}/jwt/secret"
  type  = "SecureString"
  value = var.jwt_secret
  
  tags = var.tags
}

# Data source for current region
data "aws_region" "current" {}
