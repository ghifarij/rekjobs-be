variable "name" {
  description = "Name prefix"
  type        = string
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
}

variable "ssm_parameter_arns" {
  description = "List of SSM Parameter Store ARNs the task execution role can read (for ECS container secrets)."
  type        = list(string)
  default     = []
}

variable "secrets_manager_arns" {
  description = "List of AWS Secrets Manager secret ARNs the task execution role can read (for ECS container secrets)."
  type        = list(string)
  default     = []
}
