import type { FastifyPluginAsync } from 'fastify'
import { projectsController } from './projects.controller'
import { matchesController } from '../matches/matches.controller'
import { economicsController } from '../economics/economics.controller'

// Почему хук на весь плагин: все маршруты проектов требуют авторизации, проще один preHandler.
export const projectsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', fastify.authenticate)

  fastify.get('/', projectsController.list)
  fastify.post('/', projectsController.create)
  fastify.get('/:id', projectsController.getById)
  fastify.patch('/:id', projectsController.update)
  fastify.delete('/:id', projectsController.remove)

  fastify.post('/:id/processes', projectsController.addProcess)
  fastify.delete('/:id/processes/:processId', projectsController.removeProcess)

  // Подбор и экономика живут в своих модулях, но URL вложены в проект.
  fastify.get('/:id/matches', matchesController.list)
  fastify.post('/:id/matches', matchesController.generate)
  fastify.get('/:id/economics', economicsController.list)
  fastify.get('/:id/economics/:solutionId', economicsController.getForSolution)
}
