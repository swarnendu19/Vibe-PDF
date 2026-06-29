FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install Chromium, fonts and SSL certs for Puppeteer PDF rendering
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto-emoji

# Configure Puppeteer to skip downloading Chromium and use the Alpine system browser instead
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

FROM base AS builder
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @repo/compiler... build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=8081
EXPOSE 8081

# Copy built workspace
COPY --from=builder /app /app

CMD ["pnpm", "--filter", "@repo/compiler", "start"]
