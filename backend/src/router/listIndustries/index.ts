import { trpc } from '../../lib/trpc'

export const listIndustriesTrpcRoute = trpc.procedure.query(async ({ ctx }) => {
  const industries = await ctx.prisma.industry.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { objectTypes: true } } },
  })
  return industries.map((i) => ({
    id: i.id,
    name: i.name,
    slug: i.slug,
    description: i.description,
    iconUrl: i.iconUrl,
    objectTypesCount: i._count.objectTypes,
  }))
})
