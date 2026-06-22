# Gunakan Node.js 20 agar warning Supabase hilang
FROM node:20-alpine AS base

# 1. Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json ./
RUN npm install

# 2. Build aplikasi Next.js
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Buat user non-root untuk keamanan
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy folder public
COPY --from=builder /app/public ./public

# Copy folder .next (karena tidak pakai standalone, kita copy seluruh hasil build)
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

# Copy node_modules dan package.json agar perintah "next start" bisa dijalankan
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3002
ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

# Jalankan menggunakan next start (sesuai script di package.json Anda)
CMD ["npm", "run", "start"]
