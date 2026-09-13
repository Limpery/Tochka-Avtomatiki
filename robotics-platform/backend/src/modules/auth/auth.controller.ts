import type { FastifyReply, FastifyRequest } from 'fastify'
import { loginSchema, registerSchema } from '../../shared/schemas/auth'
import { getAuthUser } from '../../shared/utils/request'
import { authService } from './auth.service'

export const authController = {
  async register(request: FastifyRequest, reply: FastifyReply) {
    const input = registerSchema.parse(request.body)
    const result = await authService.register(input)
    return reply.status(201).send(result)
  },

  async login(request: FastifyRequest) {
    const input = loginSchema.parse(request.body)
    return authService.login(input)
  },

  async me(request: FastifyRequest) {
    const { id } = getAuthUser(request)
    return authService.me(id)
  },
}
