import { z } from 'zod'
import { nonNegativeNumberSchema, positiveIntSchema } from './common'

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Укажите название').max(200),
  description: z.string().trim().max(2000).optional(),
  objectTypeId: positiveIntSchema,
  useBenchmark: z.boolean().optional(),
  benchmarkObjectId: positiveIntSchema.nullable().optional(),
  areaSqm: nonNegativeNumberSchema.nullable().optional(),
  employeeCount: z.coerce.number().int().nonnegative().nullable().optional(),
  shiftCount: z.coerce.number().int().min(1).max(4).nullable().optional(),
  operatingHours: z.coerce.number().min(0).max(24).nullable().optional(),
  monthlyFund: nonNegativeNumberSchema.nullable().optional(),
})

// Почему partial: PATCH меняет только присланные поля, objectTypeId тоже можно поменять.
export const updateProjectSchema = createProjectSchema.partial()

export const createProcessSchema = z.object({
  processName: z.string().trim().min(1, 'Укажите название процесса').max(200),
  description: z.string().trim().max(2000).optional(),
  currentCost: nonNegativeNumberSchema.nullable().optional(),
  currentHours: nonNegativeNumberSchema.nullable().optional(),
  employeeCount: z.coerce.number().int().nonnegative().nullable().optional(),
  frequency: z.enum(['hourly', 'daily', 'weekly', 'monthly']).nullable().optional(),
  sortOrder: z.coerce.number().int().nonnegative().optional(),
})

export const processParamsSchema = z.object({
  id: positiveIntSchema,
  processId: positiveIntSchema,
})

export const economicsParamsSchema = z.object({
  id: positiveIntSchema,
  solutionId: positiveIntSchema,
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type CreateProcessInput = z.infer<typeof createProcessSchema>
