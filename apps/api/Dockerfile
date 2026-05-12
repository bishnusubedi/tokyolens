FROM node:20-alpine AS base
RUN npm install -g pnpm@9.15.0
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

# Build shared packages
FROM deps AS builder
COPY packages/typescript-config ./packages/typescript-config
COPY packages/shared ./packages/shared
COPY packages/database ./packages/database
COPY apps/api ./apps/api
RUN pnpm --filter @repo/shared build
RUN pnpm --filter @repo/database db:generate
RUN pnpm --filter @repo/api build

# Production image
FROM node:20-alpine AS production
RUN npm install -g pnpm@9.15.0
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/typescript-config/package.json ./packages/typescript-config/
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/database/package.json ./packages/database/
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist

RUN pnpm install --frozen-lockfile --prod
RUN pnpm --filter @repo/database db:generate

EXPOSE 3001
CMD ["node", "apps/api/dist/index.js"]
