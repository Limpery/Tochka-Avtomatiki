import { memes } from '../../lib/memes'
import { trpc } from '../../lib/trpc'
import { zCreateMemTrpcInput } from './input'

export const createMemTrpcRoute = trpc.procedure.input(zCreateMemTrpcInput).mutation(({ input }) => {
  if (memes.find((mem) => mem.name === input.name)) {
    throw Error('Mem already exists')
  }
  memes.unshift(input)
  return true
})
