import z from 'zod'
import { TRPCError } from '@trpc/server'
import { protectedProcedure, trpc } from '../../lib/trpc'
import { hashPassword, signJwt, verifyPassword } from '../../lib/auth'

// Почему Zod-схемы здесь, а не в shared: у проекта соглашение «схема рядом с роутером»,
// выносить в shared будем только при переиспользовании между tRPC и REST.

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

export const registerTrpcRoute = trpc.procedure.input(zRegister).mutation(async ({ ctx, input }) => {
  const email = input.email.trim().toLowerCase()
  const existing = await ctx.prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new TRPCError({ code: 'CONFLICT', message: 'Пользователь с таким email уже существует' })
  }
  const passwordHash = await hashPassword(input.password)
  const user = await ctx.prisma.user.create({
    data: { email, passwordHash, name: input.name, company: input.company, role: 'user' },
  })
  // Почему токен сразу: UX регистрации = мгновенный вход без повторного логина.
  return { user: toPublicUser(user), token: signJwt(user.id) }
})

export const loginTrpcRoute = trpc.procedure.input(zLogin).mutation(async ({ ctx, input }) => {
  const email = input.email.trim().toLowerCase()
  const user = await ctx.prisma.user.findUnique({ where: { email } })
  // Почему общее сообщение: не раскрываем, существует ли email (защита от перебора).
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Неверный email или пароль' })
  }
  return { user: toPublicUser(user), token: signJwt(user.id) }
})

export const meTrpcRoute = protectedProcedure.query(async ({ ctx }) => {
  const user = await ctx.prisma.user.findUnique({ where: { id: ctx.userId } })
  if (!user) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Пользователь не найден' })
  }
  return toPublicUser(user)
})
