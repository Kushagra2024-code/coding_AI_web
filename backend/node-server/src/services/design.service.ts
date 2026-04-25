export interface DesignQuestion {
  id: string
  title: string
  description: string
  focusAreas: string[]
}

const fallbackDesignQuestions: DesignQuestion[] = [
  {
    id: 'design-twitter',
    title: 'Design Twitter',
    description:
      'Design a social feed service supporting tweets, follow relationships, fan-out timelines, and real-time updates.',
    focusAreas: ['feed generation', 'caching', 'partitioning', 'event streaming'],
  },
  {
    id: 'design-uber',
    title: 'Design Uber',
    description:
      'Design a ride-hailing platform with driver dispatch, ETA prediction, surge pricing, and location updates.',
    focusAreas: ['geo-indexing', 'matching', 'fault tolerance', 'real-time systems'],
  },
  {
    id: 'design-url-shortener',
    title: 'Design URL Shortener',
    description:
      'Design a URL shortener handling high write/read throughput, analytics tracking, and custom aliases.',
    focusAreas: ['id generation', 'storage', 'cache', 'abuse prevention'],
  },
]

export async function listDesignQuestions(): Promise<DesignQuestion[]> {
  return fallbackDesignQuestions
}
