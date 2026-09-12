import z from 'zod'
import { TRPCError } from '@trpc/server'
import { trpc } from '../../lib/trpc'
import { getActiveUserId } from '../../lib/demoUser'

export const getProjectTrpcRoute = trpc.procedure
  .input(z.object({ id: z.number().int() }))
  .query(async ({ ctx, input }) => {
    const userId = await getActiveUserId(ctx)
    // Почему проверка владения: раньше любой проект читался по id без авторизации.
    // Анонимные клиенты работают через демо-пользователя и видят только его проекты.
    const owned = await ctx.prisma.userProject.findFirst({ where: { id: input.id, userId } })
    if (!owned) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' })
    }
    const p = await ctx.prisma.userProject.findUnique({
      where: { id: input.id },
      include: {
        objectType: { include: { industry: true } },
        benchmark: true,
        processes: { orderBy: { sortOrder: 'asc' } },
        matches: { include: { solution: { select: { id: true, name: true, slug: true } } } },
        calculations: {
          include: { solution: { select: { id: true, name: true, slug: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    if (!p) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' })
    }
    return {
      ...p,
      areaSqm: p.areaSqm ? p.areaSqm.toNumber() : null,
      operatingHours: p.operatingHours ? p.operatingHours.toNumber() : null,
      monthlyFund: p.monthlyFund ? p.monthlyFund.toNumber() : null,
      processes: p.processes.map((proc) => ({
        ...proc,
        currentCost: proc.currentCost ? proc.currentCost.toNumber() : null,
        currentHours: proc.currentHours ? proc.currentHours.toNumber() : null,
      })),
      matches: p.matches.map((m) => ({
        ...m,
        matchScore: m.matchScore.toNumber(),
        estimatedCost: m.estimatedCost ? m.estimatedCost.toNumber() : null,
        estimatedSavings: m.estimatedSavings.toNumber(),
        roiMonths: m.roiMonths.toNumber(),
      })),
      calculations: p.calculations.map((c) => ({
        ...c,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        assumptions: c.assumptions as unknown,
        initialInvestment: c.initialInvestment ? c.initialInvestment.toNumber() : null,
        annualMaintenance: c.annualMaintenance ? c.annualMaintenance.toNumber() : null,
        annualEnergyCost: c.annualEnergyCost ? c.annualEnergyCost.toNumber() : null,
        annualSavings: c.annualSavings.toNumber(),
        paybackMonths: c.paybackMonths.toNumber(),
        roi3yr: c.roi3yr.toNumber(),
        roi5yr: c.roi5yr.toNumber(),
        npv: c.npv.toNumber(),
        irr: c.irr.toNumber(),
      })),
    }
  })
