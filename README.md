# RekJobs Backend

Backend for RekJobs — a job board API built with Node.js, TypeScript, Express, Prisma, and PostgreSQL. The repo also showcases containerization, infrastructure-as-code with Terraform, AWS ECR/ECS deployment, and CI/CD with GitHub Actions.

API base path: `/api` (health: `GET /api`)

## 🚀 Project Overview

RekJobs Backend provides REST endpoints for authentication, company and user profiles, jobs, applications, and interviews. It emphasizes clean modular structure, type safety, testability, and production-ready DevOps.

## 🛠️ Tech Stack

### Core

- Node.js 20, TypeScript, Express.js

### Database & ORM

- PostgreSQL, Prisma (with generated client, migrations under `prisma/migrations`)

### Auth & Security

- JWT, bcrypt, optional Google OAuth

### Utilities

- Cloudinary, Nodemailer (SMTP), Handlebars templates, Multer, Express Validator

### Code Quality

- ESLint, Prettier, Jest for unit tests

## 📂 Repository Structure

```
src/
├── controller/           # Route handlers
├── middleware/           # Auth, validation, etc.
├── router/               # API routes
├── services/             # Business logic
├── types/                # TS types and Express typings
├── utils/                # Helpers (email, auth)
├── index.ts              # App entrypoint (port 80)
└── prisma.ts             # Prisma client

prisma/
├── schema.prisma         # DB schema
└── migrations/           # SQL migrations

infra/
├── modules/
│   ├── vpc/              # VPC, IGW, public subnets, routes
│   ├── iam/              # ECS instance profile + task exec role
│   ├── ecs_cluster_ec2/  # ECS cluster, SG, launch template, ASG
│   └── ecs_service/      # Task definition + service + CW logs
├── envs/
│   └── dev/              # Composes modules for dev env
└── bootstrap/            # Optional remote state (S3+DynamoDB)

.github/workflows/
├── lint.yml              # ESLint + Prettier check
├── test.yml              # Unit tests + coverage artifact
├── ecr-publish.yml       # Build + push image to ECR
└── deploy.yml            # Update ECS service to new task def

Dockerfile                # Multi-stage build (builder/runner)
docker-compose.yml        # Local Postgres + backend
```

## ▶️ Getting Started (Local)

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL (or Docker if using Compose)

### Install & Env

```
npm install
cp .env.example .env
```

Fill required variables (DB URLs, JWT, email/SMTP, Cloudinary, etc.).

### Database

```
npx prisma generate
npx prisma db push
```

### Run

```
# Dev with hot reload
npm run dev

# Production build
npm run build && npm start
```

## 🐳 Docker & Compose

The app is containerized with a multi-stage Dockerfile:

- Builder: installs deps, generates Prisma Client, builds TS
- Runner: installs prod deps only, runs `node dist/index.js`

### Docker

```
docker build -t rekjobs-be .
docker run -p 80:80 --env-file .env rekjobs-be
```

### Docker Compose (includes Postgres)

```
cp .env.example .env.local  # includes local Postgres defaults
docker-compose up -d
```

Compose brings up:

- `postgres`: Postgres 16 with healthcheck and persisted volume
- `backend`: Express API (port 80) wired to Postgres

## ☁️ Infrastructure (Terraform in `infra/`)

Production-ready, free-tier–friendly AWS setup using ECS on EC2 (no ALB/NAT), public subnet only, CloudWatch Logs, and ECR for images.

### Layout

- `modules/vpc`: VPC with DNS, IGW, public subnets and route table
- `modules/iam`: EC2 instance profile (ECS agent) + ECS task execution role
- `modules/ecs_cluster_ec2`: ECS cluster, instance SG, latest ECS-optimized AL2 AMI (via SSM), Launch Template, ASG
- `modules/ecs_service`: EC2 launch type service + task definition, bridge networking, hostPort mapping, CW log group `/ecs/<service>`
- `envs/dev`: Wires modules together; outputs ECR repo URL, cluster, and service name
- `bootstrap`: Optional S3 bucket + DynamoDB table for Terraform remote state

### Defaults

- Region: `ap-southeast-2` (override `var.aws_region`)
- Instance type: `t3.micro` (override `var.instance_type`)
- App port: `80` (`var.container_port`)
- ECR repo: `rekjobs-be` (`var.ecr_repository_name`)
- Image tag: `latest` (`var.image_tag`)

### Quickstart (local state)

```
cd infra/envs/dev
terraform init
terraform apply -auto-approve
```

Then build and push an image to the ECR repo printed by outputs:

```
export REGION=$(terraform output -raw aws_region 2>/dev/null || echo ap-southeast-2)
export REPO=$(terraform output -raw ecr_repository_url)
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin "$REPO"
docker build -t rekjobs-be:latest ../../..
docker tag rekjobs-be:latest "$REPO:latest"
docker push "$REPO:latest"
```

Update the running task by changing `var.image_tag` (or re-registering a task with the new image) and `terraform apply`, or force a new deployment from the ECS console.

### Remote State (optional)

1. `infra/bootstrap`: set `state_bucket_name`, `lock_table_name`, `aws_region` → `terraform init && terraform apply`
2. `infra/envs/dev/provider.tf`: uncomment the `backend "s3"` block and fill values
3. `terraform init` to migrate local state to S3

## 📦 AWS ECR

Images are stored in ECR. You can push manually (above) or via GitHub Actions. The service pulls `ECR_REGISTRY/ECR_REPOSITORY:IMAGE_TAG`.

## 🔁 CI/CD (GitHub Actions)

Workflows live in `.github/workflows/`:

- `lint.yml` (Lint & Format): runs ESLint and Prettier on pushes/PRs to `main`/`master`.
- `test.yml` (Unit Tests): installs deps, runs Jest, uploads coverage artifact.
- `ecr-publish.yml` (Build & Push to ECR): on push to `main`, builds Docker image and pushes both `latest` and `${{ github.sha }}` tags to ECR.
- `deploy.yml` (Deploy to ECS): on push to `main` or manual dispatch, fetches current task def, updates container image to a provided tag (default `latest`), registers a new task def, updates the service, and waits for stability.

### Required GitHub Settings

Secrets (Repository or Environment):

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Variables (Repository or Environment):

- `AWS_REGION` — e.g., `ap-southeast-2`
- `ECR_REGISTRY` — `<aws_account_id>.dkr.ecr.<region>.amazonaws.com`
- `ECR_REPOSITORY` — `rekjobs-be` (or your repo name)
- `ECS_CLUSTER_NAME` — from Terraform output
- `ECS_SERVICE_NAME` — from Terraform output

Typical flow:

1. Push to `main` → `ecr-publish.yml` builds and pushes images
2. Deploy via `deploy.yml` (auto on push or manual with `image_tag` input) to roll the service

## 🧪 Testing

```
npm test           # run unit tests
npm run test:watch # watch mode
npm run test:cov   # coverage
```

Coverage artifacts are uploaded by CI on every run.

## 🧹 Lint & Format

```
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

## 🔌 API Health

- `GET /api` → `{ status: "ok", message: "Welcome to RekJobs API" }`

## Notes

- The app listens on `0.0.0.0:${PORT||80}` for container friendliness.
- `vercel.json` exists for earlier experiments; deployment is currently via AWS ECS.
