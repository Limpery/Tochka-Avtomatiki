import { initTRPC, TRPCError } from '@trpc/server'
import * as trpcExpress from '@trpc/server/adapters/express'
import type { Express } from 'express'
import type { TrpcRouter } from '../router'
import type { AppContext, RequestContext } from './ctx'
import { extractBearerToken, verifyJwt } from './auth'

// Почему контекст — RequestContext: каждому HTTP-запросу нужен свой userId из JWT,
// а общий AppContext (prisma) переиспользуется между запросами.
export const trpc = initTRPC.context<RequestContext>().create()

// Почему отдельная процедура: публичные каталоги остаются без авторизации,
// а проекты/сравнения/оценки требуют JWT — так видно границу в коде роутеров.
export const protectedProcedure = trpc.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Требуется авторизация' })
  }
  return await next({ ctx: { ...ctx, userId: ctx.userId } })
})

export const applyTrpcToExpressApp = (expressApp: Express, appContext: AppContext, trpcRouter: TrpcRouter) => {
  expressApp.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: trpcRouter,
      createContext({ req }): RequestContext {
        // Почему тихое null при отсутствии токена: публичные процедуры работают без JWT,
        // а защищённые сами бросят UNAUTHORIZED через protectedProcedure.
        const token = extractBearerToken(req.headers.authorization)
        const userId = token ? verifyJwt(token) : null
        return { ...appContext, userId }
      },
    }),
  )
}
