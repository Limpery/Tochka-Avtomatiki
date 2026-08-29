import 'dotenv/config';
import cors from 'cors'
import express from 'express'
import { applyTrpcToExpressApp } from './lib/trpc'
import { trpcRouter } from './router'
import { type AppContext ,createAppContext } from './lib/ctx'

void (async () => {
  let ctx: AppContext| null = null
  try {
    ctx = createAppContext()
    const expressApp = express()
  expressApp.use(cors())
  expressApp.get('/ping', (req, res) => {
    res.send('pong')
  })
  applyTrpcToExpressApp(expressApp, ctx, trpcRouter)
  expressApp.listen(3000, () => {
    // eslint-disable-next-line no-console
    console.info('Listening at http://localhost:3000')
  })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    await ctx?.stop()
  }
})()
