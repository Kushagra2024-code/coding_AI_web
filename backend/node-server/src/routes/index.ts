import { Router } from 'express'
import { healthRouter } from './health.routes'
import { coreRouter } from './core.routes'
import { authRouter } from './auth.routes'
import { sessionRouter } from './session.routes'
import { questionRouter } from './question.routes'
import { submissionRouter } from './submission.routes'
import { aiRouter } from './ai.routes'
import { designRouter } from './design.routes'

export const apiRouter = Router()

apiRouter.get('/', (_req, res) => {
  res.json({ message: 'AI OA Practice API is online', version: '1.0.0' })
})

apiRouter.use('/', healthRouter)
apiRouter.use('/', coreRouter)
apiRouter.use('/', authRouter)
apiRouter.use('/', sessionRouter)
apiRouter.use('/', questionRouter)
apiRouter.use('/', submissionRouter)
apiRouter.use('/', aiRouter)
apiRouter.use('/', designRouter)
