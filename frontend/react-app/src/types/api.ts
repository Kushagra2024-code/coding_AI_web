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

export interface TestCase {
  input: string
  output: string
}

export type VisibleTestCase = TestCase

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
  runOnly?: boolean
  timerSeconds?: number
}

export interface SubmitCodeResponse {
  questionId: string
  passedTests: number
  totalTests: number
  correctnessScore: number
  efficiencyScore: number
  isSubmission?: boolean
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

export interface GenerateQuestionPayload {
  difficulty: Difficulty
  tags: string[]
}

export interface GeneratedQuestionResponse {
  question: QuestionDetail
}

export interface GenerateFeedbackPayload {
  problemTitle: string
  code: string
  language: SupportedLanguage
  correctnessScore: number
  efficiencyScore: number
}

export interface CodeFeedback {
  summary: string
  timeComplexity: string
  memoryComplexity: string
  readabilityScore: number
  edgeCaseScore: number
  suggestions: string[]
}

export interface GenerateFeedbackResponse {
  feedback: CodeFeedback
}

export interface InterviewTurnPayload {
  problemTitle: string
  problemSummary: string
  candidateMessage: string
}

export interface InterviewTurnResponse {
  turn: {
    interviewerMessage: string
    followUpQuestion: string
    focusArea: string
  }
}

export interface DesignQuestion {
  id: string
  title: string
  description: string
  focusAreas: string[]
}

export type DiagramNodeType = 'rectangle' | 'database' | 'text'

export interface DiagramNode {
  id: string
  type: DiagramNodeType
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

export interface DesignEvaluationPayload {
  sessionId?: string
  questionTitle: string
  architectureText: string
  diagram: {
    nodes: DiagramNode[]
    edges: DiagramEdge[]
  }
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

export interface EvaluateDesignResponse {
  evaluation: DesignEvaluation
}

export interface CheatingSignals {
  tabSwitchCount: number
  windowBlurCount: number
  pasteChars: number
  solveTimeSeconds?: number
  similarityScore?: number
}

export interface DetectCheatingResponse {
  sessionId: string | null
  riskScore: number
  severity: 'low' | 'medium' | 'high'
  flags: string[]
}

export interface AnalyticsSummary {
  totalSessions: number
  totalSubmissions: number
  avgOverallScore: number
}

export interface TopicStrength {
  tag: string
  averageCorrectness: number
  averageEfficiency: number
  count: number
}

export interface RecentActivityItem {
  type: 'coding' | 'design'
  id: string
  timestamp: string
  score: number
  label: string
}

export interface AnalyticsResponse {
  summary: AnalyticsSummary
  topicStrengths: TopicStrength[]
  recentActivity: RecentActivityItem[]
  history: {
    sessions: any[]
  }
}
