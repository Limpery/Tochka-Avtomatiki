import z from 'zod'
import { trpc } from '../../lib/trpc'

export const getRobotTrpcRoute = trpc.procedure
  .input(
    z.object({
      nameRobot: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const robot = await ctx.prisma.robot.findUnique({
      where: {
        name: input.nameRobot,
      },
    })

    return { robot }
  })
