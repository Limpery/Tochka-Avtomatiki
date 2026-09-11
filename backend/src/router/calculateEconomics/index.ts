import z from 'zod'
import { trpc } from '../../lib/trpc'

const AUTOMATION_RATE = 0.3

export const calculateEconomicsTrpcRoute = trpc.procedure
  .input(
    z.object({
      projectId: z.number().int(),
      solutionId: z.number().int(),
      quantity: z.number().int().min(1).default(1),
      annualMaintenance: z.number().nonnegative().default(200000),
      annualEnergyCost: z.number().nonnegative().default(50000),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const [project, solution] = await Promise.all([
      ctx.prisma.userProject.findUnique({
        where: { id: input.projectId },
        include: { processes: true },
      }),
      ctx.prisma.robotSolution.findUnique({ where: { id: input.solutionId } }),
    ])
    if (!project) {
      throw new Error('Project not found')
    }
    if (!solution) {
      throw new Error('Solution not found')
    }

    const monthlyProcessCost = project.processes.reduce(
      (sum, p) => sum + (p.currentCost ? p.currentCost.toNumber() : 0),
      0,
    )
    const fallbackMonthly = project.monthlyFund ? project.monthlyFund.toNumber() : 0
    const baseMonthly = monthlyProcessCost > 0 ? monthlyProcessCost : fallbackMonthly

    const monthlySavings = baseMonthly * AUTOMATION_RATE
    const annualSavings = monthlySavings * 12
    const unitPrice = solution.priceMin ?? solution.priceMax
    const initialInvestment = (unitPrice ? unitPrice.toNumber() : 0) * input.quantity
    const annualOpex = input.annualMaintenance + input.annualEnergyCost
    const netAnnual = annualSavings - annualOpex
    const monthlyNet = netAnnual / 12
    const paybackMonths = monthlyNet > 0 ? initialInvestment / monthlyNet : 0
    const roi3yr = initialInvestment > 0 ? ((netAnnual * 3 - initialInvestment) / initialInvestment) * 100 : 0
    const roi5yr = initialInvestment > 0 ? ((netAnnual * 5 - initialInvestment) / initialInvestment) * 100 : 0
    const npv = -initialInvestment + netAnnual * 3

    const round1 = (n: number) => Math.round(n * 10) / 10
    const round2 = (n: number) => Math.round(n * 100) / 100

    const saved = await ctx.prisma.economicCalculation.upsert({
      where: { projectId_solutionId: { projectId: project.id, solutionId: solution.id } },
      update: {
        initialInvestment,
        annualMaintenance: input.annualMaintenance,
        annualEnergyCost: input.annualEnergyCost,
        annualSavings: round2(annualSavings),
        paybackMonths: round1(paybackMonths),
        roi3yr: round2(roi3yr),
        roi5yr: round2(roi5yr),
        npv: round2(npv),
        irr: 0,
        assumptions: {
          automationRate: AUTOMATION_RATE,
          quantity: input.quantity,
          baseMonthlyCost: round2(baseMonthly),
          note: 'Упрощённый расчёт для демо: экономия 30% от текущих затрат на процессы (или ФОТ)',
        },
      },
      create: {
        projectId: project.id,
        solutionId: solution.id,
        initialInvestment,
        annualMaintenance: input.annualMaintenance,
        annualEnergyCost: input.annualEnergyCost,
        annualSavings: round2(annualSavings),
        paybackMonths: round1(paybackMonths),
        roi3yr: round2(roi3yr),
        roi5yr: round2(roi5yr),
        npv: round2(npv),
        irr: 0,
        assumptions: {
          automationRate: AUTOMATION_RATE,
          quantity: input.quantity,
          baseMonthlyCost: round2(baseMonthly),
          note: 'Упрощённый расчёт для демо: экономия 30% от текущих затрат на процессы (или ФОТ)',
        },
      },
    })

    return {
      id: saved.id,
      initialInvestment,
      annualMaintenance: input.annualMaintenance,
      annualEnergyCost: input.annualEnergyCost,
      annualOpex: round2(annualOpex),
      annualSavings: round2(annualSavings),
      monthlySavings: round2(monthlySavings),
      paybackMonths: round1(paybackMonths),
      roi3yr: round2(roi3yr),
      roi5yr: round2(roi5yr),
      npv: round2(npv),
    }
  })
