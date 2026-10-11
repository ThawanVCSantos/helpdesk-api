FROM oven/bun:1.3.3-debian AS dependencies
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package.json bun.lock ./
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
CMD ["bunx", "prisma", "migrate", "deploy"]

FROM oven/bun:1.3.3-debian AS production-dependencies
WORKDIR /app
COPY package.json bun.lock ./
COPY prisma.config.js ./
COPY prisma/schema.prisma ./prisma/schema.prisma
RUN bun install --frozen-lockfile --production

FROM oven/bun:1.3.3-debian AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY package.json ./
COPY src ./src
COPY docs ./docs
USER bun
EXPOSE 3000
CMD ["bun", "src/index.js"]