import { Router } from 'express'
import { healthRouter } from './health.routes'
import { coreRouter } from './core.routes'

export const apiRouter = Router()

apiRouter.use('/', healthRouter)
apiRouter.use('/', coreRouter)
