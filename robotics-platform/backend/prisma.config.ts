import 'dotenv/config'
import { defineConfig } from 'prisma/config'

// Почему отдельный конфиг: Prisma 7 больше не читает url из schema.prisma и не грузит .env сама.
// Все параметры подключения задаются здесь, а сам клиент создаётся через driver adapter (см. src/prisma/client.ts).
export default defineConfig({
  schema: './src/prisma/schema.prisma',
  migrations: {
    path: './src/prisma/migrations',
    seed: 'tsx src/prisma/seed.ts',
  },
  datasource: {
    // Non-null assertion допустим: без DATABASE_URL CLI всё равно упадёт с понятной ошибкой.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    url: process.env.DATABASE_URL!,
  },
})
