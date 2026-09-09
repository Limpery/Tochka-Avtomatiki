import { trpc } from '../../lib/trpc'

export const getRobotsTrpcRoute = trpc.procedure.query(async ({ ctx }) => {
  const robots = await ctx.prisma.robot.findMany({
    select: {
      id: true,
      name: true,
      title: true,
      description: true,
    },
  })

  return robots
})
