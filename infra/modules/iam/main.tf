terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

# Instance role for ECS agent on EC2 instances
resource "aws_iam_role" "ecs_instance_role" {
  name               = "${var.name}-ecs-instance-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_trust.json
  tags               = var.tags
}

data "aws_iam_policy_document" "ec2_trust" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "ecs_instance_managed" {
  role       = aws_iam_role.ecs_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_instance_profile" "ecs_instance_profile" {
  name = "${var.name}-ecs-instance-profile"
  role = aws_iam_role.ecs_instance_role.name
  tags = var.tags
}

# Task execution role to pull images and write logs
resource "aws_iam_role" "task_execution_role" {
  name               = "${var.name}-ecs-task-exec-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_trust.json
  tags               = var.tags
}

data "aws_iam_policy_document" "ecs_tasks_trust" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "task_execution_managed" {
  role       = aws_iam_role.task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

data "aws_iam_policy_document" "task_execution_secrets" {
  dynamic "statement" {
    for_each = length(var.ssm_parameter_arns) > 0 ? [1] : []
    content {
      sid     = "SSMRead"
      actions = [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParameterHistory"
      ]
      resources = var.ssm_parameter_arns
    }
  }

  dynamic "statement" {
    for_each = length(var.secrets_manager_arns) > 0 ? [1] : []
    content {
      sid     = "SecretsManagerRead"
      actions = [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ]
      resources = var.secrets_manager_arns
    }
  }
}

resource "aws_iam_policy" "task_execution_secrets" {
  count       = (length(var.ssm_parameter_arns) + length(var.secrets_manager_arns)) > 0 ? 1 : 0
  name        = "${var.name}-ecs-task-exec-secrets"
  description = "Allow ECS task execution role to read SSM/Secrets Manager for container secrets"
  policy      = data.aws_iam_policy_document.task_execution_secrets.json
}

resource "aws_iam_role_policy_attachment" "task_execution_secrets" {
  count      = (length(var.ssm_parameter_arns) + length(var.secrets_manager_arns)) > 0 ? 1 : 0
  role       = aws_iam_role.task_execution_role.name
  policy_arn = aws_iam_policy.task_execution_secrets[0].arn
}
