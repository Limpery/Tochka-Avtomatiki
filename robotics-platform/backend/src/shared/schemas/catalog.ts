import { z } from 'zod'
import { positiveIntSchema } from './common'

export const objectTypeListQuerySchema = z.object({
  industryId: positiveIntSchema.optional(),
})

export const benchmarkListQuerySchema = z.object({
  objectTypeId: positiveIntSchema.optional(),
})
