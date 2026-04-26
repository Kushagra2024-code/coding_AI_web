import mongoose, { HydratedDocument, Model, Schema, Types } from 'mongoose'

export interface DiagramNode {
  id: string
  type: 'rectangle' | 'database' | 'text'
  x: number
  y: number
  width: number
  height: number
  label: string
}

export interface DiagramEdge {
  id: string
  from: string
  to: string
  label?: string
}

export interface DesignEvaluation {
  score: number
  scalability: number
  faultTolerance: number
  databaseChoice: number
  cachingStrategy: number
  microservicesArchitecture: number
  missingComponents: string[]
  improvements: string[]
  summary: string
}

export interface DesignSubmission {
  userId: string
  sessionId?: string
  questionTitle: string
  architectureText: string
  diagram: {
    nodes: DiagramNode[]
    edges: DiagramEdge[]
  }
  evaluation: DesignEvaluation
  createdAt: Date
  updatedAt: Date
}

export type DesignSubmissionDocument = HydratedDocument<DesignSubmission>
export type DesignSubmissionModel = Model<DesignSubmission>

const nodeSchema = new Schema<DiagramNode>(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ['rectangle', 'database', 'text'], required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    label: { type: String, required: true },
  },
  { _id: false },
)

const edgeSchema = new Schema<DiagramEdge>(
  {
    id: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    label: { type: String, required: false },
  },
  { _id: false },
)

const evaluationSchema = new Schema<DesignEvaluation>(
  {
    score: { type: Number, required: true, min: 0, max: 100 },
    scalability: { type: Number, required: true, min: 0, max: 100 },
    faultTolerance: { type: Number, required: true, min: 0, max: 100 },
    databaseChoice: { type: Number, required: true, min: 0, max: 100 },
    cachingStrategy: { type: Number, required: true, min: 0, max: 100 },
    microservicesArchitecture: { type: Number, required: true, min: 0, max: 100 },
    missingComponents: [{ type: String }],
    improvements: [{ type: String }],
    summary: { type: String, required: true },
  },
  { _id: false },
)

const designSubmissionSchema = new Schema<DesignSubmission, DesignSubmissionModel>(
  {
    userId: { type: String, required: true, index: true },
    sessionId: { type: String, required: false, index: true },
    questionTitle: { type: String, required: true, trim: true },
    architectureText: { type: String, required: true },
    diagram: {
      type: {
        nodes: { type: [nodeSchema], default: [] },
        edges: { type: [edgeSchema], default: [] },
      },
      required: true,
    },
    evaluation: { type: evaluationSchema, required: true },
  },
  { timestamps: true },
)

designSubmissionSchema.index({ userId: 1, createdAt: -1 })

export const DesignSubmissionEntity = mongoose.model<DesignSubmission, DesignSubmissionModel>(
  'DesignSubmission',
  designSubmissionSchema,
)
