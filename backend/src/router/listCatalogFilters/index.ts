import { trpc } from '../../lib/trpc'

export const listCatalogFiltersTrpcRoute = trpc.procedure.query(async ({ ctx }) => {
  const [categories, tags, vendors] = await Promise.all([
    ctx.prisma.solutionCategory.findMany({ orderBy: { name: 'asc' } }),
    ctx.prisma.tag.findMany({ orderBy: { name: 'asc' } }),
    ctx.prisma.vendor.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, country: true } }),
  ])
  return { categories, tags, vendors }
})
