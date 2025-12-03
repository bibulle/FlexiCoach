# Docker Deployment Guide

## Overview

This project uses Docker for containerization and GitHub Actions for automated CI/CD deployment.

## Docker Build

The Dockerfile uses multi-stage builds to optimize the final image size:

1. **Builder stage**: Builds both frontend and backend using Nx
2. **Production stage**: Contains only production dependencies and built artifacts

### Building locally

```bash
docker build -t flexicoach:latest .
```

### Running locally

```bash
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://your-mongo-host:27017/flexicoach \
  -e JWT_SECRET=your-secret-key \
  -e ADMIN_EMAILS=admin@example.com \
  flexicoach:latest
```

## GitHub Actions Workflow

The workflow is triggered on:
- Push to `main` branch
- Pull requests

### Required Secrets

Configure these secrets in your GitHub repository settings (Settings > Secrets and variables > Actions):

1. **DOCKERHUB_USERNAME**: Your Docker Hub username
2. **DOCKERHUB_TOKEN**: Your Docker Hub access token
3. **ACTIONS_TOKEN**: GitHub personal access token for updating GitOps repository (optional)

### Workflow Steps

1. Checkout code
2. Read version from package.json
3. Build Docker image
4. Push to Docker Hub (tags: `latest` and `V{version}`)
5. Update Kubernetes deployment file in GitOps repository (if ACTIONS_TOKEN is configured)

## Kubernetes Deployment

If you're using GitOps with Kubernetes:

1. Create a deployment YAML in your Kubernetes config repository
2. The workflow will automatically update the image tag when a new version is pushed
3. ArgoCD or FluxCD will pick up the changes and deploy

Example deployment structure:
```
myKubernetesConfig/
  └── flexicoach/
      ├── 10-namespace.yaml
      ├── 20-service.yaml
      └── 30-deployment.yaml
```

## Environment Variables

The Docker container requires these environment variables:

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `ADMIN_EMAILS`: Comma-separated list of admin email addresses
- `PORT`: Port to run the application (default: 3000)
- `NODE_ENV`: Set to `production` in Docker

## Architecture

- Backend (NestJS): Serves API on `/api/*`
- Frontend (Angular): Served as static files from `/`
- Single container deployment: Backend serves both API and frontend

## Development vs Production

- **Development**: Frontend and backend run separately (nx serve)
- **Production**: Backend serves both API and pre-built frontend static files
