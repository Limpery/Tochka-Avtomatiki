import z from 'zod'
import { trpc } from '../../lib/trpc'

export const listBenchmarksTrpcRoute = trpc.procedure
  .input(z.object({ objectTypeSlug: z.string() }))
  .query(async ({ ctx, input }) => {
    const benchmarks = await ctx.prisma.benchmarkObject.findMany({
      where: { objectType: { slug: input.objectTypeSlug } },
      orderBy: { id: 'asc' },
      include: { objectType: { select: { id: true, name: true, slug: true } } },
    })
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return benchmarks.map((b) => ({ ...b, data: b.data as unknown }))
  })
