# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (include devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build both frontend and backend in production mode
RUN npx nx run-many --parallel --target=build --configuration=production --projects=frontend,backend

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy the generated package.json from backend build (includes only runtime deps)
COPY --from=builder /app/dist/apps/backend/package.json ./
COPY --from=builder /app/dist/apps/backend/package-lock.json ./

# Install only production dependencies from the generated package.json
RUN npm ci --only=production && npm cache clean --force

# Copy built backend from builder (main.js is at root of dist/apps/backend)
COPY --from=builder /app/dist/apps/backend/main.js ./dist/apps/backend/
COPY --from=builder /app/dist/apps/backend/assets ./dist/apps/backend/assets

# Copy built frontend from builder (Angular outputs to browser subfolder)
COPY --from=builder /app/dist/apps/frontend/browser ./public

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the backend application
CMD ["node", "dist/apps/backend/main.js"]
