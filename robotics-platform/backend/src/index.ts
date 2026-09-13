import Fastify from 'fastify'
import { env } from './config/env'
import { prisma } from './prisma/client'
import corsPlugin from './plugins/cors'
import authPlugin from './plugins/auth'
import errorHandlerPlugin from './plugins/error-handler'
import { authRoutes } from './modules/auth/auth.routes'
import { industriesRoutes } from './modules/industries/industries.routes'
import { objectsRoutes } from './modules/objects/objects.routes'
import { catalogRoutes, solutionsRoutes } from './modules/solutions/solutions.routes'
import { projectsRoutes } from './modules/projects/projects.routes'
import { comparisonsRoutes } from './modules/comparisons/comparisons.routes'
import { benchmarksRoutes } from './modules/benchmarks/benchmarks.routes'

// Почему отдельная функция: приложение можно собрать без listen — для тестов через app.inject().
export async function buildApp() {
  const app = Fastify({
    logger: env.NODE_ENV !== 'test',
  })

  await app.register(corsPlugin)
  await app.register(errorHandlerPlugin)
  await app.register(authPlugin)

  app.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  await app.register(authRoutes, { prefix: '/api/auth' })
  await app.register(industriesRoutes, { prefix: '/api/industries' })
  await app.register(objectsRoutes, { prefix: '/api/object-types' })
  await app.register(solutionsRoutes, { prefix: '/api/solutions' })
  await app.register(catalogRoutes, { prefix: '/api' })
  await app.register(projectsRoutes, { prefix: '/api/projects' })
  await app.register(comparisonsRoutes, { prefix: '/api/comparisons' })
  await app.register(benchmarksRoutes, { prefix: '/api/benchmarks' })

  return app
}

async function start() {
  const app = await buildApp()

  // Почему graceful shutdown: tsx watch перезапускает процесс, без закрытия пула
  // Postgres быстро упирается в лимит соединений.
  const shutdown = async (signal: string) => {
    app.log.info(`Получен ${signal}, останавливаем сервер`)
    await app.close()
    await prisma.$disconnect()
    process.exit(0)
  }
  process.on('SIGINT', () => void shutdown('SIGINT'))
  process.on('SIGTERM', () => void shutdown('SIGTERM'))

  try {
    await prisma.$connect()
    await app.listen({ port: env.PORT, host: '0.0.0.0' })
  } catch (error) {
    app.log.error(error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

// Почему проверка: при импорте buildApp из тестов сервер не должен стартовать сам.
if (require.main === module) {
  void start()
}
