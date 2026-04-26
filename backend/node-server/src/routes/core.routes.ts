import { Router } from 'express'
import { detectCheating, getSessionScore, getAnalytics } from '../controllers/core.controller'
import { requireAuth } from '../middlewares/auth.middleware'

export const coreRouter = Router()

coreRouter.post('/detect-cheating', requireAuth, (req, res, next) => {
  detectCheating(req, res).catch(next)
})

coreRouter.get('/session-score', requireAuth, (req, res, next) => {
  getSessionScore(req, res).catch(next)
})

coreRouter.get('/analytics', requireAuth, (req, res, next) => {
  getAnalytics(req, res).catch(next)
})
