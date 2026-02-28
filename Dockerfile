# ── Stage 1: Build ──────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (cached layer)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build frontend
COPY tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts ./
COPY index.html ./
COPY public ./public
COPY src ./src
RUN npm run build

# ── Stage 2: Runtime ────────────────────────────────────────
FROM node:22-alpine

# bcrypt native addon needs build tools
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install production dependencies (includes tsx for server runtime)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev \
    && apk del python3 make g++ \
    && rm -rf /root/.npm /tmp/*

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Copy server source + seed data
COPY server ./server
COPY src/data/seed ./src/data/seed

# Create persistent data directories
RUN mkdir -p data/uploads data/processed

# ── Environment ─────────────────────────────────────────────
ENV NODE_ENV=production
# Azure App Service uses PORT env var; WEBSITES_PORT is the Azure-specific override
ENV PORT=8080

EXPOSE 8080

# ── Health Check ────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -q --spider http://localhost:${PORT}/api/health || exit 1

# ── Start ───────────────────────────────────────────────────
CMD ["npx", "tsx", "server/index.ts"]
