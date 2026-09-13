import 'dotenv/config'
import { z } from 'zod'

// Почему Zod для env: сервер должен падать на старте с понятным сообщением,
// а не на первом запросе с загадочной ошибкой из недр jsonwebtoken.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL обязателен'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET должен быть не короче 16 символов'),
  // Число секунд, а не строка вида "7d": типы jsonwebtoken принимают только number | StringValue.
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(604800),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
})

export type Env = z.infer<typeof envSchema>

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`Некорректные переменные окружения (см. .env.example):\n${issues}`)
  }
  return result.data
}

export const env = loadEnv()

// Список разрешённых origin для CORS: "http://a,http://b" -> ["http://a", "http://b"]
export const corsOrigins = env.CORS_ORIGIN.split(',')
  .map((s) => s.trim())
  .filter(Boolean)
