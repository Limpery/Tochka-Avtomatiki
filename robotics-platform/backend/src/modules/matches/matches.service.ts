import { prisma } from '../../prisma/client'
import { ensureProjectOwner } from '../projects/projects.service'
import { buildApplicabilityWhere } from '../solutions/solutions.service'

const matchInclude = {
  solution: {
    include: {
      vendor: { select: { id: true, name: true, country: true } },
      category: true,
      tags: { include: { tag: true } },
    },
  },
}

export const matchesService = {
  async list(userId: number, projectId: number) {
    await ensureProjectOwner(userId, projectId)
    const matches = await prisma.projectSolutionMatch.findMany({
      where: { projectId },
      include: matchInclude,
      orderBy: { matchScore: 'desc' },
    })
    return matches.map((m) => ({
      ...m,
      solution: { ...m.solution, tags: m.solution.tags.map((t) => t.tag) },
    }))
  },

  /**
   * ЗАГЛУШКА подбора. Реальный алгоритм появится после получения данных от вендоров.
   * Сейчас: берём решения, применимые к типу объекта (или отрасли) проекта,
   * matchScore = suitabilityScore * 100, все экономические поля = 0.
   */
  async generate(userId: number, projectId: number) {
    const project = await ensureProjectOwner(userId, projectId)
    const applicability = await buildApplicabilityWhere(
      project.objectType.industryId,
      project.objectTypeId,
    )

    const solutions = await prisma.robotSolution.findMany({
      where: applicability ? { applicability: { some: applicability } } : undefined,
      select: {
        id: true,
        priceMin: true,
        applicability: { where: applicability, select: { suitabilityScore: true } },
      },
    })

    // Почему транзакция: повторный подбор должен атомарно заменить старый набор.
    await prisma.$transaction([
      prisma.projectSolutionMatch.deleteMany({ where: { projectId } }),
      ...solutions.map((s) => {
        const bestScore = s.applicability.reduce(
          (max, a) => Math.max(max, Number(a.suitabilityScore)),
          0,
        )
        return prisma.projectSolutionMatch.create({
          data: {
            projectId,
            solutionId: s.id,
            matchScore: Math.round(bestScore * 100),
            estimatedCost: s.priceMin,
            estimatedSavings: 0,
            roiMonths: 0,
            notes: 'Заглушка: экономические показатели будут рассчитаны после получения данных от вендоров',
          },
        })
      }),
    ])

    return matchesService.list(userId, projectId)
  },
}
