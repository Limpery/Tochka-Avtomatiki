import type { FastifyPluginAsync } from 'fastify'
import { industriesController } from './industries.controller'

// Справочники публичные: нужны на странице регистрации/лендинге ещё до логина.
export const industriesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', industriesController.list)
  fastify.get('/:id', industriesController.getById)
  fastify.get('/:id/object-types', industriesController.listObjectTypes)
}
