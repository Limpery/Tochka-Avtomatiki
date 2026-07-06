import { initTRPC } from '@trpc/server'

const memes = [
  {
    name: "mem-name-1",
    title: 'Mem 1',
    description: 'Description 1 ...',
  },
  {
    name: "mem-name-2",
    title: 'Mem 2',
    description: 'Description 2 ...',
  },
  {
    name: "mem-name-3",
    title: 'Mem 3',
    description: 'Description 3 ...',
  },
  {
    name: "mem-name-4",
    title: 'Mem 4',
    description: 'Description 4 ...',
  },
  {
    name: "mem-name-5",
    title: 'Mem 5',
    description: 'Description 5 ...',
  },
]

const trpc = initTRPC.create()

export const trpcRouter = trpc.router({
  getMemes: trpc.procedure.query(() => ({ memes })),
})

export type TrpcRouter = typeof trpcRouter
