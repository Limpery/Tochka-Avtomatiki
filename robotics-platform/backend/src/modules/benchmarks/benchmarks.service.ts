import { prisma } from '../../prisma/client'
import { NotFoundError } from '../../shared/errors'

export const benchmarksService = {
  async list(objectTypeId?: number) {
    return prisma.benchmarkObject.findMany({
      where: objectTypeId ? { objectTypeId } : undefined,
      orderBy: { id: 'asc' },
      include: { objectType: { select: { id: true, name: true, slug: true } } },
    })
  },

  async getById(id: number) {
    const benchmark = await prisma.benchmarkObject.findUnique({
      where: { id },
      include: { objectType: { include: { industry: true } } },
    })
    if (!benchmark) {
      throw new NotFoundError('Эталонный объект')
    }
    return benchmark
  },
}
