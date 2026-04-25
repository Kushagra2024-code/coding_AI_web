import { Router } from 'express'
import { submitCode } from '../controllers/submission.controller'
import { requireAuth } from '../middlewares/auth.middleware'

export const submissionRouter = Router()

submissionRouter.post('/submit-code', requireAuth, (req, res, next) => {
  submitCode(req, res).catch(next)
})
