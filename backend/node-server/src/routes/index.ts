import { Router } from 'express'
import { healthRouter } from './health.routes'
import { coreRouter } from './core.routes'
import { authRouter } from './auth.routes'
import { sessionRouter } from './session.routes'

export const apiRouter = Router()

apiRouter.use('/', healthRouter)
apiRouter.use('/', coreRouter)
apiRouter.use('/', authRouter)
apiRouter.use('/', sessionRouter)
