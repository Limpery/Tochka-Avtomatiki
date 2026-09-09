import z from 'zod'

export const zCreateRobotTrpcInput = z.object({
  name: z.string().min(1),
  title: z
    .string()
    .min(1)
    // eslint-disable-next-line require-unicode-regexp
    .regex(/^[a-z0-9-]+$/, 'Robot name may contain only lowercase letters, numbers and dashes'),
  description: z.string().min(1),
  text: z.string().min(100, 'Text should be at least 100 characters long'),
})
