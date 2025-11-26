# Multi-stage Dockerfile for EHR API
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Development dependencies stage
FROM base AS dev-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build stage (if needed for future TypeScript migration)
FROM base AS builder
WORKDIR /app
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .

# Production runner
FROM base AS runner
WORKDIR /app

# Hardcoded Environment Variables
ENV NODE_ENV=production \
    DB_HOST=72.60.205.71 \
    DB_PORT=5432 \
    DB_NAME=postgres \
    DB_USER=ehruser \
    DB_PASSWORD=nilkamal0_Y \
    AUTH_PROVIDER=postgres \
    JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars \
    PORT=8000 \
    ALLOWED_ORIGINS=* \
    KEYCLOAK_URL=https://auth-dev.nirmitee.io:8080 \
    KEYCLOAK_REALM=ehr-realm \
    KEYCLOAK_ADMIN_USER=admin \
    KEYCLOAK_ADMIN_PASSWORD=admin123 \
    KEYCLOAK_CLIENT_ID=admin-cli \
    SOCKET_IO_ENABLED=true \
    SOCKET_PORT=8001 \
    SOCKET_CORS_ORIGIN=* \
    CLAIMMD_API_URL=https://api.claim.md/v1 \
    LOG_LEVEL=info

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 apiuser

# Copy production dependencies
COPY --from=deps --chown=apiuser:nodejs /app/node_modules ./node_modules
# Copy application code
COPY --chown=apiuser:nodejs . .

USER apiuser

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["npm", "start"]
