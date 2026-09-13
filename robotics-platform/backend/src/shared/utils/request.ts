import type { FastifyRequest } from 'fastify'
import { UnauthorizedError } from '../errors'
import type { AuthUser } from './jwt'

// Почему helper: request.user опционален по типу (заполняется preHandler-ом),
// а контроллерам нужен гарантированно авторизованный пользователь без проверок в каждом методе.
export function getAuthUser(request: FastifyRequest): AuthUser {
  if (!request.user) {
    throw new UnauthorizedError()
  }
  return request.user
}
