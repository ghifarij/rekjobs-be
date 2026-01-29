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
