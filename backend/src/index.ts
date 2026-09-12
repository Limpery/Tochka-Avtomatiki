import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { applyTrpcToExpressApp } from './lib/trpc'
import { trpcRouter } from './router'
import { type AppContext, createAppContext } from './lib/ctx'
import { applyRestToExpressApp } from './rest/router'

void (async () => {
  let ctx: AppContext | null = null
  try {
    // Почему fail-fast до listen: без JWT_SECRET сервер стартует, но register/login падают с 500.
    // Лучше упасть на старте с понятным сообщением, чем чинить по логам первого пользователя.
    if (!process.env.JWT_SECRET) {
      throw new Error('Переменная окружения JWT_SECRET не задана (см. backend/env.example)')
    }
    ctx = createAppContext()
    const expressApp = express()
    expressApp.use(cors())
    // Почему json() до REST и tRPC: REST-фасад /api/* разбирает body сам,
    // tRPC-middleware свой парсер имеет — порядок не конфликтует.
    expressApp.use(express.json({ limit: '1mb' }))
    expressApp.get('/ping', (req, res) => {
      res.send('pong')
    })
    applyRestToExpressApp(expressApp, ctx)
    applyTrpcToExpressApp(expressApp, ctx, trpcRouter)
    // Почему единый обработчик последним: ловит и Zod/TRPC-ошибки, и reject async-хендлеров.
    expressApp.use(
      (
        err: unknown,
        _req: express.Request,
        res: express.Response,
        // eslint-disable-next-line no-unused-vars -- 4 аргумента обязательны, иначе Express не распознает error-handler
        _next: express.NextFunction,
      ) => {
        // eslint-disable-next-line no-console
        console.error(err)
        if (res.headersSent) {
          return
        }
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } })
      },
    )
    const port = Number(process.env.PORT) || 3000
    expressApp.listen(port, () => {
      // eslint-disable-next-line no-console
      console.info(`Listening at http://localhost:${port}`)
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    await ctx?.stop()
  }
})()
