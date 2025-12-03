# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

RUN npx nx run-many --parallel --target=build --configuration=production --projects=frontend,backend 

# # Build backend
# RUN npx nx build backend --prod

# # Build frontend
# RUN npx nx build frontend --prod

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built backend from builder
COPY --from=builder /app/dist/apps/backend ./dist/apps/backend

# Copy built frontend from builder (Angular outputs to browser subfolder)
COPY --from=builder /app/dist/apps/frontend/browser ./public

# Copy backend source to enable static file serving
COPY apps/backend/src/main.ts ./apps/backend/src/

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the backend application
# The backend will need to be configured to serve the frontend static files from /public
CMD ["node", "dist/apps/backend/main.js"]
