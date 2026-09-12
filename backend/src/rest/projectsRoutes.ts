import { Router, type Router as ExpressRouter } from 'express'
import z from 'zod'
import type { AppContext } from '../lib/ctx'
import { asyncHandler, requireAuth, type AuthRequest } from './middleware'
import { sendApiError } from './errors'

const zProcessInput = z.object({
  processName: z.string().min(1),
  currentCost: z.number().nonnegative().optional(),
  currentHours: z.number().nonnegative().optional(),
  employeeCount: z.number().int().nonnegative().optional(),
  frequency: z.string().max(50).optional(),
  description: z.string().optional(),
})

const zCreateProject = z.object({
  objectTypeId: z.number().int(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  benchmarkObjectId: z.number().int().optional(),
  areaSqm: z.number().positive().optional(),
  employeeCount: z.number().int().nonnegative().optional(),
  shiftCount: z.number().int().min(1).max(3).optional(),
  operatingHours: z.number().positive().optional(),
  monthlyFund: z.number().nonnegative().optional(),
  processes: z.array(zProcessInput).default([]),
})

const zPatchProject = zCreateProject.partial().omit({ processes: true })

// Почему owner-check в каждом хендлере, а не глобально: проект принадлежит пользователю,
// а каталог публичен — проверка должна быть рядом с запросом, чтобы не забыть.
const getOwnedProject = async (ctx: AppContext, id: number, userId: number) =>
  await ctx.prisma.userProject.findFirst({ where: { id, userId } })

export const createProjectsRestRoutes = (ctx: AppContext): ExpressRouter => {
  const r = Router()
  r.use('/projects', requireAuth)

  r.post(
    '/projects',
    asyncHandler(async (req: AuthRequest, res) => {
      const parsed = zCreateProject.safeParse(req.body)
      if (!parsed.success) {
        sendApiError(res, 400, 'VALIDATION_ERROR', 'Некорректные данные проекта', parsed.error.flatten())
        return
      }
      const { processes, ...projectData } = parsed.data
      const project = await ctx.prisma.userProject.create({
        data: {
          ...projectData,
          userId: req.userId ?? 0,
          useBenchmark: !!parsed.data.benchmarkObjectId,
          processes: { create: processes.map((p, i) => ({ ...p, sortOrder: i + 1 })) },
        },
      })
      res.status(201).json({ data: { id: project.id } })
    }),
  )

  r.get(
    '/projects',
    asyncHandler(async (req: AuthRequest, res) => {
      const projects = await ctx.prisma.userProject.findMany({
        where: { userId: req.userId ?? 0 },
        orderBy: { createdAt: 'desc' },
        include: {
          objectType: { include: { industry: { select: { name: true, slug: true } } } },
          _count: { select: { processes: true, calculations: true } },
        },
      })
      res.json({
        data: projects.map((p) => ({
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
        })),
      })
    }),
  )

  r.get(
    '/projects/:id',
    asyncHandler(async (req: AuthRequest, res) => {
      const id = Number(req.params.id)
      const p = await getOwnedProject(ctx, id, req.userId ?? 0)
      if (!p) {
        sendApiError(res, 404, 'NOT_FOUND', 'Проект не найден')
        return
      }
      const full = await ctx.prisma.userProject.findUnique({
        where: { id },
        include: {
          objectType: { include: { industry: true } },
          benchmark: true,
          processes: { orderBy: { sortOrder: 'asc' } },
        },
      })
      if (!full) {
        sendApiError(res, 404, 'NOT_FOUND', 'Проект не найден')
        return
      }
      res.json({
        data: {
          ...full,
          areaSqm: full.areaSqm ? full.areaSqm.toNumber() : null,
          operatingHours: full.operatingHours ? full.operatingHours.toNumber() : null,
          monthlyFund: full.monthlyFund ? full.monthlyFund.toNumber() : null,
          processes: full.processes.map((proc) => ({
            ...proc,
            currentCost: proc.currentCost ? proc.currentCost.toNumber() : null,
            currentHours: proc.currentHours ? proc.currentHours.toNumber() : null,
          })),
        },
      })
    }),
  )

  r.patch(
    '/projects/:id',
    asyncHandler(async (req: AuthRequest, res) => {
      const id = Number(req.params.id)
      const parsed = zPatchProject.safeParse(req.body)
      if (!parsed.success) {
        sendApiError(res, 400, 'VALIDATION_ERROR', 'Некорректные данные', parsed.error.flatten())
        return
      }
      if (!(await getOwnedProject(ctx, id, req.userId ?? 0))) {
        sendApiError(res, 404, 'NOT_FOUND', 'Проект не найден')
        return
      }
      const updated = await ctx.prisma.userProject.update({ where: { id }, data: parsed.data })
      res.json({ data: { id: updated.id } })
    }),
  )

  r.delete(
    '/projects/:id',
    asyncHandler(async (req: AuthRequest, res) => {
      const id = Number(req.params.id)
      if (!(await getOwnedProject(ctx, id, req.userId ?? 0))) {
        sendApiError(res, 404, 'NOT_FOUND', 'Проект не найден')
        return
      }
      await ctx.prisma.userProject.delete({ where: { id } })
      res.json({ data: true })
    }),
  )

  r.post(
    '/projects/:id/processes',
    asyncHandler(async (req: AuthRequest, res) => {
      const projectId = Number(req.params.id)
      const parsed = zProcessInput.safeParse(req.body)
      if (!parsed.success) {
        sendApiError(res, 400, 'VALIDATION_ERROR', 'Некорректные данные процесса', parsed.error.flatten())
        return
      }
      if (!(await getOwnedProject(ctx, projectId, req.userId ?? 0))) {
        sendApiError(res, 404, 'NOT_FOUND', 'Проект не найден')
        return
      }
      const count = await ctx.prisma.userProjectProcess.count({ where: { projectId } })
      const proc = await ctx.prisma.userProjectProcess.create({
        data: { ...parsed.data, projectId, sortOrder: count + 1 },
      })
      res.status(201).json({ data: { id: proc.id } })
    }),
  )

  r.delete(
    '/projects/:id/processes/:processId',
    asyncHandler(async (req: AuthRequest, res) => {
      const projectId = Number(req.params.id)
      const processId = Number(req.params.processId)
      if (!(await getOwnedProject(ctx, projectId, req.userId ?? 0))) {
        sendApiError(res, 404, 'NOT_FOUND', 'Проект не найден')
        return
      }
      const proc = await ctx.prisma.userProjectProcess.findFirst({ where: { id: processId, projectId } })
      if (!proc) {
        sendApiError(res, 404, 'NOT_FOUND', 'Процесс не найден')
        return
      }
      await ctx.prisma.userProjectProcess.delete({ where: { id: processId } })
      res.json({ data: true })
    }),
  )

  const computeMatches = async (projectId: number, userId: number) => {
    const project = await ctx.prisma.userProject.findFirst({
      where: { id: projectId, userId },
      include: { objectType: { select: { id: true, industryId: true } } },
    })
    if (!project) {
      return null
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
    const sorted = [...applicable].sort((a, b) => {
      // Почему точное совпадение по типу объекта выше: складской робот для склада
      // релевантнее, чем «вообще для отрасли».
      const exactA = a.objectTypeId === project.objectType.id ? 1 : 0
      const exactB = b.objectTypeId === project.objectType.id ? 1 : 0
      if (exactA !== exactB) {
        return exactB - exactA
      }
      return b.suitabilityScore.toNumber() - a.suitabilityScore.toNumber()
    })
    return await Promise.all(
      sorted.map(async (a) => {
        const price = a.solution.priceMin ?? a.solution.priceMax
        const estimatedCost = price ? price.toNumber() : null
        const match = await ctx.prisma.projectSolutionMatch.upsert({
          where: { projectId_solutionId: { projectId: project.id, solutionId: a.solutionId } },
          update: { matchScore: Math.round(a.suitabilityScore.toNumber() * 100), estimatedCost },
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
          estimatedSavings: match.estimatedSavings.toNumber(),
          roiMonths: match.roiMonths.toNumber(),
          suitabilityScore: a.suitabilityScore.toNumber(),
        }
      }),
    )
  }

  r.get(
    '/projects/:id/matches',
    asyncHandler(async (req: AuthRequest, res) => {
      const result = await computeMatches(Number(req.params.id), req.userId ?? 0)
      if (!result) {
        sendApiError(res, 404, 'NOT_FOUND', 'Проект не найден')
        return
      }
      res.json({ data: result })
    }),
  )

  r.post(
    '/projects/:id/matches',
    asyncHandler(async (req: AuthRequest, res) => {
      const result = await computeMatches(Number(req.params.id), req.userId ?? 0)
      if (!result) {
        sendApiError(res, 404, 'NOT_FOUND', 'Проект не найден')
        return
      }
      res.json({ data: result })
    }),
  )

  r.get(
    '/projects/:id/economics/:solutionId',
    asyncHandler(async (req: AuthRequest, res) => {
      const projectId = Number(req.params.id)
      const solutionId = Number(req.params.solutionId)
      if (!(await getOwnedProject(ctx, projectId, req.userId ?? 0))) {
        sendApiError(res, 404, 'NOT_FOUND', 'Проект не найден')
        return
      }
      const calc = await ctx.prisma.economicCalculation.findUnique({
        where: { projectId_solutionId: { projectId, solutionId } },
      })
      if (!calc) {
        // Почему нули, а не 404: контракт ТЗ требует заглушку до первого расчёта,
        // фронт показывает нулевые метрики и кнопку «Рассчитать» (tRPC calculateEconomics).
        res.json({
          data: {
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
            isStub: true,
          },
        })
        return
      }
      res.json({
        data: {
          ...calc,
          initialInvestment: calc.initialInvestment ? calc.initialInvestment.toNumber() : null,
          annualMaintenance: calc.annualMaintenance ? calc.annualMaintenance.toNumber() : null,
          annualEnergyCost: calc.annualEnergyCost ? calc.annualEnergyCost.toNumber() : null,
          annualSavings: calc.annualSavings.toNumber(),
          paybackMonths: calc.paybackMonths.toNumber(),
          roi3yr: calc.roi3yr.toNumber(),
          roi5yr: calc.roi5yr.toNumber(),
          npv: calc.npv.toNumber(),
          irr: calc.irr.toNumber(),
          isStub: false,
        },
      })
    }),
  )

  return r
}
