import { Request, Response } from 'express'
import { listQuestions, getQuestionById, createQuestion as createQuestionService } from '../services/question.service'

export async function getQuestions(_req: Request, res: Response): Promise<void> {
  const questions = await listQuestions()
  res.status(200).json({ questions })
}

export async function getQuestion(req: Request, res: Response): Promise<void> {
  const question = await getQuestionById(req.params.questionId)
  if (!question) {
    res.status(404).json({ message: 'Question not found' })
    return
  }

  res.status(200).json({ question })
}

export async function createQuestion(req: Request, res: Response): Promise<void> {
  try {
    const questionId = await createQuestionService(req.body)
    res.status(201).json({ id: questionId, message: 'Question created successfully' })
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to create question' })
  }
}
