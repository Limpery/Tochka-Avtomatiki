import type { FastifyRequest } from 'fastify'
import { idParamSchema } from '../../shared/schemas/common'
import { benchmarkListQuerySchema } from '../../shared/schemas/catalog'
import { benchmarksService } from './benchmarks.service'

export const benchmarksController = {
  async list(request: FastifyRequest) {
    const { objectTypeId } = benchmarkListQuerySchema.parse(request.query)
    return benchmarksService.list(objectTypeId)
  },

  async getById(request: FastifyRequest) {
    const { id } = idParamSchema.parse(request.params)
    return benchmarksService.getById(id)
  },
}
