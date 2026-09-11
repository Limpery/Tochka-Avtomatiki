import z from 'zod'
import { trpc } from '../../lib/trpc'
import { getDemoUserId } from '../../lib/demoUser'

const toNum = (v: { toNumber: () => number } | null | undefined) => (v ? v.toNumber() : null)

export const comparisonsTrpcRouter = trpc.router({
  create: trpc.procedure
    .input(z.object({ name: z.string().optional(), projectId: z.number().int().optional() }))
    .mutation(async ({ ctx, input }) => {
      const userId = await getDemoUserId(ctx.prisma)
      const c = await ctx.prisma.comparison.create({ data: { ...input, userId } })
      return { id: c.id }
    }),
  list: trpc.procedure.query(async ({ ctx }) => {
    const userId = await getDemoUserId(ctx.prisma)
    return await ctx.prisma.comparison.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { items: true } } },
    })
  }),
  get: trpc.procedure.input(z.object({ id: z.number().int() })).query(async ({ ctx, input }) => {
    const c = await ctx.prisma.comparison.findUnique({
      where: { id: input.id },
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
      throw new Error('Comparison not found')
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
      await ctx.prisma.comparisonItem.delete({
        where: { comparisonId_solutionId: { comparisonId: input.comparisonId, solutionId: input.solutionId } },
      })
      return true
    }),
})
