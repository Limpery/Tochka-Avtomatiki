# RoboSelect — платформа подбора роботизированных решений

Подбор, сравнение и оценка экономической эффективности роботизации (AGV, AMR, манипуляторы, дроны, сервисные роботы) для бизнеса.

**Сценарий пользователя (4 шага):**

1. `/projects/new` — выбор отрасли (Торговля / Логистика / Социальная сфера / Другое), типа объекта и параметров
2. `/projects/[id]/solutions` — подбор решений из каталога по применимости
3. `/projects/[id]/compare` — сравнение выбранных решений в таблице
4. `/projects/[id]/economics` — экономический расчёт (**заглушка — все показатели = 0**)

## Стек

| Слой     | Технологии                                                                                     |
| -------- | ---------------------------------------------------------------------------------------------- |
| Backend  | Node.js 20+, TypeScript strict, Fastify 5, Prisma 7 + `@prisma/adapter-pg`, PostgreSQL 15+, Zod, JWT, bcryptjs |
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS + shadcn/ui-компоненты, TanStack Query, Zustand, React Hook Form + Zod, Axios |
| Tooling  | pnpm, tsx                                                                                      |

## Структура

```
robotics-platform/
├── backend/
│   ├── prisma.config.ts            # Prisma 7: schema path, seed, datasource url
│   └── src/
│       ├── prisma/                 # schema.prisma (19 моделей), client.ts (adapter-pg), seed.ts
│       ├── modules/                # auth, industries, objects, solutions, projects,
│       │                           # comparisons, matches, economics, benchmarks
│       │                           # (каждый: *.routes.ts → *.controller.ts → *.service.ts)
│       ├── shared/                 # schemas (Zod), errors, utils (jwt, password)
│       ├── plugins/                # auth (Bearer JWT), cors, error-handler
│       ├── config/env.ts           # валидация переменных окружения
│       └── index.ts                # точка входа Fastify
├── frontend/
│   └── src/
│       ├── app/                    # (auth)/login, (auth)/register, (dashboard)/...
│       ├── components/             # ui (shadcn-style), layout, solutions, projects, comparisons
│       ├── hooks/                  # React Query хуки по доменам
│       ├── lib/                    # api.ts (Axios + JWT interceptor), query-client.ts, utils.ts
│       ├── stores/                 # auth-store.ts, selection-store.ts (Zustand)
│       └── types/                  # типы API
└── docker-compose.yml              # PostgreSQL для локальной разработки
```

## Запуск

### 0. Требования

- Node.js 20+ и pnpm 9+ (`npm i -g pnpm`)
- PostgreSQL 15+ — локально или через Docker (`docker compose up -d` из корня проекта)

### 1. Backend

```bash
cd backend
cp .env.example .env          # проверьте DATABASE_URL и задайте JWT_SECRET (>= 16 символов)
pnpm install
pnpm db:push                  # создаёт все таблицы и генерирует Prisma Client
pnpm db:seed                  # тестовые данные: 4 отрасли, 6 типов объектов, 10 решений, эталоны, пользователь
pnpm dev                      # http://localhost:4000
```

Тестовый пользователь после seed: `test@example.com` / `Test1234!`

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:4000/api
pnpm install
pnpm dev                      # http://localhost:3000
```

### 3. Проверка

```bash
# health
curl http://localhost:4000/api/health

# справочники
curl http://localhost:4000/api/industries
curl http://localhost:4000/api/industries/1/object-types
curl "http://localhost:4000/api/solutions?objectTypeId=1&tagIds=1,4"
curl http://localhost:4000/api/benchmarks?objectTypeId=1

# авторизация
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'
# → { "user": {...}, "token": "..." }

TOKEN=<token из ответа>
curl http://localhost:4000/api/auth/me -H "Authorization: Bearer $TOKEN"

# проект → подбор → экономика (заглушка)
curl http://localhost:4000/api/projects -H "Authorization: Bearer $TOKEN"
curl -X POST http://localhost:4000/api/projects/1/matches -H "Authorization: Bearer $TOKEN"
curl http://localhost:4000/api/projects/1/economics/1 -H "Authorization: Bearer $TOKEN"
# → все показатели 0, isStub: true

