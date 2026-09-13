import { z } from 'zod'
import { positiveIntSchema } from './common'

// tagIds приходит строкой "1,2,3" — превращаем в массив чисел, мусор отбрасываем.
const idListSchema = z
  .string()
  .optional()
  .transform((value) =>
    (value ?? '')
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n) && n > 0),
  )

export const solutionListQuerySchema = z.object({
  industryId: positiveIntSchema.optional(),
  objectTypeId: positiveIntSchema.optional(),
  categoryId: positiveIntSchema.optional(),
  vendorId: positiveIntSchema.optional(),
  tagIds: idListSchema,
  search: z.string().trim().max(200).optional(),
})

export type SolutionListQuery = z.infer<typeof solutionListQuerySchema>
