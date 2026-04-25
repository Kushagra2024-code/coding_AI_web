import { Router } from 'express'
import { generateFeedback, generateQuestion, interviewMessage } from '../controllers/ai.controller'
import { requireAuth } from '../middlewares/auth.middleware'

export const aiRouter = Router()

aiRouter.post('/generate-question', requireAuth, (req, res, next) => {
  generateQuestion(req, res).catch(next)
})

aiRouter.post('/generate-feedback', requireAuth, (req, res, next) => {
  generateFeedback(req, res).catch(next)
})

aiRouter.post('/interview/message', requireAuth, (req, res, next) => {
  interviewMessage(req, res).catch(next)
})
