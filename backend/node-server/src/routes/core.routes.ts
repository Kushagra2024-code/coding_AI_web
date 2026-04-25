import { Router } from 'express'

export const coreRouter = Router()

coreRouter.post('/generate-question', (_req, res) => {
  res.status(501).json({ message: 'Not implemented yet' })
})

coreRouter.post('/submit-code', (_req, res) => {
  res.status(501).json({ message: 'Not implemented yet' })
})

coreRouter.post('/evaluate-design', (_req, res) => {
  res.status(501).json({ message: 'Not implemented yet' })
})

coreRouter.post('/detect-cheating', (_req, res) => {
  res.status(501).json({ message: 'Not implemented yet' })
})

coreRouter.post('/generate-feedback', (_req, res) => {
  res.status(501).json({ message: 'Not implemented yet' })
})

coreRouter.get('/session-score', (_req, res) => {
  res.status(501).json({ message: 'Not implemented yet' })
})

coreRouter.get('/analytics', (_req, res) => {
  res.status(501).json({ message: 'Not implemented yet' })
})
