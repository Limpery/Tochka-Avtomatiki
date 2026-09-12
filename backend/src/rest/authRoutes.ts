import { Router, type Router as ExpressRouter } from 'express'
import z from 'zod'
import type { AppContext } from '../lib/ctx'
import { hashPassword, signJwt, verifyPassword } from '../lib/auth'
import { asyncHandler, requireAuth, type AuthRequest } from './middleware'
import { sendApiError } from './errors'

const zRegister = z.object({
  email: z.string().email('Некорректный email').max(200),
  password: z.string().min(8, 'Минимум 8 символов').max(100),
  name: z.string().min(1).max(100).optional(),
  company: z.string().max(200).optional(),
})

const zLogin = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const toPublicUser = (u: { id: number; email: string; name: string | null; company: string | null; role: string }) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  company: u.company,
  role: u.role,
})

// Почему REST дублирует tRPC-auth тонким слоем: ТЗ требует именно /api/auth/*,
// а бизнес-правила (нормализация email, общее сообщение логина) должны совпадать.
export const createAuthRestRoutes = (ctx: AppContext): ExpressRouter => {
  const r = Router()

  r.post(
    '/auth/register',
    asyncHandler(async (req: AuthRequest, res) => {
      const parsed = zRegister.safeParse(req.body)
      if (!parsed.success) {
        sendApiError(res, 400, 'VALIDATION_ERROR', 'Некорректные данные', parsed.error.flatten())
        return
      }
      const email = parsed.data.email.trim().toLowerCase()
      const existing = await ctx.prisma.user.findUnique({ where: { email } })
      if (existing) {
        sendApiError(res, 409, 'CONFLICT', 'Пользователь с таким email уже существует')
        return
      }
      const user = await ctx.prisma.user.create({
        data: {
          email,
          passwordHash: await hashPassword(parsed.data.password),
          name: parsed.data.name,
          company: parsed.data.company,
          role: 'user',
        },
      })
      res.status(201).json({ user: toPublicUser(user), token: signJwt(user.id) })
    }),
  )

  r.post(
    '/auth/login',
    asyncHandler(async (req: AuthRequest, res) => {
      const parsed = zLogin.safeParse(req.body)
      if (!parsed.success) {
        sendApiError(res, 400, 'VALIDATION_ERROR', 'Некорректные данные', parsed.error.flatten())
        return
      }
      const email = parsed.data.email.trim().toLowerCase()
      const user = await ctx.prisma.user.findUnique({ where: { email } })
      if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
        sendApiError(res, 401, 'UNAUTHORIZED', 'Неверный email или пароль')
        return
      }
      res.json({ user: toPublicUser(user), token: signJwt(user.id) })
    }),
  )

  r.get(
    '/auth/me',
    requireAuth,
    asyncHandler(async (req: AuthRequest, res) => {
      const user = await ctx.prisma.user.findUnique({ where: { id: req.userId ?? 0 } })
      if (!user) {
        sendApiError(res, 404, 'NOT_FOUND', 'Пользователь не найден')
        return
      }
      res.json({ user: toPublicUser(user) })
    }),
  )

  return r
}
