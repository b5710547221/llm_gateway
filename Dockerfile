# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Ensure public directory exists
RUN mkdir -p public

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js app
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Install wget for healthcheck
RUN apk add --no-cache wget

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Create necessary directories
RUN mkdir -p .next public

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start the application
CMD ["npm", "start"]
