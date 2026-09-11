import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: './src/prisma/schema.prisma',
  migrations: {
    seed: 'npx tsx src/prisma/seed.ts',
  },
  datasource: {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    url: process.env.DATABASE_URL!,
  },
})
