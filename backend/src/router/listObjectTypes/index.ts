import z from 'zod'
import { trpc } from '../../lib/trpc'

export const listObjectTypesTrpcRoute = trpc.procedure
  .input(z.object({ industrySlug: z.string().optional() }))
  .query(async ({ ctx, input }) => {
    const objectTypes = await ctx.prisma.objectType.findMany({
      where: input.industrySlug ? { industry: { slug: input.industrySlug } } : undefined,
      orderBy: { name: 'asc' },
      include: {
        industry: { select: { id: true, name: true, slug: true } },
        _count: { select: { benchmarkObjects: true } },
      },
    })
    return objectTypes.map((o) => ({
      id: o.id,
      name: o.name,
      slug: o.slug,
      description: o.description,
      industry: o.industry,
      benchmarksCount: o._count.benchmarkObjects,
    }))
  })
