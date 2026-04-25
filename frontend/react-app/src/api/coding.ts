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
