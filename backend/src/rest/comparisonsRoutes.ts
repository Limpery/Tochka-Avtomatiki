import { Router, type Router as ExpressRouter } from 'express'
import z from 'zod'
import type { AppContext } from '../lib/ctx'
import { asyncHandler, requireAuth, type AuthRequest } from './middleware'
import { sendApiError } from './errors'

const toNum = (v: { toNumber: () => number } | null | undefined) => (v ? v.toNumber() : null)

export const createComparisonsRestRoutes = (ctx: AppContext): ExpressRouter => {
  const r = Router()
  r.use('/comparisons', requireAuth)

  r.post(
    '/comparisons',
    asyncHandler(async (req: AuthRequest, res) => {
      const parsed = z
        .object({ name: z.string().max(200).optional(), projectId: z.number().int().optional() })
        .safeParse(req.body)
      if (!parsed.success) {
        sendApiError(res, 400, 'VALIDATION_ERROR', 'Некорректные данные', parsed.error.flatten())
        return
      }
      if (parsed.data.projectId) {
        // Почему проверяем владение проектом: сравнение нельзя привязать к чужому проекту.
        const owned = await ctx.prisma.userProject.findFirst({
          where: { id: parsed.data.projectId, userId: req.userId ?? 0 },
        })
        if (!owned) {
          sendApiError(res, 404, 'NOT_FOUND', 'Проект не найден')
          return
        }
      }
      const c = await ctx.prisma.comparison.create({ data: { ...parsed.data, userId: req.userId ?? 0 } })
      res.status(201).json({ data: { id: c.id } })
    }),
  )

  r.get(
    '/comparisons',
    asyncHandler(async (req: AuthRequest, res) => {
      const list = await ctx.prisma.comparison.findMany({
        where: { userId: req.userId ?? 0 },
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { items: true } } },
      })
      res.json({ data: list })
    }),
  )

  r.get(
    '/comparisons/:id',
    asyncHandler(async (req: AuthRequest, res) => {
      const id = Number(req.params.id)
      const c = await ctx.prisma.comparison.findFirst({
        where: { id, userId: req.userId ?? 0 },
        include: {
          items: {
            orderBy: { position: 'asc' },
            include: {
              solution: {
                include: {
                  vendor: { select: { name: true } },
                  category: { select: { name: true } },
                  specs: { orderBy: { sortOrder: 'asc' } },
                },
              },
            },
          },
        },
      })
      if (!c) {
        sendApiError(res, 404, 'NOT_FOUND', 'Сравнение не найдено')
        return
      }
      res.json({
        data: {
          ...c,
          items: c.items.map((i) => ({
            id: i.id,
            position: i.position,
            solution: { ...i.solution, priceMin: toNum(i.solution.priceMin), priceMax: toNum(i.solution.priceMax) },
          })),
        },
      })
    }),
  )

  r.post(
    '/comparisons/:id/items',
    asyncHandler(async (req: AuthRequest, res) => {
      const comparisonId = Number(req.params.id)
      const parsed = z.object({ solutionId: z.number().int() }).safeParse(req.body)
      if (!parsed.success) {
        sendApiError(res, 400, 'VALIDATION_ERROR', 'Некорректные данные', parsed.error.flatten())
        return
      }
      const owned = await ctx.prisma.comparison.findFirst({
        where: { id: comparisonId, userId: req.userId ?? 0 },
      })
      if (!owned) {
        sendApiError(res, 404, 'NOT_FOUND', 'Сравнение не найдено')
        return
      }
      const count = await ctx.prisma.comparisonItem.count({ where: { comparisonId } })
      await ctx.prisma.comparisonItem.upsert({
        where: { comparisonId_solutionId: { comparisonId, solutionId: parsed.data.solutionId } },
        update: {},
        create: { comparisonId, solutionId: parsed.data.solutionId, position: count },
      })
      res.status(201).json({ data: true })
    }),
  )

  r.delete(
    '/comparisons/:id/items/:itemId',
    asyncHandler(async (req: AuthRequest, res) => {
      const comparisonId = Number(req.params.id)
      const itemId = Number(req.params.itemId)
      const owned = await ctx.prisma.comparison.findFirst({
        where: { id: comparisonId, userId: req.userId ?? 0 },
      })
      if (!owned) {
        sendApiError(res, 404, 'NOT_FOUND', 'Сравнение не найдено')
        return
      }
      // Почему itemId = id записи ComparisonItem: так требует контракт ТЗ
      // (DELETE /api/comparisons/:id/items/:itemId), а не solutionId как в tRPC.
      const item = await ctx.prisma.comparisonItem.findFirst({ where: { id: itemId, comparisonId } })
      if (!item) {
        sendApiError(res, 404, 'NOT_FOUND', 'Элемент сравнения не найден')
        return
      }
      await ctx.prisma.comparisonItem.delete({ where: { id: itemId } })
      res.json({ data: true })
    }),
  )

  return r
}
