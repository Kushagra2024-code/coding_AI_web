import { Router } from 'express'
import { login, me, register } from '../controllers/auth.controller'
import { requireAuth } from '../middlewares/auth.middleware'

export const authRouter = Router()

authRouter.post('/auth/register', (req, res, next) => {
  register(req, res).catch(next)
})

authRouter.post('/auth/login', (req, res, next) => {
  login(req, res).catch(next)
})

authRouter.get('/me', requireAuth, (req, res, next) => {
  me(req, res).catch(next)
})
