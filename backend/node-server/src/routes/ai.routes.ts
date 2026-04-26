import { Router } from 'express'
import { 
  generateFeedback, 
  generateQuestion, 
  interviewMessage,
  codeRefactor,
  designRefactor
} from '../controllers/ai.controller'
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

aiRouter.post('/code-refactor', requireAuth, (req, res, next) => {
  codeRefactor(req, res).catch(next)
})

aiRouter.post('/design-refactor', requireAuth, (req, res, next) => {
  designRefactor(req, res).catch(next)
})
