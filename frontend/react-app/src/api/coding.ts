import { api } from './client'
import type {
  GenerateQuestionPayload,
  GeneratedQuestionResponse,
  GenerateFeedbackPayload,
  GenerateFeedbackResponse,
  InterviewTurnPayload,
  InterviewTurnResponse,
  DesignEvaluationPayload,
  EvaluateDesignResponse,
  DesignQuestion,
  QuestionDetail,
  QuestionListItem,
  SubmitCodePayload,
  SubmitCodeResponse,
  UserProfile,
  AnalyticsResponse,
  CheatingSignals,
  DetectCheatingResponse,
  RefactorSuggestion,
  DesignRefactor,
} from '../types/api'

export async function registerForDemo(): Promise<{ token: string; user: UserProfile }> {
  const random = Math.floor(Math.random() * 1_000_000)
  const payload = {
    name: `Demo User ${random}`,
    email: `demo${random}@ai-oa.dev`,
    password: 'DemoPass123!',
  }

  const { data } = await api.post<{ token: string; user: UserProfile }>('/auth/register', payload)
  return data
}

export async function loginDemo(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
  const { data } = await api.post<{ token: string; user: UserProfile }>('/auth/login', { email, password })
  return data
}

export async function fetchQuestions(): Promise<QuestionListItem[]> {
  const { data } = await api.get<{ questions: QuestionListItem[] }>('/questions')
  return data.questions
}

export async function fetchQuestion(questionId: string): Promise<QuestionDetail> {
  const { data } = await api.get<{ question: QuestionDetail }>(`/questions/${questionId}`)
  return data.question
}

export async function runCode(payload: SubmitCodePayload): Promise<SubmitCodeResponse> {
  const { data } = await api.post<SubmitCodeResponse>('/submit-code', payload)
  return data
}

export async function generateAiQuestion(payload: GenerateQuestionPayload): Promise<GeneratedQuestionResponse> {
  const { data } = await api.post<GeneratedQuestionResponse>('/generate-question', payload)
  return data
}

export async function generateAiFeedback(payload: GenerateFeedbackPayload): Promise<GenerateFeedbackResponse> {
  const { data } = await api.post<GenerateFeedbackResponse>('/generate-feedback', payload)
  return data
}

export async function askInterviewer(payload: InterviewTurnPayload): Promise<InterviewTurnResponse> {
  const { data } = await api.post<InterviewTurnResponse>('/interview/message', payload)
  return data
}

export async function fetchDesignQuestions(): Promise<DesignQuestion[]> {
  const { data } = await api.get<{ questions: DesignQuestion[] }>('/design/questions')
  return data.questions
}

export async function evaluateSystemDesign(payload: DesignEvaluationPayload): Promise<EvaluateDesignResponse> {
  const { data } = await api.post<EvaluateDesignResponse>('/evaluate-design', payload)
  return data
}

export async function fetchAnalytics(): Promise<AnalyticsResponse> {
  const { data } = await api.get<AnalyticsResponse>('/analytics')
  return data
}

export async function detectCheating(payload: {
  sessionId?: string
  signals: CheatingSignals
}): Promise<DetectCheatingResponse> {
  const { data } = await api.post<DetectCheatingResponse>('/detect-cheating', payload)
  return data
}

export async function createCodingQuestion(payload: Partial<QuestionDetail>): Promise<{ id: string; message: string }> {
  const { data } = await api.post<{ id: string; message: string }>('/questions', payload)
  return data
}

export async function fetchCodeRefactor(payload: {
  problemTitle: string
  code: string
  language: string
}): Promise<RefactorSuggestion> {
  const { data } = await api.post<{ refactor: RefactorSuggestion }>('/code-refactor', payload)
  return data.refactor
}

export async function fetchDesignRefactor(payload: {
  questionTitle: string
  architectureText: string
}): Promise<DesignRefactor> {
  const { data } = await api.post<{ refactor: DesignRefactor }>('/design-refactor', payload)
  return data.refactor
}

export async function startSession(): Promise<{ sessionId: string }> {
  const { data } = await api.post<{ sessionId: string }>('/sessions/start')
  return data
}

export async function endSession(payload: { sessionId: string }): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>('/sessions/end', payload)
  return data
}
