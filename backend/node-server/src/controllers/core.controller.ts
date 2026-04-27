import mongoose from 'mongoose'
import { Request, Response } from 'express'
import { z } from 'zod'
import { isDatabaseReady } from '../config/db'
import { CheatingEventEntity } from '../models/CheatingEvent'
import { DesignSubmissionEntity } from '../models/DesignSubmission'
import { QuestionEntity } from '../models/Question'
import { SessionEntity } from '../models/Session'
import { SubmissionEntity } from '../models/Submission'
import { assessCheatingRisk } from '../services/cheating/cheating.service'
import { average, computeOverallScore } from '../services/scoring/sessionScore.service'

const detectCheatingSchema = z.object({
  sessionId: z.string().min(3).optional(),
  signals: z.object({
    tabSwitchCount: z.number().int().min(0).default(0),
    windowBlurCount: z.number().int().min(0).default(0),
    pasteChars: z.number().int().min(0).default(0),
    pasteCount: z.number().int().min(0).default(0),
    solveTimeSeconds: z.number().int().min(0).optional(),
    similarityScore: z.number().min(0).max(100).optional(),
  }),
  metadata: z.record(z.unknown()).optional(),
})

const scoreQuerySchema = z.object({
  sessionId: z.string().min(3).optional(),
  correctness: z.coerce.number().min(0).max(100).optional(),
  efficiency: z.coerce.number().min(0).max(100).optional(),
  codeQuality: z.coerce.number().min(0).max(100).optional(),
  designQuality: z.coerce.number().min(0).max(100).optional(),
})

export async function detectCheating(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  const parsed = detectCheatingSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten().fieldErrors })
    return
  }

  const payload = parsed.data

  if (isDatabaseReady() && payload.sessionId && !mongoose.isValidObjectId(payload.sessionId)) {
    res.status(400).json({ message: 'Invalid sessionId' })
    return
  }

  const assessment = assessCheatingRisk(payload.signals)

  if (isDatabaseReady()) {
    await CheatingEventEntity.create({
      userId: req.user.id,
      sessionId: payload.sessionId,
      signalType: 'aggregate',
      metadata: {
        ...payload.metadata,
        signals: payload.signals,
        flags: assessment.flags,
        severity: assessment.severity,
      },
      riskScore: assessment.riskScore,
      timestamp: new Date(),
    })
  }

  res.status(200).json({
    sessionId: payload.sessionId ?? null,
    riskScore: assessment.riskScore,
    severity: assessment.severity,
    flags: assessment.flags,
  })
}

export async function getSessionScore(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  const parsed = scoreQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid query', errors: parsed.error.flatten().fieldErrors })
    return
  }

  const query = parsed.data

  if (query.sessionId && isDatabaseReady()) {
    if (!mongoose.isValidObjectId(query.sessionId)) {
      res.status(400).json({ message: 'Invalid sessionId' })
      return
    }

    const session = await SessionEntity.findOne({ _id: query.sessionId, userId: req.user.id })
    if (!session) {
      res.status(404).json({ message: 'Session not found' })
      return
    }

    const submissions = await SubmissionEntity.find({ userId: req.user.id, sessionId: session.id }).lean()
    const designSubmission = await DesignSubmissionEntity.findOne({
      userId: req.user.id,
      sessionId: session.id,
    })
      .sort({ createdAt: -1 })
      .lean()

    const derivedBreakdown = {
      correctness: average(submissions.map((s) => s.correctnessScore)),
      efficiency: average(submissions.map((s) => s.efficiencyScore)),
      codeQuality: session.scoreBreakdown?.codeQuality ?? (submissions.length > 0 ? 70 : 0),
      designQuality: designSubmission?.evaluation.score ?? session.scoreBreakdown?.designQuality ?? 0,
    }

    const { breakdown, overallScore } = computeOverallScore({
      correctness: session.scoreBreakdown?.correctness ?? derivedBreakdown.correctness,
      efficiency: session.scoreBreakdown?.efficiency ?? derivedBreakdown.efficiency,
      codeQuality: session.scoreBreakdown?.codeQuality ?? derivedBreakdown.codeQuality,
      designQuality: session.scoreBreakdown?.designQuality ?? derivedBreakdown.designQuality,
    })

    session.scoreBreakdown = breakdown
    session.overallScore = overallScore
    await session.save()

    res.status(200).json({
      sessionId: session.id,
      breakdown,
      overallScore,
      formula: 'overall = correctness*0.40 + efficiency*0.20 + codeQuality*0.20 + designQuality*0.20',
    })
    return
  }

  const { breakdown, overallScore } = computeOverallScore({
    correctness: query.correctness,
    efficiency: query.efficiency,
    codeQuality: query.codeQuality,
    designQuality: query.designQuality,
  })

  res.status(200).json({
    sessionId: query.sessionId ?? null,
    breakdown,
    overallScore,
    formula: 'overall = correctness*0.40 + efficiency*0.20 + codeQuality*0.20 + designQuality*0.20',
  })
}

