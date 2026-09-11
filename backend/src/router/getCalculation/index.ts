import z from 'zod'
import { trpc } from '../../lib/trpc'

export const getCalculationTrpcRoute = trpc.procedure
  .input(z.object({ projectId: z.number().int(), solutionId: z.number().int() }))
  .query(async ({ ctx, input }) => {
    const c = await ctx.prisma.economicCalculation.findUnique({
      where: { projectId_solutionId: { projectId: input.projectId, solutionId: input.solutionId } },
      include: { solution: { select: { id: true, name: true, slug: true } } },
    })
    if (!c) {
      return null
    }
    return {
      ...c,
      initialInvestment: c.initialInvestment ? c.initialInvestment.toNumber() : null,
      annualMaintenance: c.annualMaintenance ? c.annualMaintenance.toNumber() : null,
      annualEnergyCost: c.annualEnergyCost ? c.annualEnergyCost.toNumber() : null,
      annualSavings: c.annualSavings.toNumber(),
      paybackMonths: c.paybackMonths.toNumber(),
      roi3yr: c.roi3yr.toNumber(),
      roi5yr: c.roi5yr.toNumber(),
      npv: c.npv.toNumber(),
      irr: c.irr.toNumber(),
    }
  })
