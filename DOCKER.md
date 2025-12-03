# Docker Deployment Guide

## Overview

This project uses Docker for containerization and GitHub Actions for automated CI/CD deployment.

## Docker Build

The Dockerfile uses multi-stage builds to optimize the final image size:

1. **Builder stage**: Builds both frontend and backend using Nx
2. **Production stage**: Contains only production dependencies and built artifacts

## Testing Docker Locally

### Quick Test (Automated)

Use the provided test script for automated testing:

```bash
./docker-test.sh
```

The script will:
1. ✅ Check if Docker is installed
2. 📦 Build the Docker image
3. 📏 Check the image size
4. 🚀 Start a test container on port 3001
5. 🏥 Test backend API and frontend
6. 📋 Show container logs
7. 🧹 Cleanup when you press Enter

### Manual Testing

#### Step 1: Build the image

```bash
docker build -t flexicoach:test .
```

Expected output: "Successfully tagged flexicoach:test"
Build time: ~5-10 minutes on first build

#### Step 2: Run the container

```bash
docker run -d \
  --name flexicoach-test \
  -p 3001:3000 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/flexicoach \
  -e JWT_SECRET=test-secret-key \
  -e ADMIN_EMAILS=admin@example.com \
  flexicoach:test
```

Note: Use `host.docker.internal` to connect to MongoDB running on your host machine.

#### Step 3: Check if container is running

```bash
docker ps | grep flexicoach-test
```

#### Step 4: View logs

```bash
docker logs -f flexicoach-test
```

Expected log: "🚀 Application is running on: http://localhost:3000/api"

#### Step 5: Test the application

Test backend API:
```bash
curl http://localhost:3001/api
```

Test frontend:
```bash
curl http://localhost:3001/
```

Open in browser: http://localhost:3001/

#### Step 6: Test API endpoints

```bash
# Test signup
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","displayName":"Test User"}'

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

#### Step 7: Inspect the container

```bash
# Enter the container
docker exec -it flexicoach-test sh

# Inside the container, check files:
ls -la /app
ls -la /app/dist/apps/backend
ls -la /app/public

# Exit
exit
```

#### Step 8: Cleanup

```bash
# Stop the container
docker stop flexicoach-test

# Remove the container
docker rm flexicoach-test

# Remove the image (optional)
docker rmi flexicoach:test
```

### Troubleshooting

**Container exits immediately:**
```bash
docker logs flexicoach-test
```

**Port already in use:**
```bash
# Use a different port
docker run -p 3002:3000 ...
```

**Cannot connect to MongoDB:**
- Make sure MongoDB is running: `mongod --version`
- Check MongoDB is accessible: `mongo --eval "db.version()"`
- Use correct connection string for Docker

**Frontend not loading:**
- Check if files are in `/app/public`: `docker exec flexicoach-test ls -la /app/public`
- Check NODE_ENV is set to production: `docker exec flexicoach-test printenv NODE_ENV`

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
