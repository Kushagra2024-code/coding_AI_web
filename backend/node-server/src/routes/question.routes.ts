import { Router } from 'express'
import { getQuestion, getQuestions, createQuestion } from '../controllers/question.controller'
import { requireAuth } from '../middlewares/auth.middleware'

export const questionRouter = Router()

questionRouter.get('/questions', requireAuth, (req, res, next) => {
  getQuestions(req, res).catch(next)
})

questionRouter.get('/questions/:questionId', requireAuth, (req, res, next) => {
  getQuestion(req, res).catch(next)
})

questionRouter.post('/questions', requireAuth, (req, res, next) => {
  createQuestion(req, res).catch(next)
})
