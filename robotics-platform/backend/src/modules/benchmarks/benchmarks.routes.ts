import type { FastifyPluginAsync } from 'fastify'
import { benchmarksController } from './benchmarks.controller'

export const benchmarksRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', benchmarksController.list)
  fastify.get('/:id', benchmarksController.getById)
}
