import type { PrismaClient } from '@prisma/client'

export const DEMO_USER_EMAIL = 'test@example.com'

export const getDemoUserId = async (prisma: PrismaClient): Promise<number> => {
  const user = await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {},
    create: {
      email: DEMO_USER_EMAIL,
      passwordHash: 'demo',
      name: 'Демо-пользователь',
      role: 'user',
    },
  })
  return user.id
}
