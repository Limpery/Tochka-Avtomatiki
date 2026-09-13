import type { FastifyRequest } from 'fastify'
import { idParamSchema } from '../../shared/schemas/common'
import { solutionListQuerySchema } from '../../shared/schemas/solutions'
import { solutionsService } from './solutions.service'

export const solutionsController = {
  async list(request: FastifyRequest) {
    const query = solutionListQuerySchema.parse(request.query)
    return solutionsService.list(query)
  },

  async getById(request: FastifyRequest) {
    const { id } = idParamSchema.parse(request.params)
    return solutionsService.getById(id)
  },

  async getSpecs(request: FastifyRequest) {
    const { id } = idParamSchema.parse(request.params)
    return solutionsService.getSpecs(id)
  },

  async getCaseStudies(request: FastifyRequest) {
    const { id } = idParamSchema.parse(request.params)
    return solutionsService.getCaseStudies(id)
  },

  async listVendors() {
    return solutionsService.listVendors()
  },

  async listCategories() {
    return solutionsService.listCategories()
  },

  async listTags() {
    return solutionsService.listTags()
  },
}
