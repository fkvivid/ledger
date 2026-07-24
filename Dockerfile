# syntax=docker/dockerfile:1

# better-sqlite3 ships linux-arm64 prebuilds that need GLIBC_2.38+.
# Debian Bookworm only has 2.36, so we strip prebuilds and compile
# the native addon against this image's glibc.

FROM node:22-bookworm-slim AS deps
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.28.1 --activate
COPY package.json pnpm-lock.yaml ./
RUN printf 'node-linker=hoisted\n' > .npmrc
RUN pnpm install --frozen-lockfile \
  && rm -rf node_modules/better-sqlite3/prebuilds \
            node_modules/better-sqlite3/build \
  && cd node_modules/better-sqlite3 \
  && npx --yes node-gyp rebuild --release \
  && test -f build/Release/better_sqlite3.node \
  && node -e "require('better-sqlite3')"

FROM node:22-bookworm-slim AS builder
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.28.1 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json /app/pnpm-lock.yaml /app/.npmrc ./
COPY . .
RUN rm -rf node_modules/better-sqlite3/prebuilds \
  && test -f node_modules/better-sqlite3/build/Release/better_sqlite3.node
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build
RUN mkdir -p /native \
  && cp -a node_modules/better-sqlite3 /native/better-sqlite3 \
  && node -e "require('/native/better-sqlite3')"

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update \
  && apt-get install -y --no-install-recommends libstdc++6 \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /native/better-sqlite3 ./node_modules/better-sqlite3
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
VOLUME ["/app/data"]
CMD ["node", "server.js"]
