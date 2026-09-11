import z from 'zod'
import { trpc } from '../../lib/trpc'

export const getSolutionTrpcRoute = trpc.procedure
  .input(z.object({ slug: z.string() }))
  .query(async ({ ctx, input }) => {
    const s = await ctx.prisma.robotSolution.findUnique({
      where: { slug: input.slug },
      include: {
        vendor: true,
        category: true,
        specs: { orderBy: { sortOrder: 'asc' } },
        tags: { include: { tag: true } },
        applicability: {
          include: {
            industry: { select: { id: true, name: true, slug: true } },
            objectType: { select: { id: true, name: true, slug: true } },
          },
        },
        caseStudies: { orderBy: { createdAt: 'desc' } },
        ratings: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    })
    if (!s) {
      throw new Error('Solution not found')
    }
    const ratingsCount = s.ratings.length
    const avgRating = ratingsCount > 0 ? s.ratings.reduce((sum, r) => sum + r.rating, 0) / ratingsCount : null
    return {
      ...s,
      priceMin: s.priceMin ? s.priceMin.toNumber() : null,
      priceMax: s.priceMax ? s.priceMax.toNumber() : null,
      tags: s.tags.map((t) => t.tag),
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      caseStudies: s.caseStudies.map((c) => ({ ...c, results: c.results as unknown })),
      applicability: s.applicability.map((a) => ({
        ...a,
        suitabilityScore: a.suitabilityScore.toNumber(),
      })),
      avgRating,
      ratingsCount,
    }
  })
