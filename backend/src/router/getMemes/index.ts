import { trpc } from '../../lib/trpc'

export const getMemesTrpcRoute = trpc.procedure.query(async ({ ctx }) => {
  const memes = await ctx.prisma.mem.findMany({
    select: {
      id: true,
      name: true,
      description: true,
    },
  })

  return memes
})
