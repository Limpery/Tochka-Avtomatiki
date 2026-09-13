import { z } from 'zod'
import { positiveIntSchema } from './common'

export const createComparisonSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  projectId: positiveIntSchema.optional(),
  // Сразу передать набор решений удобно со страницы подбора: одна кнопка «Сравнить выбранные».
  solutionIds: z.array(positiveIntSchema).max(10).optional(),
})

export const addComparisonItemSchema = z.object({
  solutionId: positiveIntSchema,
})

export const comparisonItemParamsSchema = z.object({
  id: positiveIntSchema,
  itemId: positiveIntSchema,
})

export const comparisonListQuerySchema = z.object({
  projectId: positiveIntSchema.optional(),
})

export type CreateComparisonInput = z.infer<typeof createComparisonSchema>
