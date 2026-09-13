import { prisma } from '../../prisma/client'
import { ConflictError, NotFoundError, ValidationError } from '../../shared/errors'
import type { CreateComparisonInput } from '../../shared/schemas/comparisons'
import { ensureProjectOwner } from '../projects/projects.service'
import { ensureSolutionExists } from '../solutions/solutions.service'

// Почему specs сразу в include: таблица сравнения строится по объединению характеристик всех решений.
const comparisonInclude = {
  project: { select: { id: true, name: true } },
  items: {
    orderBy: { position: 'asc' as const },
    include: {
      solution: {
        include: {
          vendor: { select: { id: true, name: true, country: true } },
          category: true,
          specs: { orderBy: { sortOrder: 'asc' as const } },
          tags: { include: { tag: true } },
        },
      },
    },
  },
}

async function ensureComparisonOwner(userId: number, comparisonId: number) {
  const comparison = await prisma.comparison.findFirst({
    where: { id: comparisonId, userId },
    select: { id: true },
  })
  if (!comparison) {
    throw new NotFoundError('Сравнение', 'Сравнение не найдено')
  }
}

export const comparisonsService = {
  async list(userId: number, projectId?: number) {
    return prisma.comparison.findMany({
      where: { userId, ...(projectId ? { projectId } : {}) },
      orderBy: { createdAt: 'desc' },
      include: {
        project: { select: { id: true, name: true } },
        items: {
          orderBy: { position: 'asc' },
          select: { id: true, solution: { select: { id: true, name: true } } },
        },
      },
    })
  },

  async getById(userId: number, id: number) {
    const comparison = await prisma.comparison.findFirst({
      where: { id, userId },
      include: comparisonInclude,
    })
    if (!comparison) {
      throw new NotFoundError('Сравнение', 'Сравнение не найдено')
    }
    return {
      ...comparison,
      items: comparison.items.map((item) => ({
        ...item,
        solution: { ...item.solution, tags: item.solution.tags.map((t) => t.tag) },
      })),
    }
  },

  async create(userId: number, input: CreateComparisonInput) {
    if (input.projectId) {
      await ensureProjectOwner(userId, input.projectId)
    }

    const solutionIds = [...new Set(input.solutionIds ?? [])]
    if (solutionIds.length > 0) {
      const found = await prisma.robotSolution.count({ where: { id: { in: solutionIds } } })
      if (found !== solutionIds.length) {
        throw new ValidationError('Некоторые решения не найдены')
      }
    }

    const comparison = await prisma.comparison.create({
      data: {
        userId,
        projectId: input.projectId ?? null,
        name: input.name ?? `Сравнение от ${new Date().toLocaleDateString('ru-RU')}`,
        items: {
          create: solutionIds.map((solutionId, position) => ({ solutionId, position })),
        },
      },
      select: { id: true },
    })
    return comparisonsService.getById(userId, comparison.id)
  },

  async remove(userId: number, id: number) {
    await ensureComparisonOwner(userId, id)
    await prisma.comparison.delete({ where: { id } })
    return { success: true }
  },

  async addItem(userId: number, comparisonId: number, solutionId: number) {
    await ensureComparisonOwner(userId, comparisonId)
    await ensureSolutionExists(solutionId)

    const duplicate = await prisma.comparisonItem.findUnique({
      where: { comparisonId_solutionId: { comparisonId, solutionId } },
      select: { id: true },
    })
    if (duplicate) {
      throw new ConflictError('Решение уже добавлено в сравнение', 'ALREADY_IN_COMPARISON')
    }

    const position = await prisma.comparisonItem.count({ where: { comparisonId } })
    await prisma.comparisonItem.create({ data: { comparisonId, solutionId, position } })
    return comparisonsService.getById(userId, comparisonId)
  },

  async removeItem(userId: number, comparisonId: number, itemId: number) {
    await ensureComparisonOwner(userId, comparisonId)
    const item = await prisma.comparisonItem.findFirst({
      where: { id: itemId, comparisonId },
      select: { id: true },
    })
    if (!item) {
      throw new NotFoundError('Элемент сравнения')
    }
    await prisma.comparisonItem.delete({ where: { id: itemId } })
    return comparisonsService.getById(userId, comparisonId)
  },
}
