import mongoose from 'mongoose'
import { isDatabaseReady } from '../config/db'
import { QuestionEntity, type Question } from '../models/Question'

const fallbackQuestions: Array<Partial<Question> & { _id: string }> = [
  {
    _id: 'fallback-two-sum',
    title: 'Two Sum',
    difficulty: 'easy',
    tags: ['array', 'hashing'],
    description:
      'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    constraints: ['2 <= nums.length <= 1e5', '-1e9 <= nums[i] <= 1e9'],
    sampleInput: 'nums = [2,7,11,15], target = 9',
    sampleOutput: '[0,1]',
    visibleTests: [
      { input: '4\n2 7 11 15\n9\n', output: '0 1' },
      { input: '3\n3 2 4\n6\n', output: '1 2' },
    ],
    hiddenTests: [{ input: '2\n3 3\n6\n', output: '0 1' }],
    source: 'curated',
  },
  {
    _id: 'fallback-valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'easy',
    tags: ['stack', 'string'],
    description:
      'Given a string s containing just the characters ( ) { } [ ], determine if the input string is valid.',
    constraints: ['1 <= s.length <= 1e5'],
    sampleInput: '()[]{}',
    sampleOutput: 'true',
    visibleTests: [
      { input: '()[]{}\n', output: 'true' },
      { input: '(]\n', output: 'false' },
    ],
    hiddenTests: [{ input: '([{}])\n', output: 'true' }],
    source: 'curated',
  },
]

export async function listQuestions(): Promise<Array<Record<string, unknown>>> {
  if (!isDatabaseReady()) {
    return fallbackQuestions.map((q) => ({
      id: q._id,
      title: q.title,
      difficulty: q.difficulty,
      tags: q.tags,
      source: q.source,
    }))
  }

  const questions = await QuestionEntity.find({}, { hiddenTests: 0 }).sort({ createdAt: -1 }).lean()
  return questions.map((q) => ({
    id: q._id.toString(),
    title: q.title,
    difficulty: q.difficulty,
    tags: q.tags,
    source: q.source,
  }))
}

export async function getQuestionById(questionId: string): Promise<Record<string, unknown> | null> {
  if (!isDatabaseReady()) {
    const question = fallbackQuestions.find((q) => q._id === questionId)
    if (!question) {
      return null
    }

    return {
      id: question._id,
      title: question.title,
      difficulty: question.difficulty,
      tags: question.tags,
      description: question.description,
      constraints: question.constraints,
      sampleInput: question.sampleInput,
      sampleOutput: question.sampleOutput,
      visibleTests: question.visibleTests,
      source: question.source,
    }
  }

  if (!mongoose.isValidObjectId(questionId)) {
    return null
  }

  const question = await QuestionEntity.findById(questionId, { hiddenTests: 0 }).lean()
  if (!question) {
    return null
  }

  return {
    id: question._id.toString(),
    title: question.title,
    difficulty: question.difficulty,
    tags: question.tags,
    description: question.description,
    constraints: question.constraints,
    sampleInput: question.sampleInput,
    sampleOutput: question.sampleOutput,
    visibleTests: question.visibleTests,
    source: question.source,
  }
}

export async function getQuestionWithHiddenTests(
  questionId: string,
): Promise<
  | {
      id: string
      title: string
      visibleTests: Array<{ input: string; output: string }>
      hiddenTests: Array<{ input: string; output: string }>
    }
  | null
> {
  if (!isDatabaseReady()) {
    const question = fallbackQuestions.find((q) => q._id === questionId)
    if (!question) {
      return null
    }

    return {
      id: question._id,
      title: question.title ?? 'Untitled',
      visibleTests: question.visibleTests ?? [],
      hiddenTests: question.hiddenTests ?? [],
    }
  }

  if (!mongoose.isValidObjectId(questionId)) {
    return null
  }

  const question = await QuestionEntity.findById(questionId).lean()
  if (!question) {
    return null
  }

  return {
    id: question._id.toString(),
    title: question.title,
    visibleTests: question.visibleTests,
    hiddenTests: question.hiddenTests,
  }
}

export async function createQuestion(data: Partial<Question>): Promise<string> {
  if (!isDatabaseReady()) {
    throw new Error('Database not connected. Cannot create persistent question.')
  }

  const question = await QuestionEntity.create({
    ...data,
    source: 'curated',
  })

  return question._id.toString()
}
