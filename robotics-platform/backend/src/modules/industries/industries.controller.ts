import type { FastifyRequest } from 'fastify'
import { idParamSchema } from '../../shared/schemas/common'
import { industriesService } from './industries.service'

export const industriesController = {
  async list() {
    return industriesService.list()
  },

  async getById(request: FastifyRequest) {
    const { id } = idParamSchema.parse(request.params)
    return industriesService.getById(id)
  },

  async listObjectTypes(request: FastifyRequest) {
    const { id } = idParamSchema.parse(request.params)
    return industriesService.listObjectTypes(id)
  },
}
