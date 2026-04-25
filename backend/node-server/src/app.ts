import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import { apiRouter } from './routes'
import { env } from './config/env'
import { errorHandler, notFoundHandler } from './middlewares/error.middleware'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: env.FRONTEND_URL, credentials: true }))
  app.use(express.json({ limit: '1mb' }))
  app.use(morgan('dev'))

  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 120,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  )

  app.use('/api', apiRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
