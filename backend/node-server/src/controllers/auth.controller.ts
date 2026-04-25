import bcrypt from 'bcryptjs'
import { Request, Response } from 'express'
import { z } from 'zod'
import { UserEntity } from '../models/User'
import { signAccessToken } from '../utils/jwt'

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
})

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten().fieldErrors })
    return
  }

  const { name, email, password } = parsed.data

  const existing = await UserEntity.findOne({ email }).lean()
  if (existing) {
    res.status(409).json({ message: 'Email already in use' })
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await UserEntity.create({ name, email, passwordHash })

  const token = signAccessToken({ sub: user.id, email: user.email })

  res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      rating: user.rating,
    },
  })
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten().fieldErrors })
    return
  }

  const { email, password } = parsed.data

  const user = await UserEntity.findOne({ email })
  if (!user) {
    res.status(401).json({ message: 'Invalid credentials' })
    return
  }

  const matched = await bcrypt.compare(password, user.passwordHash)
  if (!matched) {
    res.status(401).json({ message: 'Invalid credentials' })
    return
  }

  const token = signAccessToken({ sub: user.id, email: user.email })

  res.status(200).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      rating: user.rating,
    },
  })
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  const user = await UserEntity.findById(req.user.id).lean()
  if (!user) {
    res.status(404).json({ message: 'User not found' })
    return
  }

  res.status(200).json({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      rating: user.rating,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  })
}
