import mongoose, { HydratedDocument, Model, Schema, Types } from 'mongoose'

export type CheatingSignalType =
  | 'aggregate'
  | 'tab_switch'
  | 'window_blur'
  | 'large_paste'
  | 'fast_solution'
  | 'code_similarity'

export interface CheatingEvent {
  userId: Types.ObjectId
  sessionId?: Types.ObjectId
  signalType: CheatingSignalType
  metadata: Record<string, unknown>
  riskScore: number
  timestamp: Date
  createdAt: Date
  updatedAt: Date
}

export type CheatingEventDocument = HydratedDocument<CheatingEvent>
export type CheatingEventModel = Model<CheatingEvent>

const cheatingEventSchema = new Schema<CheatingEvent, CheatingEventModel>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    sessionId: { type: Schema.Types.ObjectId, required: false, ref: 'Session', index: true },
    signalType: {
      type: String,
      enum: ['aggregate', 'tab_switch', 'window_blur', 'large_paste', 'fast_solution', 'code_similarity'],
      required: true,
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
    riskScore: { type: Number, required: true, min: 0, max: 100 },
    timestamp: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true },
)

cheatingEventSchema.index({ sessionId: 1, timestamp: -1 })

export const CheatingEventEntity = mongoose.model<CheatingEvent, CheatingEventModel>(
  'CheatingEvent',
  cheatingEventSchema,
)
