import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { AppError } from '../shared/errors'

interface ErrorBody {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

function toBody(code: string, message: string, details?: unknown): ErrorBody {
  return details === undefined ? { error: { code, message } } : { error: { code, message, details } }
}

// Почему один обработчик на всё приложение: единый формат ответа { error: { code, message, details? } }
// для Zod, Prisma, наших AppError и неожиданных исключений.
const errorHandlerPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send(
        toBody(
          'VALIDATION_ERROR',
          'Ошибка валидации входных данных',
          error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        ),
      )
    }

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send(toBody(error.code, error.message, error.details))
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2025 - запись не найдена (update/delete), P2002 - нарушение unique, P2003 - нарушение FK.
      if (error.code === 'P2025') {
        return reply.status(404).send(toBody('NOT_FOUND', 'Запись не найдена'))
      }
      if (error.code === 'P2002') {
        return reply.status(409).send(toBody('CONFLICT', 'Запись с такими данными уже существует'))
      }
      if (error.code === 'P2003') {
        return reply.status(400).send(toBody('INVALID_REFERENCE', 'Ссылка на несуществующую запись'))
      }
    }

    // Ошибки самого Fastify (неверный JSON, слишком большое тело и т.п.) уже имеют statusCode < 500.
    const statusCode = typeof error.statusCode === 'number' ? error.statusCode : 500
    if (statusCode < 500) {
      return reply.status(statusCode).send(toBody(error.code ?? 'BAD_REQUEST', error.message))
    }

    request.log.error(error)
    return reply.status(500).send(toBody('INTERNAL_ERROR', 'Внутренняя ошибка сервера'))
  })

  fastify.setNotFoundHandler((request, reply) => {
    return reply
      .status(404)
      .send(toBody('ROUTE_NOT_FOUND', `Маршрут ${request.method} ${request.url} не найден`))
  })
}

export default fp(errorHandlerPlugin, { name: 'error-handler' })
