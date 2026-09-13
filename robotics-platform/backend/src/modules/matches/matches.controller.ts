import type { FastifyReply, FastifyRequest } from 'fastify'
import { idParamSchema } from '../../shared/schemas/common'
import { getAuthUser } from '../../shared/utils/request'
import { matchesService } from './matches.service'

export const matchesController = {
  async list(request: FastifyRequest) {
    const user = getAuthUser(request)
    const { id } = idParamSchema.parse(request.params)
    return matchesService.list(user.id, id)
  },

  async generate(request: FastifyRequest, reply: FastifyReply) {
    const user = getAuthUser(request)
    const { id } = idParamSchema.parse(request.params)
    const matches = await matchesService.generate(user.id, id)
    return reply.status(201).send(matches)
  },
}
