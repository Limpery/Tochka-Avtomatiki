import type { PrismaClient } from '@prisma/client'
import type { RequestContext } from './ctx'

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

// Почему JWT первым, демо вторым: залогиненный пользователь работает со своими данными,
// а анонимная витрина и старые клиенты без токена продолжают работать как раньше.
export const getActiveUserId = async (ctx: Pick<RequestContext, 'prisma' | 'userId'>): Promise<number> =>
  ctx.userId ?? (await getDemoUserId(ctx.prisma))
