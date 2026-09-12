import z from 'zod'
import { TRPCError } from '@trpc/server'
import { trpc } from '../../lib/trpc'
import { getActiveUserId } from '../../lib/demoUser'

const toNum = (v: { toNumber: () => number } | null | undefined) => (v ? v.toNumber() : null)

// Почему NOT_FOUND вместо FORBIDDEN: не раскрываем, существует ли чужое сравнение.
const notFound = () => new TRPCError({ code: 'NOT_FOUND', message: 'Comparison not found' })

export const comparisonsTrpcRouter = trpc.router({
  create: trpc.procedure
    .input(z.object({ name: z.string().optional(), projectId: z.number().int().optional() }))
    .mutation(async ({ ctx, input }) => {
      const userId = await getActiveUserId(ctx)
      if (input.projectId) {
        // Почему проверяем проект: сравнение нельзя привязать к чужому проекту.
        const owned = await ctx.prisma.userProject.findFirst({ where: { id: input.projectId, userId } })
        if (!owned) {
          throw notFound()
        }
      }
      const c = await ctx.prisma.comparison.create({ data: { ...input, userId } })
      return { id: c.id }
    }),
  list: trpc.procedure.query(async ({ ctx }) => {
    const userId = await getActiveUserId(ctx)
    return await ctx.prisma.comparison.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { items: true } } },
    })
  }),
  get: trpc.procedure.input(z.object({ id: z.number().int() })).query(async ({ ctx, input }) => {
    const userId = await getActiveUserId(ctx)
    const c = await ctx.prisma.comparison.findFirst({
      where: { id: input.id, userId },
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
      throw notFound()
    }
    return {
      ...c,
      items: c.items.map((i) => ({
        id: i.id,
        position: i.position,
        solution: {
          ...i.solution,
          priceMin: toNum(i.solution.priceMin),
          priceMax: toNum(i.solution.priceMax),
        },
      })),
    }
  }),
  addItem: trpc.procedure
    .input(z.object({ comparisonId: z.number().int(), solutionId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const userId = await getActiveUserId(ctx)
      const owned = await ctx.prisma.comparison.findFirst({ where: { id: input.comparisonId, userId } })
      if (!owned) {
        throw notFound()
      }
      const count = await ctx.prisma.comparisonItem.count({
        where: { comparisonId: input.comparisonId },
      })
      await ctx.prisma.comparisonItem.upsert({
        where: { comparisonId_solutionId: { comparisonId: input.comparisonId, solutionId: input.solutionId } },
        update: {},
        create: { comparisonId: input.comparisonId, solutionId: input.solutionId, position: count },
      })
      return true
    }),
  removeItem: trpc.procedure
    .input(z.object({ comparisonId: z.number().int(), solutionId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const userId = await getActiveUserId(ctx)
      const owned = await ctx.prisma.comparison.findFirst({ where: { id: input.comparisonId, userId } })
      if (!owned) {
        throw notFound()
      }
      await ctx.prisma.comparisonItem.delete({
        where: { comparisonId_solutionId: { comparisonId: input.comparisonId, solutionId: input.solutionId } },
      })
      return true
    }),
})
