import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { extractBearerToken, verifyJwt } from '../lib/auth'

export interface AuthRequest extends Request {
  // Почему optional: Express создаёт обычный Request, userId появляется только после auth-middleware.
  userId?: number | null
}

// Почему tiny-враппер: Express 5 умеет ловить reject async-хендлеров,
// но явный asyncHandler даёт одинаковое поведение и на Express 4/5.
export const asyncHandler =
  (fn: (req: AuthRequest, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req as AuthRequest, res, next).catch(next)
  }

// Почему optional для каталога: справочники и витрина публичны,
// а userId подхватываем, только если клиент прислал валидный JWT.
export const optionalAuth: RequestHandler = (req, _res, next) => {
  const token = extractBearerToken(req.headers.authorization)
  // Почему через локальную переменную: eslint запрещает присваивание в параметры функции.
  const authReq = req as AuthRequest
  authReq.userId = token ? verifyJwt(token) : null
  next()
}

// Почему строгий require для проектов/сравнений: чужие проекты нельзя читать/модифицировать.
export const requireAuth: RequestHandler = (req, res, next) => {
  const token = extractBearerToken(req.headers.authorization)
  const userId = token ? verifyJwt(token) : null
  if (!userId) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Требуется авторизация' } })
    return
  }
  const authReq = req as AuthRequest
  authReq.userId = userId
  next()
}
