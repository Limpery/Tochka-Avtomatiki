import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { env } from '../../config/env'
import { UnauthorizedError } from '../errors'

export interface AuthUser {
  id: number
  role: string
}

// Почему sub — строка: так требует спецификация JWT и типы jsonwebtoken.
const payloadSchema = z.object({
  sub: z.string().regex(/^\d+$/),
  role: z.string(),
})

export function signToken(user: AuthUser): string {
  return jwt.sign({ sub: String(user.id), role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN_SECONDS,
  })
}

export function verifyToken(token: string): AuthUser {
  let decoded: unknown
  try {
    decoded = jwt.verify(token, env.JWT_SECRET)
  } catch {
    throw new UnauthorizedError('Недействительный или просроченный токен', 'INVALID_TOKEN')
  }
  const parsed = payloadSchema.safeParse(decoded)
  if (!parsed.success) {
    throw new UnauthorizedError('Некорректный формат токена', 'INVALID_TOKEN')
  }
  return { id: Number(parsed.data.sub), role: parsed.data.role }
}
