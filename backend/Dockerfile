# Контекст сборки — корень репозитория:
#   docker build -f backend/Dockerfile .
# syntax=docker/dockerfile:1
FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app

# ---------- deps ----------
FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/package.json
# webapp/package.json нужен только для разрешения workspace, сам webapp в backend-образ не копируем
COPY webapp/package.json ./webapp/package.json
# --ignore-scripts: prepare (pnpm pgc) требует schema + prisma.config.ts,
# которых на этом этапе ещё нет — генерация выполняется в build/prod/dev позже
RUN pnpm install --filter @memmemory/backend --frozen-lockfile --ignore-scripts

# ---------- build ----------
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend ./backend
# prisma generate читает prisma.config.ts -> нужен DATABASE_URL (достаточно dummy)
ENV DATABASE_URL="postgresql://tochka_db:tochka_db@localhost:5432/tochka_db?schema=public"
RUN pnpm --filter @memmemory/backend pgc && \
    pnpm --filter @memmemory/backend build

# ---------- prod ----------
FROM node:24-alpine AS prod
ENV NODE_ENV=production
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/package.json
COPY webapp/package.json ./webapp/package.json
# Ставим все зависимости (prisma CLI — devDep, нужен в рантайме для migrate deploy)
RUN pnpm install --filter @memmemory/backend --frozen-lockfile --ignore-scripts
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/src/prisma ./backend/src/prisma
COPY --from=build /app/backend/prisma.config.ts ./backend/prisma.config.ts
WORKDIR /app/backend
EXPOSE 3000
# generate нужен в рантайме: prod-установка node_modules свежая, клиент из build-стадии не переносится
CMD ["sh", "-c", "pnpm exec prisma generate && pnpm exec prisma migrate deploy && node dist/index.js"]

# ---------- dev ----------
FROM base AS dev
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/package.json
COPY webapp/package.json ./webapp/package.json
RUN pnpm install --filter @memmemory/backend --frozen-lockfile --ignore-scripts
COPY backend ./backend
WORKDIR /app/backend
EXPOSE 3000
# клиент Prisma генерируется на старте: при install скрипты отключены, а volume может перекрыть src
CMD ["sh", "-c", "pnpm exec prisma generate && pnpm dev"]
