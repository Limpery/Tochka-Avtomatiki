import { memes } from '../../lib/memes'
import { trpc } from '../../lib/trpc'
import { zCreateMemTrpcInput } from './input'

export const createMemTrpcRoute = trpc.procedure.input(zCreateMemTrpcInput).mutation(({ input }) => {
  memes.unshift(input)
  return true
})
