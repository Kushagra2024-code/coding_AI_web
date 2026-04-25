export type Difficulty = 'easy' | 'medium' | 'hard'
export type SupportedLanguage = 'cpp' | 'python' | 'java' | 'javascript'

export interface UserProfile {
  id: string
  name: string
  email: string
  rating: number
}

export interface QuestionListItem {
  id: string
  title: string
  difficulty: Difficulty
  tags: string[]
  source: 'curated' | 'ai_generated'
}

export interface VisibleTestCase {
  input: string
  output: string
}

export interface QuestionDetail {
  id: string
  title: string
  difficulty: Difficulty
  tags: string[]
  description: string
  constraints: string[]
  sampleInput: string
  sampleOutput: string
  visibleTests: VisibleTestCase[]
  source: 'curated' | 'ai_generated'
}

export interface SubmitCodePayload {
  questionId: string
  code: string
  language: SupportedLanguage
}

export interface SubmitCodeResponse {
  questionId: string
  passedTests: number
  totalTests: number
  correctnessScore: number
  efficiencyScore: number
  execution: {
    stdout?: string
    stderr?: string
    compileOutput?: string
    status: string
    averageTimeMs: number
    memoryKb: number
  }
  testResults: Array<{
    index: number
    passed: boolean
    status: string
    stdout: string
    expected: string
  }>
}
