import { Prisma } from '@prisma/client'
import { prisma } from '../../prisma/client'
import { NotFoundError } from '../../shared/errors'
import type { SolutionListQuery } from '../../shared/schemas/solutions'

// Почему satisfies: сохраняем точный тип include, чтобы Prisma вывела тип результата.
const listInclude = {
  vendor: { select: { id: true, name: true, country: true, logoUrl: true } },
  category: true,
  tags: { include: { tag: true } },
  applicability: { select: { industryId: true, objectTypeId: true, suitabilityScore: true } },
  ratings: { select: { rating: true } },
  _count: { select: { caseStudies: true, specs: true } },
} satisfies Prisma.RobotSolutionInclude

type SolutionWithRelations = Prisma.RobotSolutionGetPayload<{ include: typeof listInclude }>

// Плоская форма для фронтенда: теги без обёртки SolutionTag, рейтинг — среднее число.
function toListItem(solution: SolutionWithRelations) {
  const { tags, ratings, ...rest } = solution
  const avgRating =
    ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : null
  return {
    ...rest,
    tags: tags.map((t) => t.tag),
    avgRating,
    ratingsCount: ratings.length,
  }
}

/**
 * Условие применимости решения к объекту/отрасли.
 * Строка applicability с objectTypeId = NULL означает «подходит всей отрасли».
 */
export async function buildApplicabilityWhere(
  industryId?: number,
  objectTypeId?: number,
): Promise<Prisma.SolutionApplicabilityWhereInput | undefined> {
  if (objectTypeId) {
    const objectType = await prisma.objectType.findUnique({
      where: { id: objectTypeId },
      select: { industryId: true },
    })
    if (!objectType) {
      throw new NotFoundError('Тип объекта', 'Тип объекта не найден')
    }
    return {
      OR: [{ objectTypeId }, { objectTypeId: null, industryId: objectType.industryId }],
    }
  }
  if (industryId) {
    return { industryId }
  }
  return undefined
}

export const solutionsService = {
  async list(query: SolutionListQuery) {
    const where: Prisma.RobotSolutionWhereInput = {}

    if (query.categoryId) {
      where.categoryId = query.categoryId
    }
    if (query.vendorId) {
      where.vendorId = query.vendorId
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ]
    }
    // Почему AND по каждому тегу: пользователь сужает выборку, решение должно иметь все выбранные теги.
    if (query.tagIds.length > 0) {
      where.AND = query.tagIds.map((tagId) => ({ tags: { some: { tagId } } }))
    }

    const applicability = await buildApplicabilityWhere(query.industryId, query.objectTypeId)
    if (applicability) {
      where.applicability = { some: applicability }
    }

    const solutions = await prisma.robotSolution.findMany({
      where,
      include: listInclude,
      orderBy: { name: 'asc' },
    })
    return solutions.map(toListItem)
  },

  async getById(id: number) {
    const solution = await prisma.robotSolution.findUnique({
      where: { id },
      include: {
        ...listInclude,
        specs: { orderBy: { sortOrder: 'asc' } },
        applicability: {
          include: {
            industry: { select: { id: true, name: true, slug: true } },
            objectType: { select: { id: true, name: true, slug: true } },
          },
        },
        caseStudies: { orderBy: { publishedAt: 'desc' } },
      },
    })
    if (!solution) {
      throw new NotFoundError('Решение', 'Решение не найдено')
    }
    const { tags, ratings, ...rest } = solution
    const avgRating =
      ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : null
    return { ...rest, tags: tags.map((t) => t.tag), avgRating, ratingsCount: ratings.length }
  },

  async getSpecs(id: number) {
    await ensureSolutionExists(id)
    return prisma.solutionSpec.findMany({ where: { solutionId: id }, orderBy: { sortOrder: 'asc' } })
  },

  async getCaseStudies(id: number) {
    await ensureSolutionExists(id)
    return prisma.caseStudy.findMany({
      where: { solutionId: id },
      orderBy: { publishedAt: 'desc' },
      include: {
        industry: { select: { id: true, name: true } },
        objectType: { select: { id: true, name: true } },
      },
    })
  },

  async listVendors() {
    return prisma.vendor.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { robotSolutions: true } } },
    })
  },

  async listCategories() {
    return prisma.solutionCategory.findMany({
      orderBy: { id: 'asc' },
      include: { _count: { select: { robotSolutions: true } } },
    })
  },

  async listTags() {
    return prisma.tag.findMany({ orderBy: { name: 'asc' } })
  },
}

export async function ensureSolutionExists(id: number): Promise<void> {
  const solution = await prisma.robotSolution.findUnique({ where: { id }, select: { id: true } })
  if (!solution) {
    throw new NotFoundError('Решение', 'Решение не найдено')
  }
}
