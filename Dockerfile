# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for all workspaces
COPY package*.json ./
COPY turbo.json ./

# Copy workspace configuration
COPY packages/ ./packages/
COPY apps/ ./apps/

# Install dependencies only if not already installed
RUN if [ "$SKIP_INSTALL" = "false" ]; then npm ci; fi

# Copy source code
COPY . .

# Production image
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Accept build arguments
ARG NEXT_PUBLIC_ASSET_PREFIX
ARG TIMESTAMP
ARG NEXT_PUBLIC_ENVIRONMENT
ARG PORT
ARG SKIP_INSTALL=false
ARG SKIP_BUILD=false

# Set environment variables for build
ENV NEXT_PUBLIC_ASSET_PREFIX=${NEXT_PUBLIC_ASSET_PREFIX}
ENV TIMESTAMP=${TIMESTAMP}
ENV NEXT_PUBLIC_ENVIRONMENT=${NEXT_PUBLIC_ENVIRONMENT}
ENV PORT=${PORT}

# Copy built application from the build context (GitHub Actions runner)
COPY apps/application-dashboard/.next/standalone ./
COPY apps/application-dashboard/.next/static ./apps/application-dashboard/.next/static
COPY apps/application-dashboard/public ./apps/application-dashboard/public
COPY apps/application-dashboard/package.json ./apps/application-dashboard/package.json
COPY node_modules ./node_modules

# Expose port
EXPOSE ${PORT}

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application using next start
WORKDIR /app/apps/application-dashboard
CMD ["npm", "start"] 
