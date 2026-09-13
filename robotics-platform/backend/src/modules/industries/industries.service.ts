import { prisma } from '../../prisma/client'
import { NotFoundError } from '../../shared/errors'

export const industriesService = {
  async list() {
    return prisma.industry.findMany({
      orderBy: { id: 'asc' },
      include: { _count: { select: { objectTypes: true } } },
    })
  },

  async getById(id: number) {
    const industry = await prisma.industry.findUnique({
      where: { id },
      include: { objectTypes: { orderBy: { id: 'asc' } } },
    })
    if (!industry) {
      throw new NotFoundError('Отрасль', 'Отрасль не найдена')
    }
    return industry
  },

  async listObjectTypes(industryId: number) {
    const industry = await prisma.industry.findUnique({ where: { id: industryId }, select: { id: true } })
    if (!industry) {
      throw new NotFoundError('Отрасль', 'Отрасль не найдена')
    }
    return prisma.objectType.findMany({
      where: { industryId },
      orderBy: { id: 'asc' },
      include: { _count: { select: { benchmarkObjects: true } } },
    })
  },
}
