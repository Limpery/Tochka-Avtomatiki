import z from 'zod'
import { trpc } from '../../lib/trpc'

export const getMemTrpcRoute = trpc.procedure
  .input(
    z.object({
      nameMem: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const mem = await ctx.prisma.mem.findUnique({
      where: {
        name: input.nameMem,
      },
    })

    return { mem }
  })
