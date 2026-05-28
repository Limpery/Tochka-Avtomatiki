import { initTRPC } from '@trpc/server'

const memes = [
  {
    id: 1,
    title: 'Mem 1',
    description: 'Description 1 ...',
  },
  {
    id: 2,
    title: 'Mem 2',
    description: 'Description 2 ...',
  },
  {
    id: 3,
    title: 'Mem 3',
    description: 'Description 3 ...',
  },
  {
    id: 4,
    title: 'Mem 4',
    description: 'Description 4 ...',
  },
  {
    id: 5,
    title: 'Mem 5',
    description: 'Description 5 ...',
  },
]

const trpc = initTRPC.create()

export const trpcRouter = trpc.router({
  getMemes: trpc.procedure.query(() => {
    return { memes }
  }),
})

export type TrpcRouter = typeof trpcRouter