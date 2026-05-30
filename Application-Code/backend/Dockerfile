
# Stage 1: Dependencies

FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci


# Stage 2: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Remove dev dependencies
RUN npm prune --omit=dev


# Stage 3: Runtime

FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup -S nodejs && \
    adduser -S appuser -G nodejs

# Copy only required runtime artifacts
COPY --from=builder --chown=appuser:nodejs /app .

USER appuser

EXPOSE 3000

CMD ["node", "index.js"]
