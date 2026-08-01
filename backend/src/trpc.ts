import { initTRPC } from '@trpc/server'
import _ from 'lodash'
import z from 'zod'

const memes = _.times(100, (i) => ({
  name: `mem-name-${i}`,
  title: `Mem ${i}`,
  description: `Description ${i} ...`,
  text: _.times(100, (j) => `<p>Text paragraph ${j} of mem ${i}</p>`).join(''),
}))

const trpc = initTRPC.create()

export const trpcRouter = trpc.router({
  getMemes: trpc.procedure.query(() => ({ memes: memes.map((mem) => _.pick(mem, ['name', 'title', 'description'])) })),
  getMem: trpc.procedure
    .input(
      z.object({
        nameMem: z.string(),
      }),
    )
    .query(({ input }) => {
      const mem = memes.find((mem) => mem.name === input.nameMem)
      return { mem: mem || null }
    }),
})

export type TrpcRouter = typeof trpcRouter
