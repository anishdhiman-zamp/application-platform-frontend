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

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application using turbo
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application from builder stage
# The standalone output is configured in next.config.js
COPY --from=builder /app/apps/application-dashboard/.next/standalone ./
COPY --from=builder /app/apps/application-dashboard/.next/static ./apps/application-dashboard/.next/static
COPY --from=builder /app/apps/application-dashboard/public ./apps/application-dashboard/public

# Copy package.json for npm start command
COPY --from=builder /app/apps/application-dashboard/package.json ./apps/application-dashboard/package.json

# Copy root node_modules where next command is located
COPY --from=builder /app/node_modules ./node_modules

# Set environment variables
ENV NEXT_PUBLIC_ENVIRONMENT=production
ENV PORT=2000

# Expose port
EXPOSE 2000

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:2000/api/health || exit 1

# Start the application using next start
WORKDIR /app/apps/application-dashboard
CMD ["npm", "start"] 
