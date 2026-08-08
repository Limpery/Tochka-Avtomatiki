import cors from 'cors'
import express from 'express'
import { applyTrpcToExpressApp } from './lib/trpc'
import { trpcRouter } from './router'
const expressApp = express()
expressApp.use(cors())
expressApp.get('/ping', (req, res) => {
  res.send('pong')
})
applyTrpcToExpressApp(expressApp, trpcRouter)
expressApp.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.info('Listening at http://localhost:3000')
})