export async function getAnalytics(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  if (!isDatabaseReady()) {
    res.status(200).json({
      summary: {
        totalSessions: 0,
        totalSubmissions: 0,
        avgOverallScore: 0,
      },
      topicStrengths: [],
      recentActivity: [],
      history: {
        sessions: [],
      },
    })
    return
  }

  try {
    const sessions = await SessionEntity.find({ userId: req.user.id }).sort({ startTime: -1 }).limit(50).lean()
    const submissions = await SubmissionEntity.find({ userId: req.user.id })
      .populate('questionId', 'tags')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    const designSubmissions = await DesignSubmissionEntity.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    // 1. Core aggregates
    const totalSessions = await SessionEntity.countDocuments({ userId: req.user.id })
    const totalSubmissions = await SubmissionEntity.countDocuments({ userId: req.user.id })
    
    // For sessions without overallScore, we use the average correctness of submissions in that session
    const sessionScores = await Promise.all(sessions.map(async (s) => {
      if (s.overallScore) return s.overallScore
      const sessionSubmissions = await SubmissionEntity.find({ sessionId: s._id })
      if (sessionSubmissions.length === 0) return 0
      return average(sessionSubmissions.map(sub => sub.correctnessScore))
    }))
    
    const avgOverallScore = average(sessionScores)

    // 2. Topic level strengths (aggregate by tags)
    const topicMap: Record<string, { total: number; correctness: number; efficiency: number; count: number }> = {}

    for (const sub of submissions) {
      const question = sub.questionId as any
      if (question?.tags) {
        for (const tag of question.tags) {
          if (!topicMap[tag]) {
            topicMap[tag] = { total: 0, correctness: 0, efficiency: 0, count: 0 }
          }
          topicMap[tag].correctness += sub.correctnessScore
          topicMap[tag].efficiency += sub.efficiencyScore
          topicMap[tag].count += 1
        }
      }
    }

    const topicStrengths = Object.entries(topicMap).map(([tag, stats]) => ({
      tag,
      averageCorrectness: Math.round(stats.correctness / stats.count),
      averageEfficiency: Math.round(stats.efficiency / stats.count),
      count: stats.count,
    })).filter(t => t.count > 0)

    // 3. Activity trends (last 7 days - simplified)
    const recentActivity = [
      ...submissions.map((s) => ({
        type: 'coding',
        id: s._id,
        timestamp: s.createdAt,
        score: s.correctnessScore,
        label: 'Coding Submission',
      })),
      ...designSubmissions.map((d) => ({
        type: 'design',
        id: d._id,
        timestamp: d.createdAt,
        score: d.evaluation.score,
        label: `Design: ${d.questionTitle}`,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20)

    res.status(200).json({
      summary: {
        totalSessions,
        totalSubmissions,
        avgOverallScore,
      },
      topicStrengths: topicStrengths.sort((a, b) => b.count - a.count),
      recentActivity,
      history: {
        sessions: sessions.slice(0, 10),
      },
    })
  } catch (error) {
    console.error('Analytics error:', error)
    res.status(500).json({ message: 'Failed to fetch analytics' })
  }
}
