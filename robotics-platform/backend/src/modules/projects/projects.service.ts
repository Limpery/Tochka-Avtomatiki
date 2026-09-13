import { prisma } from '../../prisma/client'
import { NotFoundError, ValidationError } from '../../shared/errors'
import type {
  CreateProcessInput,
  CreateProjectInput,
  UpdateProjectInput,
} from '../../shared/schemas/projects'

const projectInclude = {
  objectType: { include: { industry: { select: { id: true, name: true, slug: true } } } },
  benchmark: { select: { id: true, name: true, description: true, data: true } },
  processes: { orderBy: { sortOrder: 'asc' as const } },
  _count: { select: { matches: true, comparisons: true, calculations: true } },
}

/**
 * Проверка владения: чужой проект неотличим от несуществующего (404, а не 403),
 * чтобы не раскрывать факт существования id.
 */
export async function ensureProjectOwner(userId: number, projectId: number) {
  const project = await prisma.userProject.findFirst({
    where: { id: projectId, userId },
    include: { objectType: { select: { id: true, industryId: true, name: true } } },
  })
  if (!project) {
    throw new NotFoundError('Проект', 'Проект не найден')
  }
  return project
}

// Бенчмарк должен относиться к тому же типу объекта, что и проект — иначе данные бессмысленны.
async function validateBenchmark(objectTypeId: number, benchmarkObjectId: number | null | undefined) {
  if (!benchmarkObjectId) {
    return
  }
  const benchmark = await prisma.benchmarkObject.findUnique({
    where: { id: benchmarkObjectId },
    select: { objectTypeId: true },
  })
  if (!benchmark) {
    throw new NotFoundError('Эталонный объект')
  }
  if (benchmark.objectTypeId !== objectTypeId) {
    throw new ValidationError('Эталонный объект относится к другому типу объекта')
  }
}

export const projectsService = {
  async list(userId: number) {
    return prisma.userProject.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        objectType: { include: { industry: { select: { id: true, name: true, slug: true } } } },
        _count: { select: { processes: true, matches: true, comparisons: true } },
      },
    })
  },

  async getById(userId: number, id: number) {
    const project = await prisma.userProject.findFirst({
      where: { id, userId },
      include: projectInclude,
    })
    if (!project) {
      throw new NotFoundError('Проект', 'Проект не найден')
    }
    return project
  },

  async create(userId: number, input: CreateProjectInput) {
    const objectType = await prisma.objectType.findUnique({
      where: { id: input.objectTypeId },
      select: { id: true },
    })
    if (!objectType) {
      throw new NotFoundError('Тип объекта', 'Тип объекта не найден')
    }
    await validateBenchmark(input.objectTypeId, input.benchmarkObjectId)

    return prisma.userProject.create({
      data: {
        userId,
        name: input.name,
        description: input.description,
        objectTypeId: input.objectTypeId,
        useBenchmark: input.useBenchmark ?? Boolean(input.benchmarkObjectId),
        benchmarkObjectId: input.benchmarkObjectId ?? null,
        areaSqm: input.areaSqm ?? null,
        employeeCount: input.employeeCount ?? null,
        shiftCount: input.shiftCount ?? null,
        operatingHours: input.operatingHours ?? null,
        monthlyFund: input.monthlyFund ?? null,
      },
      include: projectInclude,
    })
  },

  async update(userId: number, id: number, input: UpdateProjectInput) {
    const current = await ensureProjectOwner(userId, id)
    const objectTypeId = input.objectTypeId ?? current.objectTypeId

    if (input.objectTypeId && input.objectTypeId !== current.objectTypeId) {
      const objectType = await prisma.objectType.findUnique({
        where: { id: input.objectTypeId },
        select: { id: true },
      })
      if (!objectType) {
        throw new NotFoundError('Тип объекта', 'Тип объекта не найден')
      }
    }
    if (input.benchmarkObjectId !== undefined) {
      await validateBenchmark(objectTypeId, input.benchmarkObjectId)
    }

    // Почему явное перечисление: не хотим случайно пропустить в update поля вроде userId.
    return prisma.userProject.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        objectTypeId: input.objectTypeId,
        useBenchmark: input.useBenchmark,
        benchmarkObjectId: input.benchmarkObjectId,
        areaSqm: input.areaSqm,
        employeeCount: input.employeeCount,
        shiftCount: input.shiftCount,
        operatingHours: input.operatingHours,
        monthlyFund: input.monthlyFund,
      },
      include: projectInclude,
    })
  },

  async remove(userId: number, id: number) {
    await ensureProjectOwner(userId, id)
    // Процессы, подборы, расчёты удалятся каскадом (onDelete: Cascade в схеме).
    await prisma.userProject.delete({ where: { id } })
    return { success: true }
  },

  async addProcess(userId: number, projectId: number, input: CreateProcessInput) {
    await ensureProjectOwner(userId, projectId)
    const sortOrder =
      input.sortOrder ?? (await prisma.userProjectProcess.count({ where: { projectId } })) + 1

    return prisma.userProjectProcess.create({
      data: {
        projectId,
        processName: input.processName,
        description: input.description,
        currentCost: input.currentCost ?? null,
        currentHours: input.currentHours ?? null,
        employeeCount: input.employeeCount ?? null,
        frequency: input.frequency ?? null,
        sortOrder,
      },
    })
  },

  async removeProcess(userId: number, projectId: number, processId: number) {
    await ensureProjectOwner(userId, projectId)
    const process = await prisma.userProjectProcess.findFirst({
      where: { id: processId, projectId },
      select: { id: true },
    })
    if (!process) {
      throw new NotFoundError('Процесс', 'Процесс не найден')
    }
    await prisma.userProjectProcess.delete({ where: { id: processId } })
    return { success: true }
  },
}
