variable "name" {
  description = "Name prefix"
  type        = string
}

variable "vpc_id" {
  type        = string
  description = "VPC ID"
}

variable "public_subnet_ids" {
  type        = list(string)
  description = "Public subnet IDs for ASG"
}

variable "instance_profile_name" {
  type        = string
  description = "IAM instance profile name for EC2"
}

variable "instance_type" {
  type        = string
  default     = "t2.micro"
  description = "EC2 instance type"
}

variable "desired_capacity" {
  type        = number
  default     = 1
}

variable "min_size" {
  type    = number
  default = 1
}

variable "max_size" {
  type    = number
  default = 1
}

variable "ssh_ingress_cidr" {
  type        = string
  default     = null
  description = "CIDR allowed for SSH (22); null disables SSH"
}

variable "ingress_port" {
  type        = number
  default     = 80
  description = "Inbound port opened on instance SG for the service"
}

variable "tags" {
  type    = map(string)
  default = {}
}
