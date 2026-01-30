variable "name" {
  description = "Service/app name"
  type        = string
}

variable "cluster_arn" {
  description = "ECS cluster ARN"
  type        = string
}

variable "task_execution_role_arn" {
  description = "Task execution role ARN"
  type        = string
}

variable "image" {
  description = "Container image (e.g., 123456789012.dkr.ecr..../app:tag)"
  type        = string
}

variable "container_port" {
  type    = number
  default = 80
}

variable "cpu" {
  type    = number
  default = 256
}

variable "memory" {
  type    = number
  default = 512
}

variable "desired_count" {
  type    = number
  default = 1
}

variable "environment" {
  description = "Env vars for container"
  type        = map(string)
  default     = {}
}

variable "secrets" {
  description = "Sensitive env vars from SSM or Secrets Manager. Map env name -> valueFrom ARN"
  type        = map(string)
  default     = {}
}

variable "tags" {
  type    = map(string)
  default = {}
}
