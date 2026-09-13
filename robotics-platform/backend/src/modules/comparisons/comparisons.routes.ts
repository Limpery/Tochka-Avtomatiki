import type { FastifyPluginAsync } from 'fastify'
import { comparisonsController } from './comparisons.controller'

export const comparisonsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/', comparisonsController.list)
  fastify.post('/', comparisonsController.create)
  fastify.get('/:id', comparisonsController.getById)
  fastify.delete('/:id', comparisonsController.remove)
  fastify.post('/:id/items', comparisonsController.addItem)
  fastify.delete('/:id/items/:itemId', comparisonsController.removeItem)
}
