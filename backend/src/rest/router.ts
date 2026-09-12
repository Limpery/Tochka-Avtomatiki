import { Router, type Express } from 'express'
import type { AppContext } from '../lib/ctx'
import { createAuthRestRoutes } from './authRoutes'
import { createCatalogRestRoutes } from './catalogRoutes'
import { createProjectsRestRoutes } from './projectsRoutes'
import { createComparisonsRestRoutes } from './comparisonsRoutes'
import { optionalAuth } from './middleware'

// Почему один монтажный модуль: точка входа остаётся тонкой,
// а добавление новых доменов (matches/economics) — это +1 импорт.
export const applyRestToExpressApp = (app: Express, ctx: AppContext) => {
  const api = Router()
  api.use(optionalAuth)
  api.use(createAuthRestRoutes(ctx))
  api.use(createCatalogRestRoutes(ctx))
  api.use(createProjectsRestRoutes(ctx))
  api.use(createComparisonsRestRoutes(ctx))
  app.use('/api', api)

  // Почему 404 именно для /api: фронт на Vite обслуживает свои SPA-пути сам,
  // а неизвестный путь API должен вернуть JSON, а не HTML.
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Эндпоинт не найден' } })
  })
}
