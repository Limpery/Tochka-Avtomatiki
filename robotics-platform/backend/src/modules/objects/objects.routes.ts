import type { FastifyPluginAsync } from 'fastify'
import { objectsController } from './objects.controller'

export const objectsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', objectsController.list)
  fastify.get('/:id', objectsController.getById)
}
