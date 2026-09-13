import type { FastifyRequest } from 'fastify'
import { idParamSchema } from '../../shared/schemas/common'
import { objectTypeListQuerySchema } from '../../shared/schemas/catalog'
import { objectsService } from './objects.service'

export const objectsController = {
  async list(request: FastifyRequest) {
    const { industryId } = objectTypeListQuerySchema.parse(request.query)
    return objectsService.list(industryId)
  },

  async getById(request: FastifyRequest) {
    const { id } = idParamSchema.parse(request.params)
    return objectsService.getById(id)
  },
}
