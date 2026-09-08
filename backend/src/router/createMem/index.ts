import { trpc } from '../../lib/trpc'
import { zCreateMemTrpcInput } from './input'

export const createMemTrpcRoute = trpc.procedure.input(zCreateMemTrpcInput).mutation(async ({ input, ctx }) => {
  const exMem = await ctx.prisma.mem.findUnique({
    where: {
      name: input.name,
    },
  })
  if (exMem) {
    throw Error('Mem already exists')
  }
  await ctx.prisma.mem.create({
    data: input,
  })

  return true
})
