import { prisma } from '../../prisma/client'
import { ensureProjectOwner } from '../projects/projects.service'
import { ensureSolutionExists } from '../solutions/solutions.service'

// Почему константа: заглушка должна быть одинаковой во всех местах и легко находиться grep-ом.
const STUB_ASSUMPTIONS = {
  stub: true,
  note: 'Расчёт экономики — заглушка. Все показатели = 0 до получения данных от вендоров.',
}

const calculationInclude = {
  solution: {
    include: {
      vendor: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
    },
  },
}

export const economicsService = {
  async list(userId: number, projectId: number) {
    await ensureProjectOwner(userId, projectId)
    return prisma.economicCalculation.findMany({
      where: { projectId },
      include: calculationInclude,
      orderBy: { createdAt: 'desc' },
    })
  },

  /**
   * ЗАГЛУШКА экономического расчёта: создаёт (или возвращает) запись со всеми нулями.
   * Когда появится реальная модель, логика расчёта заменит create/update ниже.
   */
  async getForSolution(userId: number, projectId: number, solutionId: number) {
    await ensureProjectOwner(userId, projectId)
    await ensureSolutionExists(solutionId)

    const calculation = await prisma.economicCalculation.upsert({
      where: { projectId_solutionId: { projectId, solutionId } },
      update: {},
      create: {
        projectId,
        solutionId,
        initialInvestment: 0,
        annualMaintenance: 0,
        annualEnergyCost: 0,
        annualSavings: 0,
        paybackMonths: 0,
        roi3yr: 0,
        roi5yr: 0,
        npv: 0,
        irr: 0,
        assumptions: STUB_ASSUMPTIONS,
      },
      include: calculationInclude,
    })

    return { ...calculation, isStub: true }
  },
}
