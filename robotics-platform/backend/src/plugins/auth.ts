import fp from 'fastify-plugin'
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import { verifyToken, type AuthUser } from '../shared/utils/jwt'
import { UnauthorizedError } from '../shared/errors'

declare module 'fastify' {
  interface FastifyInstance {
    /** preHandler: проверяет Bearer-токен и кладёт пользователя в request.user */
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
  interface FastifyRequest {
    // null до прохождения authenticate (decorateRequest требует примитивное начальное значение)
    user: AuthUser | null
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  // Почему null: Fastify 5 запрещает decorateRequest с объектами-ссылками (они бы разделялись между запросами).
  fastify.decorateRequest('user', null)

  fastify.decorate('authenticate', async (request: FastifyRequest) => {
    const header = request.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedError('Отсутствует заголовок Authorization: Bearer <token>')
    }
    request.user = verifyToken(header.slice('Bearer '.length).trim())
  })
}

// Почему fastify-plugin: без него декораторы остаются в дочернем контексте и недоступны модулям.
export default fp(authPlugin, { name: 'auth' })
