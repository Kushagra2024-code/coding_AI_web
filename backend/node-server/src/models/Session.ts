import mongoose, { HydratedDocument, Model, Schema, Types } from 'mongoose'

export type SessionType = 'coding' | 'oa' | 'system_design' | 'mixed'

export interface ScoreBreakdown {
  correctness: number
  efficiency: number
  codeQuality: number
  designQuality: number
}

export interface PracticeSession {
  userId: string
  type: SessionType
  startTime: Date
  endTime?: Date
  scoreBreakdown?: ScoreBreakdown
  overallScore?: number
  createdAt: Date
  updatedAt: Date
}

export type SessionDocument = HydratedDocument<PracticeSession>
export type SessionModel = Model<PracticeSession>

const scoreBreakdownSchema = new Schema<ScoreBreakdown>(
  {
    correctness: { type: Number, min: 0, max: 100, default: 0 },
    efficiency: { type: Number, min: 0, max: 100, default: 0 },
    codeQuality: { type: Number, min: 0, max: 100, default: 0 },
    designQuality: { type: Number, min: 0, max: 100, default: 0 },
  },
  { _id: false },
)

const sessionSchema = new Schema<PracticeSession, SessionModel>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['coding', 'oa', 'system_design', 'mixed'],
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
      required: false,
    },
    scoreBreakdown: {
      type: scoreBreakdownSchema,
      required: false,
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      required: false,
    },
  },
  {
    timestamps: true,
  },
)

sessionSchema.index({ userId: 1, startTime: -1 })

export const SessionEntity = mongoose.model<PracticeSession, SessionModel>('Session', sessionSchema)
