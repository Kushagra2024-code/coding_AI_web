import { Request, Response } from 'express'
import { z } from 'zod'
import { SessionEntity, SessionType } from '../models/Session'

const startSessionSchema = z.object({
  type: z.enum(['coding', 'oa', 'system_design', 'mixed']),
})

const scoreBreakdownSchema = z.object({
  correctness: z.number().min(0).max(100),
  efficiency: z.number().min(0).max(100),
  codeQuality: z.number().min(0).max(100),
  designQuality: z.number().min(0).max(100),
})

const endSessionSchema = z.object({
  sessionId: z.string().min(12),
  scoreBreakdown: scoreBreakdownSchema.optional(),
  overallScore: z.number().min(0).max(100).optional(),
})

export async function startSession(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  const parsed = startSessionSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten().fieldErrors })
    return
  }

  const session = await SessionEntity.create({
    userId: req.user.id,
    type: parsed.data.type as SessionType,
    startTime: new Date(),
  })

  res.status(201).json({
    session: {
      id: session.id,
      userId: session.userId,
      type: session.type,
      startTime: session.startTime,
      endTime: session.endTime,
      overallScore: session.overallScore,
    },
  })
}

export async function endSession(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  const parsed = endSessionSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten().fieldErrors })
    return
  }

  const session = await SessionEntity.findOne({
    _id: parsed.data.sessionId,
    userId: req.user.id,
  })

  if (!session) {
    res.status(404).json({ message: 'Session not found' })
    return
  }

  session.endTime = new Date()

  if (parsed.data.scoreBreakdown) {
    session.scoreBreakdown = parsed.data.scoreBreakdown
  }

  if (typeof parsed.data.overallScore === 'number') {
    session.overallScore = parsed.data.overallScore
  }

  await session.save()

  res.status(200).json({
    session: {
      id: session.id,
      userId: session.userId,
      type: session.type,
      startTime: session.startTime,
      endTime: session.endTime,
      scoreBreakdown: session.scoreBreakdown,
      overallScore: session.overallScore,
      updatedAt: session.updatedAt,
    },
  })
}
