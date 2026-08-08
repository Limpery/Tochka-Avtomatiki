import z from 'zod'
import { memes } from '../../lib/memes'
import { trpc } from '../../lib/trpc'

export const getMemTrpcRoute = trpc.procedure
  .input(
    z.object({
      nameMem: z.string(),
    }),
  )
  .query(({ input }) => {
    const mem = memes.find((mem) => mem.name === input.nameMem)
    return { mem: mem || null }
  })
