# ===================================================
# BreatheWise AI — Multi-Stage Production Dockerfile
# Optimized for Google Cloud Run (Distroless / Lean Node Alpine)
# ===================================================

# --- STAGE 1: Build Stage ---
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for maximum layer caching
COPY package*.json ./
RUN npm ci

# Copy source code and build configs
COPY . .

# Run production build (Vite client + TypeScript server)
RUN npm run build

# Prune devDependencies to keep runtime image minimal
RUN npm prune --production

# --- STAGE 2: Production Runtime Stage ---
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Cloud Run expects application to listen on PORT 8080
EXPOSE 8080

# Create non-root user for security hardening
USER node

# Copy only production dependencies and compiled outputs
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/dist-server ./dist-server

# Healthcheck probe for container orchestration
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Start production server
CMD ["node", "dist-server/server/index.js"]
