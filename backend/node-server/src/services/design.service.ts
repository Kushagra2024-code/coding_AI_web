import { isDatabaseReady } from '../config/db'
import { DesignQuestionEntity, DesignQuestion as DesignQuestionType } from '../models/DesignQuestion'

export interface DesignQuestion {
  id: string
  title: string
  description: string
  focusAreas: string[]
}

const fallbackDesignQuestions: DesignQuestion[] = [
  {
    id: 'design-twitter',
    title: 'Design Twitter (Local)',
    description:
      'Design a social feed service supporting tweets, follow relationships, fan-out timelines, and real-time updates.',
    focusAreas: ['feed generation', 'caching', 'partitioning', 'event streaming'],
  },
]

export async function listDesignQuestions(): Promise<DesignQuestion[]> {
  if (!isDatabaseReady()) {
    return fallbackDesignQuestions
  }

  const questions = await DesignQuestionEntity.find().sort({ createdAt: -1 }).lean()
  return questions.map((q) => ({
    id: q._id.toString(),
    title: q.title,
    description: q.description,
    focusAreas: q.focusAreas,
  }))
}
