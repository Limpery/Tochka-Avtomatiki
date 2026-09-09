# Контекст сборки — корень репозитория:
#   docker build -f webapp/Dockerfile .
# syntax=docker/dockerfile:1
FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app

# ---------- deps (весь workspace нужен из-за workspace:* на backend) ----------
FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/package.json
COPY webapp/package.json ./webapp/package.json
# --ignore-scripts: prepare бэкенда (pnpm pgc) требует schema, которой тут ещё нет
RUN pnpm install --filter @memmemory/webapp --frozen-lockfile --ignore-scripts

# ---------- build ----------
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=deps /app/webapp/node_modules ./webapp/node_modules
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend ./backend
COPY webapp ./webapp
ARG VITE_BACKEND_TRPC_URL=http://localhost:3000/trpc
ENV VITE_BACKEND_TRPC_URL=$VITE_BACKEND_TRPC_URL
# prisma generate читает prisma.config.ts -> нужен DATABASE_URL (достаточно dummy, только для generate)
ENV DATABASE_URL="postgresql://tochka_db:tochka_db@localhost:5432/tochka_db?schema=public"
RUN pnpm --filter @memmemory/backend pgc && \
    pnpm --filter @memmemory/webapp build

# ---------- prod (nginx, SPA) ----------
FROM nginx:alpine AS prod
COPY --from=build /app/webapp/dist /usr/share/nginx/html
COPY webapp/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# ---------- dev (vite hot-reload) ----------
FROM base AS dev
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY backend/package.json ./backend/package.json
COPY webapp/package.json ./webapp/package.json
RUN pnpm install --filter @memmemory/webapp --frozen-lockfile --ignore-scripts
COPY backend ./backend
COPY webapp ./webapp
WORKDIR /app/webapp
EXPOSE 5173
CMD ["pnpm", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
