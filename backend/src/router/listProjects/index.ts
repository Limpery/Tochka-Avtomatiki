import { trpc } from '../../lib/trpc'
import { getActiveUserId } from '../../lib/demoUser'

export const listProjectsTrpcRoute = trpc.procedure.query(async ({ ctx }) => {
  const userId = await getActiveUserId(ctx)
  const projects = await ctx.prisma.userProject.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      objectType: { include: { industry: { select: { name: true, slug: true } } } },
      _count: { select: { processes: true, calculations: true } },
    },
  })
  return projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    areaSqm: p.areaSqm ? p.areaSqm.toNumber() : null,
    employeeCount: p.employeeCount,
    monthlyFund: p.monthlyFund ? p.monthlyFund.toNumber() : null,
    createdAt: p.createdAt,
    objectType: { id: p.objectType.id, name: p.objectType.name, slug: p.objectType.slug },
    industry: p.objectType.industry,
    processesCount: p._count.processes,
    calculationsCount: p._count.calculations,
  }))
})
