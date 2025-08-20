FROM node:20-alpine 

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Accept build arguments
ARG NEXT_PUBLIC_ASSET_PREFIX
ARG TIMESTAMP
ARG NEXT_PUBLIC_ENVIRONMENT

# Set environment variables for build
ENV NEXT_PUBLIC_ASSET_PREFIX=$NEXT_PUBLIC_ASSET_PREFIX
ENV TIMESTAMP=$TIMESTAMP
ENV NEXT_PUBLIC_ENVIRONMENT=$NEXT_PUBLIC_ENVIRONMENT

# Copy built application from the build context (GitHub Actions runner)
COPY apps/application-dashboard/.next/standalone ./
COPY apps/application-dashboard/.next/static ./apps/application-dashboard/.next/static
COPY apps/application-dashboard/public ./apps/application-dashboard/public
COPY apps/application-dashboard/package.json ./apps/application-dashboard/package.json
COPY node_modules ./node_modules

# Expose port
EXPOSE 3000

# Switch to non-root user
USER nextjs

# Start the application using next start
WORKDIR /app/apps/application-dashboard
CMD ["npm", "start"] 
