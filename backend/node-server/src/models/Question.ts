import mongoose, { HydratedDocument, Model, Schema } from 'mongoose'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface TestCase {
  input: string
  output: string
}

export interface Question {
  title: string
  difficulty: Difficulty
  tags: string[]
  description: string
  constraints: string[]
  sampleInput: string
  sampleOutput: string
  visibleTests: TestCase[]
  hiddenTests: TestCase[]
  source: 'curated' | 'ai_generated'
  createdAt: Date
  updatedAt: Date
}

export type QuestionDocument = HydratedDocument<Question>
export type QuestionModel = Model<Question>

const testCaseSchema = new Schema<TestCase>(
  {
    input: { type: String, required: true },
    output: { type: String, required: true },
  },
  { _id: false },
)

const questionSchema = new Schema<Question, QuestionModel>(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    tags: [{ type: String, trim: true }],
    description: { type: String, required: true },
    constraints: [{ type: String, required: true }],
    sampleInput: { type: String, required: true },
    sampleOutput: { type: String, required: true },
    visibleTests: { type: [testCaseSchema], default: [] },
    hiddenTests: { type: [testCaseSchema], default: [] },
    source: { type: String, enum: ['curated', 'ai_generated'], default: 'curated' },
  },
  { timestamps: true },
)

questionSchema.index({ difficulty: 1, tags: 1 })
questionSchema.index({ title: 'text', description: 'text' })

export const QuestionEntity = mongoose.model<Question, QuestionModel>('Question', questionSchema)
