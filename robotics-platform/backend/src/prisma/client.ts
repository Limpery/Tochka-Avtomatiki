import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { env } from '../config/env'

// Почему adapter-pg: Prisma 7 работает через driver adapters, «голый» new PrismaClient() устарел.
// Клиент — singleton на процесс, чтобы не плодить пулы соединений при hot-reload.
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })

export const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
})
