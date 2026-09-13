import { prisma } from '../../prisma/client'
import { ConflictError, NotFoundError, UnauthorizedError } from '../../shared/errors'
import { hashPassword, verifyPassword } from '../../shared/utils/password'
import { signToken } from '../../shared/utils/jwt'
import type { LoginInput, RegisterInput } from '../../shared/schemas/auth'

// Почему select, а не omit: passwordHash никогда не должен попасть в ответ, даже случайно.
const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  company: true,
  role: true,
  createdAt: true,
} as const

export const authService = {
  async register(input: RegisterInput) {
    const exists = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } })
    if (exists) {
      throw new ConflictError('Пользователь с таким email уже зарегистрирован', 'EMAIL_TAKEN')
    }

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash: await hashPassword(input.password),
        name: input.name,
        company: input.company,
      },
      select: publicUserSelect,
    })

    return { user, token: signToken({ id: user.id, role: user.role }) }
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } })
    // Одно сообщение на оба случая: не раскрываем, существует ли email.
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      throw new UnauthorizedError('Неверный email или пароль', 'INVALID_CREDENTIALS')
    }

    const { passwordHash: _hash, ...publicUser } = user
    return { user: publicUser, token: signToken({ id: user.id, role: user.role }) }
  },

  async me(userId: number) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: publicUserSelect })
    if (!user) {
      throw new NotFoundError('Пользователь')
    }
    return user
  },
}
