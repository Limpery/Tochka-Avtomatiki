import type { FastifyReply, FastifyRequest } from 'fastify'
import { idParamSchema } from '../../shared/schemas/common'
import {
  addComparisonItemSchema,
  comparisonItemParamsSchema,
  comparisonListQuerySchema,
  createComparisonSchema,
} from '../../shared/schemas/comparisons'
import { getAuthUser } from '../../shared/utils/request'
import { comparisonsService } from './comparisons.service'

export const comparisonsController = {
  async list(request: FastifyRequest) {
    const user = getAuthUser(request)
    const { projectId } = comparisonListQuerySchema.parse(request.query)
    return comparisonsService.list(user.id, projectId)
  },

  async getById(request: FastifyRequest) {
    const user = getAuthUser(request)
    const { id } = idParamSchema.parse(request.params)
    return comparisonsService.getById(user.id, id)
  },

  async create(request: FastifyRequest, reply: FastifyReply) {
    const user = getAuthUser(request)
    const input = createComparisonSchema.parse(request.body)
    const comparison = await comparisonsService.create(user.id, input)
    return reply.status(201).send(comparison)
  },

  async remove(request: FastifyRequest) {
    const user = getAuthUser(request)
    const { id } = idParamSchema.parse(request.params)
    return comparisonsService.remove(user.id, id)
  },

  async addItem(request: FastifyRequest, reply: FastifyReply) {
    const user = getAuthUser(request)
    const { id } = idParamSchema.parse(request.params)
    const { solutionId } = addComparisonItemSchema.parse(request.body)
    const comparison = await comparisonsService.addItem(user.id, id, solutionId)
    return reply.status(201).send(comparison)
  },

  async removeItem(request: FastifyRequest) {
    const user = getAuthUser(request)
    const { id, itemId } = comparisonItemParamsSchema.parse(request.params)
    return comparisonsService.removeItem(user.id, id, itemId)
  },
}
