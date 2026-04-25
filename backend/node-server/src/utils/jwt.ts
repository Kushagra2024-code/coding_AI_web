import jwt from 'jsonwebtoken'
import { env } from '../config/env'

interface JwtUserPayload {
  sub: string
  email: string
}

export function signAccessToken(payload: JwtUserPayload): string {
  const expiresIn = env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn,
  })
}

export function verifyAccessToken(token: string): JwtUserPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtUserPayload
}
