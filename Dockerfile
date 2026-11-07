FROM oven/bun:1.3.3-debian AS dependencies
WORKDIR /app
ENV LEFTHOOK=0
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package.json bun.lock ./
COPY scripts/prepare.js ./scripts/prepare.js
RUN bun install --frozen-lockfile

FROM dependencies AS builder
COPY prisma.config.js ./
COPY prisma ./prisma
COPY src ./src
RUN bun run db:generate

FROM dependencies AS migrator
WORKDIR /app
COPY prisma.config.js ./
COPY prisma ./prisma
COPY src ./src
RUN bun run db:generate
CMD ["./node_modules/.bin/prisma", "migrate", "deploy"]

FROM oven/bun:1.3.3-debian AS production-dependencies
WORKDIR /app
ENV LEFTHOOK=0
COPY package.json bun.lock ./
COPY prisma.config.js ./
COPY prisma/schema.prisma ./prisma/schema.prisma
COPY scripts/prepare.js ./scripts/prepare.js
RUN bun install --frozen-lockfile --production

FROM oven/bun:1.3.3-debian AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY package.json ./
COPY prisma ./prisma
COPY prisma.config.js ./
COPY scripts/start.sh ./scripts/start.sh
COPY src ./src
COPY docs ./docs
USER bun
EXPOSE 3000
CMD ["sh", "./scripts/start.sh"]