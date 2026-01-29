output "cluster_arn" {
  value = aws_ecs_cluster.this.arn
}

output "cluster_name" {
  value = aws_ecs_cluster.this.name
}

output "instance_sg_id" {
  value = aws_security_group.instance_sg.id
}

