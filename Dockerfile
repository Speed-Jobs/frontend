# Build stage
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with cache mount
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit

# Copy source files
COPY . .

# Build the application with Next.js cache
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

# Production stage
FROM node:22-alpine AS runner

# Set working directory
WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./

# Expose port 8080 (as defined in k8s service.yaml)
EXPOSE 8080

# Start the application on port 8080
CMD ["node", "server.js"]
