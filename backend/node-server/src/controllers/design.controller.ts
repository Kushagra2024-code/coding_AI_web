import mongoose from 'mongoose'
import { Request, Response } from 'express'
import { z } from 'zod'
import { isDatabaseReady } from '../config/db'
import { DesignSubmissionEntity } from '../models/DesignSubmission'
import { evaluateSystemDesignWithAi } from '../services/ai/gemini.service'
import { listDesignQuestions } from '../services/design.service'

const evaluateDesignSchema = z.object({
  sessionId: z.string().min(3).optional(),
  questionTitle: z.string().min(3).max(180),
  architectureText: z.string().min(20).max(12000),
  timerSeconds: z.number().int().min(0).optional(),
  diagram: z.object({
    nodes: z.array(
      z.object({
        id: z.string(),
        type: z.enum(['rectangle', 'database', 'text']),
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
        label: z.string(),
      }),
    ),
    edges: z.array(
      z.object({
        id: z.string(),
        from: z.string(),
        to: z.string(),
        label: z.string().optional(),
      }),
    ),
  }),
})

export async function getDesignQuestions(_req: Request, res: Response): Promise<void> {
  const questions = await listDesignQuestions()
  res.status(200).json({ questions })
}

export async function evaluateDesign(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  const parsed = evaluateDesignSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten().fieldErrors })
    return
  }

  const payload = parsed.data

  if (isDatabaseReady() && payload.sessionId && !mongoose.isValidObjectId(payload.sessionId)) {
    res.status(400).json({ message: 'Invalid sessionId' })
    return
  }

  const evaluation = await evaluateSystemDesignWithAi({
    questionTitle: payload.questionTitle,
    architectureText: payload.architectureText,
    diagram: payload.diagram,
  })

  let percentile = 95 // Default
  if (isDatabaseReady()) {
    await DesignSubmissionEntity.create({
      userId: req.user.id,
      sessionId: payload.sessionId,
      questionTitle: payload.questionTitle,
      architectureText: payload.architectureText,
      diagram: payload.diagram,
      evaluation,
      timeTakenSeconds: payload.timerSeconds,
    })

    // Calculate Standing (Percentile based on timeTakenSeconds)
    if (payload.timerSeconds !== undefined) {
      const slowerCount = await DesignSubmissionEntity.countDocuments({
        questionTitle: payload.questionTitle,
        timeTakenSeconds: { $gt: payload.timerSeconds },
      })
      const totalCount = await DesignSubmissionEntity.countDocuments({
        questionTitle: payload.questionTitle,
      })
      if (totalCount > 1) {
        percentile = Math.round((slowerCount / (totalCount - 1)) * 100)
      }
    }
  }

  res.status(200).json({
    evaluation,
    percentile,
  })
}
