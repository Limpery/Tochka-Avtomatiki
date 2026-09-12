import { Router, type Router as ExpressRouter } from 'express'
import z from 'zod'
import type { AppContext } from '../lib/ctx'
import { asyncHandler, type AuthRequest } from './middleware'
import { sendApiError } from './errors'

const toNumberOrNull = (v: { toNumber: () => number } | null | undefined) => (v ? v.toNumber() : null)

// Почему фильтры по ID, а не по slug: так требует контракт ТЗ
// (GET /api/solutions?industryId=&objectTypeId=&categoryId=&tagIds=), slug остаются в tRPC.
const zSolutionsQuery = z.object({
  industryId: z.coerce.number().int().optional(),
  objectTypeId: z.coerce.number().int().optional(),
  categoryId: z.coerce.number().int().optional(),
  tagIds: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => {
      if (v === undefined) {
        return undefined
      }
      const arr = Array.isArray(v) ? v : v.split(',')
      return arr.map((s) => Number(s)).filter((n) => Number.isInteger(n))
    }),
})

export const createCatalogRestRoutes = (ctx: AppContext): ExpressRouter => {
  const r = Router()

  r.get(
    '/industries',
    asyncHandler(async (_req: AuthRequest, res) => {
      const industries = await ctx.prisma.industry.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { objectTypes: true } } },
      })
      res.json({
        data: industries.map((i) => ({
          id: i.id,
          name: i.name,
          slug: i.slug,
          description: i.description,
          iconUrl: i.iconUrl,
          objectTypesCount: i._count.objectTypes,
        })),
      })
    }),
  )

  r.get(
    '/industries/:id/object-types',
    asyncHandler(async (req: AuthRequest, res) => {
      const industryId = Number(req.params.id)
      if (!Number.isInteger(industryId)) {
        sendApiError(res, 400, 'VALIDATION_ERROR', 'Некорректный id отрасли')
        return
      }
      const types = await ctx.prisma.objectType.findMany({
        where: { industryId },
        orderBy: { name: 'asc' },
      })
      res.json({ data: types })
    }),
  )

  r.get(
    '/solutions',
    asyncHandler(async (req: AuthRequest, res) => {
      const parsed = zSolutionsQuery.safeParse(req.query)
      if (!parsed.success) {
        sendApiError(res, 400, 'VALIDATION_ERROR', 'Некорректные параметры фильтра', parsed.error.flatten())
        return
      }
      const { industryId, objectTypeId, categoryId, tagIds } = parsed.data
      const solutions = await ctx.prisma.robotSolution.findMany({
        where: {
          ...(categoryId ? { categoryId } : {}),
          ...(tagIds?.length ? { tags: { some: { tagId: { in: tagIds } } } } : {}),
          ...((industryId ?? objectTypeId)
            ? {
                applicability: {
                  some: {
                    ...(industryId ? { industryId } : {}),
                    ...(objectTypeId ? { objectTypeId } : {}),
                  },
                },
              }
            : {}),
        },
        include: {
          vendor: { select: { id: true, name: true, country: true } },
          category: { select: { id: true, name: true, slug: true } },
          tags: { include: { tag: true } },
        },
        orderBy: { name: 'asc' },
      })
      res.json({
        data: solutions.map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          description: s.description,
          priceMin: toNumberOrNull(s.priceMin),
          priceMax: toNumberOrNull(s.priceMax),
          currency: s.currency,
          imageUrl: s.imageUrl,
          vendor: s.vendor,
          category: s.category,
          tags: s.tags.map((t) => t.tag),
        })),
      })
    }),
  )

  r.get(
    '/solutions/:id',
    asyncHandler(async (req: AuthRequest, res) => {
      const id = Number(req.params.id)
      if (!Number.isInteger(id)) {
        sendApiError(res, 400, 'VALIDATION_ERROR', 'Некорректный id решения')
        return
      }
      const s = await ctx.prisma.robotSolution.findUnique({
        where: { id },
        include: {
          vendor: true,
          category: true,
          tags: { include: { tag: true } },
          applicability: {
            include: {
              industry: { select: { id: true, name: true, slug: true } },
              objectType: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      })
      if (!s) {
        sendApiError(res, 404, 'NOT_FOUND', 'Решение не найдено')
        return
      }
      res.json({
        data: {
          ...s,
          priceMin: toNumberOrNull(s.priceMin),
          priceMax: toNumberOrNull(s.priceMax),
          tags: s.tags.map((t) => t.tag),
          applicability: s.applicability.map((a) => ({
            ...a,
            suitabilityScore: a.suitabilityScore.toNumber(),
          })),
        },
      })
    }),
  )

  r.get(
    '/solutions/:id/specs',
    asyncHandler(async (req: AuthRequest, res) => {
      const solutionId = Number(req.params.id)
      if (!Number.isInteger(solutionId)) {
        sendApiError(res, 400, 'VALIDATION_ERROR', 'Некорректный id решения')
        return
      }
      const specs = await ctx.prisma.solutionSpec.findMany({
        where: { solutionId },
        orderBy: { sortOrder: 'asc' },
      })
      res.json({ data: specs })
    }),
  )

  r.get(
    '/solutions/:id/case-studies',
    asyncHandler(async (req: AuthRequest, res) => {
      const solutionId = Number(req.params.id)
      if (!Number.isInteger(solutionId)) {
        sendApiError(res, 400, 'VALIDATION_ERROR', 'Некорректный id решения')
        return
      }
      const studies = await ctx.prisma.caseStudy.findMany({
        where: { solutionId },
        orderBy: { createdAt: 'desc' },
      })
      res.json({ data: studies })
    }),
  )

  r.get(
    '/vendors',
    asyncHandler(async (_req: AuthRequest, res) => {
      const vendors = await ctx.prisma.vendor.findMany({ orderBy: { name: 'asc' } })
      res.json({ data: vendors })
    }),
  )

  r.get(
    '/benchmarks',
    asyncHandler(async (req: AuthRequest, res) => {
      const objectTypeId = req.query.objectTypeId ? Number(req.query.objectTypeId) : undefined
      if (req.query.objectTypeId && !Number.isInteger(objectTypeId)) {
        sendApiError(res, 400, 'VALIDATION_ERROR', 'Некорректный objectTypeId')
        return
      }
      const items = await ctx.prisma.benchmarkObject.findMany({
        where: objectTypeId ? { objectTypeId } : undefined,
        orderBy: { name: 'asc' },
      })
      res.json({ data: items })
    }),
  )

  return r
}
