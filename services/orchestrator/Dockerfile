FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

FROM base AS builder
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @repo/orchestrator... build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

COPY --from=builder /app /app

CMD ["pnpm", "--filter", "@repo/orchestrator", "start"]
