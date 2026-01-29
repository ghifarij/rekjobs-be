output "ecr_repository_url" {
  value = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${data.aws_region.current.id}.amazonaws.com/${var.ecr_repository_name}"
}

output "ecs_cluster_name" {
  value = module.ecs_cluster.cluster_name
}

output "service_name" {
  value = module.service.service_name
}
