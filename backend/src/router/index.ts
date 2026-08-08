import { trpc } from '../lib/trpc'
// @index('./**/index.ts', f => `import { ${f.path.split('/').slice(0, -1).pop()}TrpcRoute } from '${f.path.split('/').slice(0, -1).join('/')}'`)
import { createMemTrpcRoute } from './createMem'
import { getMemTrpcRoute } from './getMem'
import { getMemesTrpcRoute } from './getMemes'
// @endindex

export const trpcRouter = trpc.router({
  // @index('./**/index.ts', f => `${f.path.split('/').slice(0, -1).pop()}: ${f.path.split('/').slice(0, -1).pop()}TrpcRoute,`)
  createMem: createMemTrpcRoute,
  getMem: getMemTrpcRoute,
  getMemes: getMemesTrpcRoute,
  // @endindex
})

export type TrpcRouter = typeof trpcRouter
