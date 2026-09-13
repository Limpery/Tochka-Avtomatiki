import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Некорректный email').max(200),
  password: z.string().min(8, 'Пароль не короче 8 символов').max(128),
  name: z.string().trim().min(1).max(100).optional(),
  company: z.string().trim().min(1).max(200).optional(),
})

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
