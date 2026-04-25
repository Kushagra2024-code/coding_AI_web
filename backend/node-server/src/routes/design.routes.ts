import { Router } from 'express'
import { evaluateDesign, getDesignQuestions } from '../controllers/design.controller'
import { requireAuth } from '../middlewares/auth.middleware'

export const designRouter = Router()

designRouter.get('/design/questions', requireAuth, (req, res, next) => {
  getDesignQuestions(req, res).catch(next)
})

designRouter.post('/evaluate-design', requireAuth, (req, res, next) => {
  evaluateDesign(req, res).catch(next)
})
