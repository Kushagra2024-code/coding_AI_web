import mongoose, { HydratedDocument, Model, Schema, Types } from 'mongoose'

export type SubmissionLanguage = 'cpp' | 'python' | 'java' | 'javascript'

export interface ExecutionResult {
  stdout?: string
  stderr?: string
  compileOutput?: string
  status: string
  timeMs: number
  memoryKb: number
}

export interface Submission {
  userId: Types.ObjectId
  sessionId?: Types.ObjectId
  questionId: Types.ObjectId
  code: string
  language: SubmissionLanguage
  passedTests: number
  totalTests: number
  correctnessScore: number
  efficiencyScore: number
  execution: ExecutionResult
  createdAt: Date
  updatedAt: Date
}

export type SubmissionDocument = HydratedDocument<Submission>
export type SubmissionModel = Model<Submission>

const executionSchema = new Schema<ExecutionResult>(
  {
    stdout: { type: String },
    stderr: { type: String },
    compileOutput: { type: String },
    status: { type: String, required: true },
    timeMs: { type: Number, required: true, min: 0 },
    memoryKb: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const submissionSchema = new Schema<Submission, SubmissionModel>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    sessionId: { type: Schema.Types.ObjectId, required: false, ref: 'Session', index: true },
    questionId: { type: Schema.Types.ObjectId, required: true, ref: 'Question', index: true },
    code: { type: String, required: true },
    language: { type: String, enum: ['cpp', 'python', 'java', 'javascript'], required: true },
    passedTests: { type: Number, required: true, min: 0 },
    totalTests: { type: Number, required: true, min: 1 },
    correctnessScore: { type: Number, required: true, min: 0, max: 100 },
    efficiencyScore: { type: Number, required: true, min: 0, max: 100 },
    execution: { type: executionSchema, required: true },
  },
  { timestamps: true },
)

submissionSchema.index({ userId: 1, createdAt: -1 })
submissionSchema.index({ questionId: 1, createdAt: -1 })

export const SubmissionEntity = mongoose.model<Submission, SubmissionModel>('Submission', submissionSchema)
