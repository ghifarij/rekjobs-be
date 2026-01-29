terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
  # Uncomment and fill to use remote state after running bootstrap
  # backend "s3" {
  #   bucket         = "<your-state-bucket-name>"
  #   key            = "rekjobs/dev/terraform.tfstate"
  #   region         = "<region>"
  #   dynamodb_table = "<your-lock-table-name>"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region
}

