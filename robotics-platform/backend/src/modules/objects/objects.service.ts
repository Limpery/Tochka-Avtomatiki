import { prisma } from '../../prisma/client'
import { NotFoundError } from '../../shared/errors'

export const objectsService = {
  async list(industryId?: number) {
    return prisma.objectType.findMany({
      where: industryId ? { industryId } : undefined,
      orderBy: { id: 'asc' },
      include: { industry: { select: { id: true, name: true, slug: true } } },
    })
  },

  async getById(id: number) {
    const objectType = await prisma.objectType.findUnique({
      where: { id },
      include: {
        industry: true,
        benchmarkObjects: { select: { id: true, name: true, description: true } },
      },
    })
    if (!objectType) {
      throw new NotFoundError('Тип объекта', 'Тип объекта не найден')
    }
    return objectType
  },
}
