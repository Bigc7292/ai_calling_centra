# Multi-stage Dockerfile for AI Calling Center Core API
# Optimized for Google Cloud Run deployment

# Stage 1: Build environment
FROM node:18-alpine AS builder

# Enable corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY services/core-api/ ./services/core-api/
COPY tsconfig.base.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the project
RUN pnpm --filter @eva/types build
RUN pnpm --filter @eva/core-api build

# Stage 2: Production runtime
FROM node:18-alpine AS runtime

# Install production dependencies only
RUN corepack enable && corepack prepare pnpm@latest --activate

# Create app directory
WORKDIR /app

# Copy package files for production install
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY services/core-api/package.json ./services/core-api/

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application from builder stage
COPY --from=builder /app/services/core-api/dist ./services/core-api/dist
COPY --from=builder /app/packages/types/dist ./packages/types/dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S apiuser -u 1001

# Change ownership to non-root user
RUN chown -R apiuser:nodejs /app
USER apiuser

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "http.get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the application
CMD ["node", "services/core-api/dist/index.js"]