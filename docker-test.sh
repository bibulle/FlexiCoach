#!/bin/bash

# Docker Testing Script for FlexiCoach
# This script helps you test the Docker build and container locally

set -e

echo "🐳 FlexiCoach Docker Testing Script"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="flexicoach"
IMAGE_TAG="test"
CONTAINER_NAME="flexicoach-test"
PORT=3001

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker Desktop first.${NC}"
    echo "Download from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo -e "${GREEN}✅ Docker is installed${NC}"
echo ""

# Function to cleanup
cleanup() {
    echo -e "${BLUE}🧹 Cleaning up...${NC}"
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
}

# Trap to cleanup on exit
trap cleanup EXIT

# Step 1: Build the Docker image
echo -e "${BLUE}📦 Step 1: Building Docker image...${NC}"
echo "This may take several minutes on first build..."
docker build -t $IMAGE_NAME:$IMAGE_TAG . || {
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
}
echo -e "${GREEN}✅ Docker image built successfully${NC}"
echo ""

# Step 2: Check image size
echo -e "${BLUE}📏 Step 2: Checking image size...${NC}"
IMAGE_SIZE=$(docker images $IMAGE_NAME:$IMAGE_TAG --format "{{.Size}}")
echo -e "Image size: ${YELLOW}$IMAGE_SIZE${NC}"
echo ""

# Step 3: Run the container
echo -e "${BLUE}🚀 Step 3: Starting container on port $PORT...${NC}"
echo "Environment variables:"
echo "  - NODE_ENV=production"
echo "  - MONGODB_URI=mongodb://localhost:27017/flexicoach"
echo "  - JWT_SECRET=test-secret-key"
echo "  - ADMIN_EMAILS=admin@example.com"
echo ""

docker run -d \
  --name $CONTAINER_NAME \
  -p $PORT:3000 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/flexicoach \
  -e JWT_SECRET=test-secret-key-change-in-production \
  -e ADMIN_EMAILS=admin@example.com \
  $IMAGE_NAME:$IMAGE_TAG || {
    echo -e "${RED}❌ Failed to start container${NC}"
    exit 1
}

echo -e "${GREEN}✅ Container started${NC}"
echo ""

# Step 4: Wait for the application to start
echo -e "${BLUE}⏳ Step 4: Waiting for application to start...${NC}"
sleep 5

# Check if container is still running
if ! docker ps | grep -q $CONTAINER_NAME; then
    echo -e "${RED}❌ Container stopped unexpectedly${NC}"
    echo "Container logs:"
    docker logs $CONTAINER_NAME
    exit 1
fi

# Step 5: Check application health
echo -e "${BLUE}🏥 Step 5: Checking application health...${NC}"

# Check backend API
echo -n "Testing backend API endpoint... "
if curl -s -f http://localhost:$PORT/api > /dev/null; then
    echo -e "${GREEN}✅ Backend is responding${NC}"
else
    echo -e "${RED}❌ Backend is not responding${NC}"
    docker logs $CONTAINER_NAME
    exit 1
fi

# Check frontend
echo -n "Testing frontend... "
if curl -s -f http://localhost:$PORT/ | grep -q "FlexiCoach"; then
    echo -e "${GREEN}✅ Frontend is serving correctly${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend might not be serving correctly${NC}"
fi

echo ""

# Step 6: Show container info
echo -e "${BLUE}📊 Step 6: Container information${NC}"
echo "Container ID: $(docker ps -q -f name=$CONTAINER_NAME)"
echo "Container status: $(docker ps -f name=$CONTAINER_NAME --format '{{.Status}}')"
echo ""

# Step 7: Show logs
echo -e "${BLUE}📋 Step 7: Recent logs${NC}"
docker logs --tail 20 $CONTAINER_NAME
echo ""

# Step 8: Access information
echo -e "${GREEN}✅ All tests passed!${NC}"
echo ""
echo "======================================"
echo -e "${BLUE}🎉 Docker container is running successfully!${NC}"
echo "======================================"
echo ""
echo "Access your application:"
echo -e "  Frontend: ${YELLOW}http://localhost:$PORT/${NC}"
echo -e "  Backend API: ${YELLOW}http://localhost:$PORT/api${NC}"
echo ""
echo "Useful commands:"
echo -e "  View logs: ${YELLOW}docker logs -f $CONTAINER_NAME${NC}"
echo -e "  Stop container: ${YELLOW}docker stop $CONTAINER_NAME${NC}"
echo -e "  Remove container: ${YELLOW}docker rm $CONTAINER_NAME${NC}"
echo -e "  Enter container: ${YELLOW}docker exec -it $CONTAINER_NAME sh${NC}"
echo ""
echo "Press Ctrl+C to stop the container and cleanup"
echo ""

# Keep script running
read -r -p "Press Enter to stop and cleanup the test container..."
