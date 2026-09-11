import z from 'zod'
import { trpc } from '../../lib/trpc'

const toNumberOrNull = (v: { toNumber: () => number } | null | undefined) => (v ? v.toNumber() : null)

export const listSolutionsTrpcRoute = trpc.procedure
  .input(
    z.object({
      industrySlug: z.string().optional(),
      objectTypeSlug: z.string().optional(),
      categorySlug: z.string().optional(),
      tagSlugs: z.array(z.string()).optional(),
      search: z.string().optional(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const solutions = await ctx.prisma.robotSolution.findMany({
      where: {
        ...(input.categorySlug ? { category: { slug: input.categorySlug } } : {}),
        ...(input.search
          ? {
              OR: [
                { name: { contains: input.search, mode: 'insensitive' } },
                { description: { contains: input.search, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(input.tagSlugs?.length ? { tags: { some: { tag: { slug: { in: input.tagSlugs } } } } } : {}),
        ...(input.industrySlug || input.objectTypeSlug
          ? {
              applicability: {
                some: {
                  ...(input.industrySlug ? { industry: { slug: input.industrySlug } } : {}),
                  ...(input.objectTypeSlug ? { objectType: { slug: input.objectTypeSlug } } : {}),
                },
              },
            }
          : {}),
      },
      include: {
        vendor: { select: { id: true, name: true, country: true } },
        category: { select: { id: true, name: true, slug: true } },
        specs: { orderBy: { sortOrder: 'asc' } },
        tags: { include: { tag: true } },
        applicability: {
          include: {
            industry: { select: { slug: true, name: true } },
            objectType: { select: { slug: true, name: true } },
          },
        },
        ratings: { select: { rating: true } },
      },
      orderBy: { name: 'asc' },
    })

    return solutions.map((s) => {
      const ratingsCount = s.ratings.length
      const avgRating = ratingsCount > 0 ? s.ratings.reduce((sum, r) => sum + r.rating, 0) / ratingsCount : null
      const suitability = s.applicability.find(
        (a) =>
          (!input.industrySlug || a.industry.slug === input.industrySlug) &&
          (!input.objectTypeSlug || a.objectType?.slug === input.objectTypeSlug),
      )
      return {
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
        specs: s.specs,
        tags: s.tags.map((t) => t.tag),
        avgRating,
        ratingsCount,
        suitabilityScore: suitability ? suitability.suitabilityScore.toNumber() : null,
      }
    })
  })
