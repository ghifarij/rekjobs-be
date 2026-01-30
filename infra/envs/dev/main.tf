locals {
  name = "${var.project_name}-dev"
}

module "vpc" {
  source     = "../../modules/vpc"
  name       = local.name
  cidr_block = var.vpc_cidr
  azs        = var.azs
  tags       = var.common_tags
}

module "iam" {
  source = "../../modules/iam"
  name   = local.name
  tags   = var.common_tags
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

module "ecs_cluster" {
  source               = "../../modules/ecs_cluster_ec2"
  name                 = local.name
  vpc_id               = module.vpc.vpc_id
  public_subnet_ids    = module.vpc.public_subnet_ids
  instance_profile_name = module.iam.instance_profile_name
  ssh_ingress_cidr     = var.ssh_ingress_cidr
  ingress_port         = var.container_port
  instance_type        = var.instance_type
  tags                 = var.common_tags
}

module "service" {
  source                   = "../../modules/ecs_service"
  name                     = var.app_name
  cluster_arn              = module.ecs_cluster.cluster_arn
  task_execution_role_arn  = module.iam.task_execution_role_arn
  image                    = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${data.aws_region.current.id}.amazonaws.com/${var.ecr_repository_name}:${var.image_tag}"
  container_port           = var.container_port
  desired_count            = var.desired_count
  environment              = var.environment
  secrets                  = merge(var.container_secrets, local.ssm_container_secrets, local.sm_container_secrets)
  tags                     = var.common_tags
}
