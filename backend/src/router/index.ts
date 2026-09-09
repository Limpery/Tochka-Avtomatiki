import { trpc } from '../lib/trpc'
// @index('./**/index.ts', f => `import { ${f.path.split('/').slice(0, -1).pop()}TrpcRoute } from '${f.path.split('/').slice(0, -1).join('/')}'`)
import { createRobotTrpcRoute } from './createRobot'
import { getRobotTrpcRoute } from './getRobot'
import { getRobotsTrpcRoute } from './getRobots'
// @endindex

export const trpcRouter = trpc.router({
  // @index('./**/index.ts', f => `${f.path.split('/').slice(0, -1).pop()}: ${f.path.split('/').slice(0, -1).pop()}TrpcRoute,`)
  createRobot: createRobotTrpcRoute,
  getRobot: getRobotTrpcRoute,
  getRobots: getRobotsTrpcRoute,
  // @endindex
})

export type TrpcRouter = typeof trpcRouter
