variable "project_name" {
  type        = string
  default     = "rekjobs"
  description = "Project name prefix"
}

variable "aws_region" {
  type        = string
  default     = "ap-southeast-2"
}

variable "azs" {
  type        = list(string)
  default     = ["ap-southeast-2a"]
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "ssh_ingress_cidr" {
  type        = string
  default     = null
  description = "CIDR allowed for SSH; null disables"
}

variable "app_name" {
  type    = string
  default = "rekjobs-be"
}

variable "ecr_repository_name" {
  type        = string
  description = "Existing ECR repository name"
  default     = "rekjobs-be"
}

variable "container_port" {
  type    = number
  default = 80
}

variable "image_tag" {
  type    = string
  default = "latest"
}

variable "desired_count" {
  type    = number
  default = 1
}

variable "instance_type" {
  type        = string
  default     = "t3.micro"
  description = "EC2 instance type for ECS cluster (use free-tier eligible type)"
}

variable "common_tags" {
  type = map(string)
  default = {
    managed-by = "terraform"
    env        = "dev"
  }
}

# Optional: plain environment variables for the container
variable "environment" {
  type        = map(string)
  default     = {}
  description = "Non-sensitive env vars passed as plaintext to the container"
}

# Optional: container secrets mapping (env name -> valueFrom ARN)
variable "container_secrets" {
  type        = map(string)
  default     = {}
  description = "Sensitive env vars from SSM/Secrets Manager (valueFrom ARN)"
}

# Optional: grant the task execution role read access to these ARNs
variable "ssm_parameter_arns" {
  type        = list(string)
  default     = []
  description = "SSM Parameter Store ARNs readable by task execution role"
}

variable "secrets_manager_arns" {
  type        = list(string)
  default     = []
  description = "Secrets Manager ARNs readable by task execution role"
}

# Easy-mode: build ARNs from a single prefix and key lists
variable "secret_prefix_ssm" {
  type        = string
  default     = null
  description = "Prefix for SSM parameters (e.g., /rekjobs/dev). If set, keys in secret_keys_ssm will be mapped to ARNs automatically."
}

variable "secret_keys_ssm" {
  type        = list(string)
  default     = []
  description = "List of env var names stored as SSM parameters under secret_prefix_ssm"
}

variable "secrets_manager_name" {
  type        = string
  default     = null
  description = "Secrets Manager secret name for a JSON secret (e.g., rekjobs/dev/app-secrets). If set, JSON keys in secrets_manager_json_keys will be mapped."
}

variable "secrets_manager_json_keys" {
  type        = list(string)
  default     = []
  description = "List of JSON keys within the Secrets Manager secret to expose as env vars"
}
