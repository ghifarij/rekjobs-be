## Multi-stage build: builder compiles TS (and Prisma Client), runner serves built app

# ---------- Builder ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (clean, reproducible)
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# Copy the rest of the source, generate Prisma Client, then build TypeScript
COPY . .
RUN npx prisma generate
RUN npm run build


# ---------- Runner ----------
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Only copy what is needed at runtime
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

# Install only production dependencies
RUN npm ci --omit=dev

# Expose the application port
EXPOSE 80

# Start without rebuilding
CMD ["node", "dist/index.js"]