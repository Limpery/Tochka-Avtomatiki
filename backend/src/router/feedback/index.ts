import z from 'zod'
import { trpc } from '../../lib/trpc'
import { getDemoUserId } from '../../lib/demoUser'

export const listCaseStudiesTrpcRoute = trpc.procedure
  .input(z.object({ solutionId: z.number().int().optional() }))
  .query(async ({ ctx, input }) => {
    const studies = await ctx.prisma.caseStudy.findMany({
      where: input.solutionId ? { solutionId: input.solutionId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        industry: { select: { name: true, slug: true } },
        objectType: { select: { name: true, slug: true } },
      },
    })
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return studies.map((c) => ({ ...c, results: c.results as unknown }))
  })

export const createRatingTrpcRoute = trpc.procedure
  .input(
    z.object({
      solutionId: z.number().int(),
      rating: z.number().int().min(1).max(5),
      review: z.string().optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const userId = await getDemoUserId(ctx.prisma)
    await ctx.prisma.solutionRating.upsert({
      where: { solutionId_userId: { solutionId: input.solutionId, userId } },
      update: { rating: input.rating, review: input.review },
      create: { ...input, userId },
    })
    return true
  })
