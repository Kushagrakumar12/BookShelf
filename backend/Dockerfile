# Stage 1: Build dependencies
FROM node:22-alpine AS deps

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --only=production

# Stage 2: Production image
FROM node:22-alpine

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY package.json ./
COPY src ./src

# Set ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose backend port
EXPOSE 5001

# Set default environment variables
ENV NODE_ENV=production
ENV PORT=5001
ENV MONGO_URI=mongodb://mongo:27017/books
ENV CORS_ORIGIN=http://localhost:3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/api/health || exit 1

# Start the server
CMD ["node", "src/server.js"]