# проверка типов
cd backend && pnpm typecheck
cd frontend && pnpm typecheck
```

Формат ошибок единый: `{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }`.

## API

| Метод  | Путь                                        | Auth | Описание                                     |
| ------ | ------------------------------------------- | ---- | -------------------------------------------- |
| POST   | `/api/auth/register`                        | —    | Регистрация, возвращает `{ user, token }`    |
| POST   | `/api/auth/login`                           | —    | Вход                                         |
| GET    | `/api/auth/me`                              | ✓    | Текущий пользователь                         |
| GET    | `/api/industries`                           | —    | Отрасли                                      |
| GET    | `/api/industries/:id/object-types`          | —    | Типы объектов отрасли                        |
| GET    | `/api/object-types?industryId=`             | —    | Типы объектов                                |
| GET    | `/api/solutions?industryId=&objectTypeId=&categoryId=&vendorId=&tagIds=1,2&search=` | — | Каталог с фильтрами |
| GET    | `/api/solutions/:id`                        | —    | Решение + specs + кейсы + применимость       |
| GET    | `/api/solutions/:id/specs`                  | —    | Характеристики (EAV)                         |
| GET    | `/api/solutions/:id/case-studies`           | —    | Кейсы внедрения                              |
| GET    | `/api/vendors`, `/api/solution-categories`, `/api/tags` | — | Справочники каталога               |
| GET    | `/api/benchmarks?objectTypeId=`             | —    | Эталонные объекты                            |
| GET/POST | `/api/projects`                           | ✓    | Список / создание проекта                    |
| GET/PATCH/DELETE | `/api/projects/:id`               | ✓    | Проект                                       |
| POST   | `/api/projects/:id/processes`               | ✓    | Добавить бизнес-процесс                      |
| DELETE | `/api/projects/:id/processes/:processId`    | ✓    | Удалить процесс                              |
| GET/POST | `/api/projects/:id/matches`               | ✓    | Подбор решений (POST пересчитывает)          |
| GET    | `/api/projects/:id/economics`               | ✓    | Все расчёты проекта                          |
| GET    | `/api/projects/:id/economics/:solutionId`   | ✓    | Расчёт для решения (**заглушка: нули**)      |
| GET/POST | `/api/comparisons?projectId=`             | ✓    | Сравнения (POST принимает `solutionIds[]`)   |
| GET/DELETE | `/api/comparisons/:id`                  | ✓    | Сравнение с items → solution → specs         |
| POST   | `/api/comparisons/:id/items`                | ✓    | Добавить решение                             |
| DELETE | `/api/comparisons/:id/items/:itemId`        | ✓    | Убрать решение                               |

## Заглушки и что менять дальше

- **Подбор** (`backend/src/modules/matches/matches.service.ts`): `matchScore = suitabilityScore × 100` из `solution_applicability`; экономические поля — 0. Реальный алгоритм подставляется в `generate()`.
- **Экономика** (`backend/src/modules/economics/economics.service.ts`): upsert записи `economic_calculations` с нулями и `assumptions.stub = true`. Формула подключается в `getForSolution()`, фронтенд менять не нужно.
- **Данные вендоров**: добавляются в `backend/src/prisma/seed.ts` (массив `SOLUTIONS`) или напрямую в БД (`pnpm db:studio`).

## Полезные команды (backend)

| Команда            | Действие                                              |
| ------------------ | ----------------------------------------------------- |
| `pnpm dev`         | Сервер с hot-reload (tsx watch)                       |
| `pnpm build` / `pnpm start` | Сборка в `dist/` и запуск                    |
| `pnpm db:push`     | Синхронизировать схему с БД (без миграций)            |
| `pnpm db:migrate`  | Создать миграцию (`prisma migrate dev`)               |
| `pnpm db:seed`     | Заполнить тестовыми данными (идемпотентно)            |
| `pnpm db:reset`    | Пересоздать БД и засеять заново                       |
| `pnpm db:studio`   | Prisma Studio                                         |
| `pnpm typecheck`   | Проверка типов                                        |
