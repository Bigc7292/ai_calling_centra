# PRD v1.3, Sec 5: Infrastructure Configuration (GCP Preparation)
# Dockerfile for Express.js Backend

# --- Build Stage ---
# Use a slim image for building to keep dependencies small
FROM node:18-slim AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency definitions
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
# This leverages the pnpm content-addressable store for efficiency
RUN pnpm install --frozen-lockfile --prod=false

# Copy the rest of the source code
COPY . .

# Build the TypeScript project
# This command should compile TS to JS in a `dist` directory
RUN pnpm build

# Prune development dependencies
RUN pnpm prune --prod

# --- Production Stage ---
# Use a lightweight and secure Alpine image for the final container
FROM node:18-alpine

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy the pruned node_modules and the built application from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expose the port the app runs on
# Default for Cloud Run is 8080
EXPOSE 8080
ENV PORT=8080

# Start the application
# The entrypoint should be the main file in your `dist` folder
CMD ["node", "dist/server.js"]
