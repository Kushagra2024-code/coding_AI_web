import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { z } from 'zod'
import { isDatabaseReady } from '../config/db'
import { SubmissionEntity } from '../models/Submission'
import { getQuestionWithHiddenTests } from '../services/question.service'
import { executeWithJudge0, type JudgeResult, type SupportedLanguage } from '../services/compiler/judge0.service'

const submitCodeSchema = z.object({
  questionId: z.string().min(3),
  sessionId: z.string().min(3).optional(),
  code: z.string().min(1),
  language: z.enum(['cpp', 'python', 'java', 'javascript']),
})

function normalize(text: string): string {
  return text.replace(/\r\n/g, '\n').trim()
}

function computeEfficiencyScore(avgTimeMs: number): number {
  if (avgTimeMs <= 120) return 100
  if (avgTimeMs <= 250) return 90
  if (avgTimeMs <= 500) return 75
  if (avgTimeMs <= 1000) return 60
  if (avgTimeMs <= 2000) return 40
  return 20
}

export async function submitCode(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  const parsed = submitCodeSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten().fieldErrors })
    return
  }

  const payload = parsed.data
  const question = await getQuestionWithHiddenTests(payload.questionId)
  if (!question) {
    res.status(404).json({ message: 'Question not found' })
    return
  }

  const tests = [...question.visibleTests, ...question.hiddenTests]
  if (!tests.length) {
    res.status(400).json({ message: 'Question has no test cases' })
    return
  }

  let passed = 0
  let totalTime = 0
  let finalExecution: JudgeResult = {
    stdout: '',
    stderr: '',
    compileOutput: '',
    status: 'Accepted',
    timeMs: 0,
    memoryKb: 0,
  }

  const testResults: Array<{ index: number; passed: boolean; status: string; stdout: string; expected: string }> = []

  for (let i = 0; i < tests.length; i += 1) {
    const test = tests[i]
    const execution = await executeWithJudge0({
      code: payload.code,
      language: payload.language as SupportedLanguage,
      stdin: test.input,
    })

    finalExecution = execution
    totalTime += execution.timeMs

    const actual = normalize(execution.stdout ?? '')
    const expected = normalize(test.output)
    const ok = actual === expected && !execution.stderr && !execution.compileOutput

    if (ok) {
      passed += 1
    }

    testResults.push({
      index: i,
      passed: ok,
      status: execution.status,
      stdout: actual,
      expected,
    })
  }

  const totalTests = tests.length
  const correctnessScore = Math.round((passed / totalTests) * 100)
  const averageTime = Math.round(totalTime / totalTests)
  const efficiencyScore = computeEfficiencyScore(averageTime)

  if (isDatabaseReady()) {
    if (payload.sessionId && !mongoose.isValidObjectId(payload.sessionId)) {
      res.status(400).json({ message: 'Invalid sessionId' })
      return
    }

    await SubmissionEntity.create({
      userId: req.user.id,
      sessionId: payload.sessionId,
      questionId: question.id,
      code: payload.code,
      language: payload.language,
      passedTests: passed,
      totalTests,
      correctnessScore,
      efficiencyScore,
      execution: {
        stdout: finalExecution.stdout ?? '',
        stderr: finalExecution.stderr ?? '',
        compileOutput: finalExecution.compileOutput ?? '',
        status: finalExecution.status,
        timeMs: averageTime,
        memoryKb: finalExecution.memoryKb,
      },
    })
  }

  res.status(200).json({
    questionId: question.id,
    passedTests: passed,
    totalTests,
    correctnessScore,
    efficiencyScore,
    execution: {
      stdout: finalExecution.stdout ?? '',
      stderr: finalExecution.stderr ?? '',
      compileOutput: finalExecution.compileOutput ?? '',
      status: finalExecution.status,
      averageTimeMs: averageTime,
      memoryKb: finalExecution.memoryKb,
    },
    testResults,
  })
}
