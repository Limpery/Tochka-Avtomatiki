import _ from 'lodash'
import { memes } from '../../lib/memes'
import { trpc } from '../../lib/trpc'

export const getMemesTrpcRoute = trpc.procedure.query(() => ({
  memes: memes.map((mem) => _.pick(mem, ['name', 'title', 'description'])),
}))
