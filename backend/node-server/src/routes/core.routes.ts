import { Router } from 'express'

export const coreRouter = Router()

coreRouter.post('/detect-cheating', (_req, res) => {
  res.status(501).json({ message: 'Not implemented yet' })
})


coreRouter.get('/session-score', (_req, res) => {
  res.status(501).json({ message: 'Not implemented yet' })
})

coreRouter.get('/analytics', (_req, res) => {
  res.status(501).json({ message: 'Not implemented yet' })
})
