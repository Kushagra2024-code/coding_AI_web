import { NextFunction, Request, Response } from 'express'
import { verifyAccessToken } from '../utils/jwt'

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing or invalid authorization header' })
    return
  }

  const token = authHeader.slice('Bearer '.length).trim()

  try {
    const payload = verifyAccessToken(token)
    req.user = {
      id: payload.sub,
      email: payload.email,
    }
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}
