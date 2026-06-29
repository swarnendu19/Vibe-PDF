FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

FROM base AS builder
# Copy the whole workspace to allow monorepo resolution
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @repo/web... build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

COPY --from=builder /app /app

CMD ["pnpm", "--filter", "@repo/web", "start"]
