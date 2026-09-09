# ─────────────────────────────────────────────────────────────────
# Stage 1 — Install dependencies
# ─────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ─────────────────────────────────────────────────────────────────
# Stage 2 — Build
# ─────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy deps from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args are injected at build time for NEXT_PUBLIC_* vars
# (they get baked into the client bundle during next build)
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

ENV NODE_ENV=production

RUN npm run build

# ─────────────────────────────────────────────────────────────────
# Stage 3 — Runtime
# ─────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Disable Next.js telemetry in production
ENV NEXT_TELEMETRY_DISABLED=1

# Run as non-root for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output (includes trimmed node_modules + server.js)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy static assets and public folder (not included in standalone)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js is produced by output: "standalone" in next.config.ts
CMD ["node", "server.js"]
