import { trpc } from '../../lib/trpc'
import { zCreateRobotTrpcInput } from './input'

export const createRobotTrpcRoute = trpc.procedure.input(zCreateRobotTrpcInput).mutation(async ({ input, ctx }) => {
  const exRobot = await ctx.prisma.robot.findUnique({
    where: {
      name: input.name,
    },
  })
  if (exRobot) {
    throw Error('Robot already exists')
  }
  await ctx.prisma.robot.create({
    data: input,
  })

  return true
})
