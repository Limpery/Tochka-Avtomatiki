import { z } from 'zod'

// Почему coerce: параметры пути и query всегда приходят строками.
export const positiveIntSchema = z.coerce.number().int().positive()

export const idParamSchema = z.object({
  id: positiveIntSchema,
})

export type IdParam = z.infer<typeof idParamSchema>

// Денежные и физические величины: Prisma Decimal принимает number, но не хотим отрицательных значений.
export const nonNegativeNumberSchema = z.coerce.number().nonnegative()
