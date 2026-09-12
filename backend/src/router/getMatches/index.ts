import z from 'zod'
import { TRPCError } from '@trpc/server'
import { trpc } from '../../lib/trpc'
import { getActiveUserId } from '../../lib/demoUser'

export const getMatchesTrpcRoute = trpc.procedure
  .input(z.object({ projectId: z.number().int() }))
  .query(async ({ ctx, input }) => {
    const userId = await getActiveUserId(ctx)
    // Почему проверка владения: подбор раскрывает экономику чужого проекта по id.
    const project = await ctx.prisma.userProject.findFirst({
      where: { id: input.projectId, userId },
      include: { objectType: { select: { id: true, industryId: true } } },
    })
    if (!project) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' })
    }

    const applicable = await ctx.prisma.solutionApplicability.findMany({
      where: {
        industryId: project.objectType.industryId,
        OR: [{ objectTypeId: project.objectType.id }, { objectTypeId: null }],
      },
      include: {
        solution: {
          include: {
            vendor: { select: { name: true } },
            category: { select: { name: true, slug: true } },
          },
        },
      },
    })

    // Точное совпадение по типу объекта важнее, чем по всей отрасли
    const sorted = [...applicable].sort((a, b) => {
      const exactA = a.objectTypeId === project.objectType.id ? 1 : 0
      const exactB = b.objectTypeId === project.objectType.id ? 1 : 0
      if (exactA !== exactB) {
        return exactB - exactA
      }
      return b.suitabilityScore.toNumber() - a.suitabilityScore.toNumber()
    })

    const results = await Promise.all(
      sorted.map(async (a) => {
        const price = a.solution.priceMin ?? a.solution.priceMax
        const estimatedCost = price ? price.toNumber() : null
        const match = await ctx.prisma.projectSolutionMatch.upsert({
          where: { projectId_solutionId: { projectId: project.id, solutionId: a.solutionId } },
          update: {
            matchScore: Math.round(a.suitabilityScore.toNumber() * 100),
            estimatedCost,
          },
          create: {
            projectId: project.id,
            solutionId: a.solutionId,
            matchScore: Math.round(a.suitabilityScore.toNumber() * 100),
            estimatedCost,
          },
        })
        return {
          id: match.id,
          solutionId: a.solution.id,
          solutionName: a.solution.name,
          solutionSlug: a.solution.slug,
          vendorName: a.solution.vendor.name,
          categoryName: a.solution.category?.name ?? null,
          priceMin: a.solution.priceMin ? a.solution.priceMin.toNumber() : null,
          priceMax: a.solution.priceMax ? a.solution.priceMax.toNumber() : null,
          matchScore: match.matchScore.toNumber(),
          estimatedCost: match.estimatedCost ? match.estimatedCost.toNumber() : null,
          suitabilityScore: a.suitabilityScore.toNumber(),
        }
      }),
    )
    return results
  })
