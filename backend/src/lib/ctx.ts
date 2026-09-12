import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

export const createAppContext = () => {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('Переменная окружения DATABASE_URL не задана')
  }

  const adapter = new PrismaPg({ connectionString })

  const prisma = new PrismaClient({ adapter })
  return {
    prisma,
    stop: async () => {
      await prisma.$disconnect()
    },
  }
}

export type AppContext = ReturnType<typeof createAppContext>

// Почему userId nullable и отдельно от AppContext: tRPC-контекст собирается
// на каждый запрос из заголовка Authorization, а базовый контекст — один на процесс.
export interface RequestContext extends AppContext {
  userId: number | null
}
