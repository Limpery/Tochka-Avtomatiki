import z from 'zod'
import { trpc } from '../../lib/trpc'
import { getActiveUserId } from '../../lib/demoUser'

const zProcessInput = z.object({
  processName: z.string().min(1),
  currentCost: z.number().nonnegative().optional(),
  currentHours: z.number().nonnegative().optional(),
  employeeCount: z.number().int().nonnegative().optional(),
  description: z.string().optional(),
})

export const createProjectTrpcRoute = trpc.procedure
  .input(
    z.object({
      objectTypeId: z.number().int(),
      name: z.string().min(1),
      description: z.string().optional(),
      benchmarkObjectId: z.number().int().optional(),
      areaSqm: z.number().positive().optional(),
      employeeCount: z.number().int().nonnegative().optional(),
      shiftCount: z.number().int().min(1).max(3).optional(),
      operatingHours: z.number().positive().optional(),
      monthlyFund: z.number().nonnegative().optional(),
      processes: z.array(zProcessInput).default([]),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const userId = await getActiveUserId(ctx)
    const { processes, ...projectData } = input
    const project = await ctx.prisma.userProject.create({
      data: {
        ...projectData,
        userId,
        useBenchmark: !!input.benchmarkObjectId,
        processes: {
          create: processes.map((p, i) => ({ ...p, sortOrder: i + 1 })),
        },
      },
    })
    return { id: project.id }
  })
