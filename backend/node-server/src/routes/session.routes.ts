import { Router } from 'express'
import { endSession, startSession } from '../controllers/session.controller'
import { requireAuth } from '../middlewares/auth.middleware'

export const sessionRouter = Router()

sessionRouter.post('/sessions/start', requireAuth, (req, res, next) => {
  startSession(req, res).catch(next)
})

sessionRouter.post('/sessions/end', requireAuth, (req, res, next) => {
  endSession(req, res).catch(next)
})
