import { Request, Response } from 'express'
import { z } from 'zod'
import { isDatabaseReady } from '../config/db'
import { QuestionEntity } from '../models/Question'
import {
  generateCodeFeedbackWithAi,
  generateCodingQuestionWithAi,
  generateInterviewTurnWithAi,
  generateRefactoredCodeWithAi,
  suggestDesignImprovements,
} from '../services/ai/gemini.service'

const generateQuestionSchema = z.object({
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  tags: z.array(z.string().min(1).max(30)).max(8).default([]),
})

const generateFeedbackSchema = z.object({
  problemTitle: z.string().min(3).max(160),
  code: z.string().min(1),
  language: z.enum(['cpp', 'python', 'java', 'javascript']),
  correctnessScore: z.number().min(0).max(100),
  efficiencyScore: z.number().min(0).max(100),
})

const interviewMessageSchema = z.object({
  problemTitle: z.string().min(3).max(160),
  problemSummary: z.string().min(8).max(2000),
  candidateMessage: z.string().min(1).max(4000),
})

const codeRefactorSchema = z.object({
  problemTitle: z.string().min(3).max(160),
  code: z.string().min(1),
  language: z.string(),
})

const designRefactorSchema = z.object({
  questionTitle: z.string().min(3).max(160),
  architectureText: z.string().min(1),
})

export async function generateQuestion(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  const parsed = generateQuestionSchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten().fieldErrors })
    return
  }

  const aiQuestion = await generateCodingQuestionWithAi({
    difficulty: parsed.data.difficulty,
    tags: parsed.data.tags,
  })

  if (isDatabaseReady()) {
    const created = await QuestionEntity.create({
      ...aiQuestion,
      source: 'ai_generated',
    })

    res.status(201).json({
      question: {
        id: created.id,
        title: created.title,
        difficulty: created.difficulty,
        tags: created.tags,
        description: created.description,
        constraints: created.constraints,
        sampleInput: created.sampleInput,
        sampleOutput: created.sampleOutput,
        visibleTests: created.visibleTests,
        source: created.source,
      },
    })
    return
  }

  res.status(201).json({
    question: {
      id: `ai_${Date.now().toString(36)}`,
      ...aiQuestion,
      source: 'ai_generated',
    },
  })
}

export async function generateFeedback(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  const parsed = generateFeedbackSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten().fieldErrors })
    return
  }

  const feedback = await generateCodeFeedbackWithAi(parsed.data)
  res.status(200).json({ feedback })
}

export async function interviewMessage(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  const parsed = interviewMessageSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten().fieldErrors })
    return
  }

  const response = await generateInterviewTurnWithAi(parsed.data)
  res.status(200).json({ turn: response })
}

export async function codeRefactor(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  const parsed = codeRefactorSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten().fieldErrors })
    return
  }

  const refactor = await generateRefactoredCodeWithAi(parsed.data)
  res.status(200).json({ refactor })
}

export async function designRefactor(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  const parsed = designRefactorSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten().fieldErrors })
    return
  }

  const refactor = await suggestDesignImprovements(parsed.data)
  res.status(200).json({ refactor })
}
