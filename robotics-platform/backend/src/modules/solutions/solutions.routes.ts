import type { FastifyPluginAsync } from 'fastify'
import { solutionsController } from './solutions.controller'

// Каталог публичный: смотреть решения можно без регистрации, проекты и сравнения — нет.
export const solutionsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', solutionsController.list)
  fastify.get('/:id', solutionsController.getById)
  fastify.get('/:id/specs', solutionsController.getSpecs)
  fastify.get('/:id/case-studies', solutionsController.getCaseStudies)
}

// Вспомогательные справочники каталога (фильтры на фронтенде).
export const catalogRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/vendors', solutionsController.listVendors)
  fastify.get('/solution-categories', solutionsController.listCategories)
  fastify.get('/tags', solutionsController.listTags)
}
