import mongoose, { Schema, Document } from 'mongoose'

export interface DesignQuestion extends Document {
  title: string
  description: string
  focusAreas: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  createdAt: Date
}

const DesignQuestionSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  focusAreas: { type: [String], default: [] },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  createdAt: { type: Date, default: Date.now },
})

export const DesignQuestionEntity = mongoose.model<DesignQuestion>('DesignQuestion', DesignQuestionSchema)
