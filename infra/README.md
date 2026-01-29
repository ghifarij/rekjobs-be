Infra for ECS on EC2 (free-tier friendly)

Overview

- ECS on EC2 with one micro instance (default `t3.micro`), no ALB/NAT.
- Public subnet only; instance security group opens the configured `container_port` and optional SSH (22).
- ECR for images, CloudWatch Logs for app logs.
- Split into reusable modules and a dev environment under `infra/envs/dev`.

Structure

- `infra/`
  - `modules/`
    - `vpc/` (VPC, IGW, public subnets, route table)
    - `iam/` (ECS instance profile, ECS task execution role)
    - `ecs_cluster_ec2/` (ECS cluster, SG, launch template, ASG)
    - `ecs_service/` (EC2 launch type service + task definition, CW Logs)
  - `envs/`
    - `dev/`
      - `main.tf`, `variables.tf`, `provider.tf`, `outputs.tf`
  - `bootstrap/`
    - `main.tf` (S3/DynamoDB for Terraform remote state)

Defaults that matter

- Region: `ap-southeast-2` (override `var.aws_region` in `envs/dev/variables.tf`).
- Instance type: `t3.micro` (override `var.instance_type`).
- App port: `8000` (override `var.container_port`).
- Image tag: `latest` (override `var.image_tag`).
- ECR repo name: `rekjobs-be` (override `var.ecr_repository_name`).

Quick start (local state)

1. Export AWS credentials (via `AWS_PROFILE` or `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`).
2. Review and adjust `infra/envs/dev/variables.tf` (region, AZs, VPC CIDR, app name, port, ECR repo, instance type).
3. From `infra/envs/dev`:
   - `terraform init`
   - `terraform apply -auto-approve`
4. Build and push an image to the ECR repo printed by Terraform output. Use a tag matching `var.image_tag` (default: `latest`). Example:
   - Get repo URL: `terraform output -raw ecr_repository_url`
   - Login: `aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com`
   - Build: `docker build -t <repo-name>:<tag> ../../`
   - Tag: `docker tag <repo-name>:<tag> $(terraform output -raw ecr_repository_url):<tag>`
   - Push: `docker push $(terraform output -raw ecr_repository_url):<tag>`
     If the ECR repository does not exist yet, create it once: `aws ecr create-repository --repository-name <repo-name>`
5. The service uses the specified tag; on first deploy it will pull on container start. To roll out a new image tag change `var.image_tag` and `terraform apply`, or force a new task deployment from the ECS console.

Remote state (optional, recommended)

1. From `infra/bootstrap`: set `var.state_bucket_name` and (optionally) `var.lock_table_name`, choose `var.aws_region`, then `terraform init && terraform apply`.
2. In `infra/envs/dev/provider.tf`, uncomment the `backend "s3"` block and fill values from the bootstrap outputs (bucket, region, DynamoDB table).
3. Run `terraform init` in `infra/envs/dev` to migrate local state to S3.

What the modules create

- `vpc`: VPC with DNS enabled, one or more public subnets and route table + IGW.
- `iam`: EC2 instance profile for ECS agent, and ECS task execution role (pull from ECR, write CloudWatch Logs).
- `ecs_cluster_ec2`: ECS cluster, security group opening `container_port` to 0.0.0.0/0 plus optional SSH; launch template using latest ECS-optimized AL2 AMI via SSM; single-ASG EC2 capacity (default desired 1).
- `ecs_service`: EC2 launch type service with `bridge` network mode; container port mapped to host port; CloudWatch log group `/ecs/<service-name>` with 7-day retention.

Accessing the app

- No load balancer; reach the app via the EC2 instance public IP on `container_port` (default 8000).
- For SSH access, set `var.ssh_ingress_cidr` (e.g., `"x.x.x.x/32"`); leave `null` to disable SSH.

Assumptions

- An ECR repository exists (name via `var.ecr_repository_name`); create it once if missing.
- The container image is compatible with the configured `container_port` and listens on that port.

Troubleshooting

- If the service doesn’t stabilize, check CloudWatch Logs group `/ecs/<service-name>` for container errors.
- Confirm the EC2 instance joined the cluster: ECS console → Infrastructure → Container Instances.
- Verify the instance security group allows inbound on your `container_port` and your app listens on it.
