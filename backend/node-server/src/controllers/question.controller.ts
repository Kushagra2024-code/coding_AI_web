import { Request, Response } from 'express'
import { listQuestions, getQuestionById } from '../services/question.service'

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
