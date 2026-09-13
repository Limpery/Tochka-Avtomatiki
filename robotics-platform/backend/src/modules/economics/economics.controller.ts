import type { FastifyRequest } from 'fastify'
import { idParamSchema } from '../../shared/schemas/common'
import { economicsParamsSchema } from '../../shared/schemas/projects'
import { getAuthUser } from '../../shared/utils/request'
import { economicsService } from './economics.service'

export const economicsController = {
  async list(request: FastifyRequest) {
    const user = getAuthUser(request)
    const { id } = idParamSchema.parse(request.params)
    return economicsService.list(user.id, id)
  },

  async getForSolution(request: FastifyRequest) {
    const user = getAuthUser(request)
    const { id, solutionId } = economicsParamsSchema.parse(request.params)
    return economicsService.getForSolution(user.id, id, solutionId)
  },
}
