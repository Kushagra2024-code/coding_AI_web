import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '../../config/env'

export interface GeneratedQuestion {
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  description: string
  constraints: string[]
  sampleInput: string
  sampleOutput: string
  visibleTests: Array<{ input: string; output: string }>
  hiddenTests: Array<{ input: string; output: string }>
}

export interface CodeFeedback {
  summary: string
  timeComplexity: string
  memoryComplexity: string
  readabilityScore: number
  edgeCaseScore: number
  suggestions: string[]
}

export interface InterviewResponse {
  interviewerMessage: string
  followUpQuestion: string
  focusArea: string
}

function extractJsonObject(text: string): string {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i)
  if (fenced?.[1]) {
    return fenced[1].trim()
  }

  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1)
  }

  throw new Error('No JSON object found in Gemini response')
}

async function generateJson<T>(prompt: string): Promise<T> {
  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL })

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  const jsonPayload = extractJsonObject(text)
  return JSON.parse(jsonPayload) as T
}

export async function generateCodingQuestionWithAi(params: {
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
}): Promise<GeneratedQuestion> {
  if (!env.GEMINI_API_KEY) {
    return {
      title: 'AI Fallback: Array Rotation Check',
      difficulty: params.difficulty,
      tags: params.tags.length ? params.tags : ['array'],
      description:
        'Given an array, determine if it can become non-decreasing by rotating it any number of positions.',
      constraints: ['1 <= n <= 2e5', '-1e9 <= a[i] <= 1e9'],
      sampleInput: '5\n3 4 5 1 2\n',
      sampleOutput: 'true',
      visibleTests: [
        { input: '5\n3 4 5 1 2\n', output: 'true' },
        { input: '4\n3 1 2 0\n', output: 'false' },
      ],
      hiddenTests: [{ input: '3\n1 2 3\n', output: 'true' }],
    }
  }

  const prompt = `You are an expert competitive-programming setter.
Return only valid JSON with this exact shape:
{
  "title": string,
  "difficulty": "easy" | "medium" | "hard",
  "tags": string[],
  "description": string,
  "constraints": string[],
  "sampleInput": string,
  "sampleOutput": string,
  "visibleTests": [{"input": string, "output": string}],
  "hiddenTests": [{"input": string, "output": string}]
}

Generate one original coding problem.
Difficulty: ${params.difficulty}
Preferred tags: ${params.tags.join(', ') || 'general'}
Requirements:
- At least 2 visible tests and at least 1 hidden test.
- Keep sample I/O concise.
- Hidden tests must be non-trivial edge cases.
- No markdown, no explanation outside JSON.`

  return generateJson<GeneratedQuestion>(prompt)
}

export async function generateCodeFeedbackWithAi(params: {
  problemTitle: string
  code: string
  language: string
  correctnessScore: number
  efficiencyScore: number
}): Promise<CodeFeedback> {
  if (!env.GEMINI_API_KEY) {
    return {
      summary: 'Fallback review: focus on cleaner edge-case handling and tighter complexity.',
      timeComplexity: 'Likely O(n log n) or worse depending on implementation details.',
      memoryComplexity: 'Likely O(n).',
      readabilityScore: 72,
      edgeCaseScore: 65,
      suggestions: [
        'Add explicit handling for empty or single-element inputs.',
        'Use descriptive variable names for interviewer readability.',
        'Document complexity trade-offs in brief comments.',
      ],
    }
  }

  const prompt = `You are a senior interview coach reviewing candidate code.
Return only valid JSON with this exact shape:
{
  "summary": string,
  "timeComplexity": string,
  "memoryComplexity": string,
  "readabilityScore": number,
  "edgeCaseScore": number,
  "suggestions": string[]
}

Problem: ${params.problemTitle}
Language: ${params.language}
Correctness score: ${params.correctnessScore}
Efficiency score: ${params.efficiencyScore}
Code:
${params.code}

Rules:
- readabilityScore and edgeCaseScore must be integers in range [0,100]
- suggestions length: 3 to 5
- no markdown, no text outside JSON.`

  return generateJson<CodeFeedback>(prompt)
}

export async function generateInterviewTurnWithAi(params: {
  problemTitle: string
  problemSummary: string
  candidateMessage: string
}): Promise<InterviewResponse> {
  if (!env.GEMINI_API_KEY) {
    return {
      interviewerMessage:
        'Let us focus on your approach. Explain why your chosen data structure is optimal for this problem.',
      followUpQuestion: 'What is the worst-case time complexity and can it be improved?',
      focusArea: 'complexity',
    }
  }

  const prompt = `You are an interviewer in a live coding interview.
Return only valid JSON with this exact shape:
{
  "interviewerMessage": string,
  "followUpQuestion": string,
  "focusArea": string
}

Problem title: ${params.problemTitle}
Problem summary: ${params.problemSummary}
Candidate message: ${params.candidateMessage}

Rules:
- Keep tone professional and concise.
- Ask one concrete follow-up question.
- focusArea should be one word (e.g., complexity, edge-cases, optimization, correctness).
- no markdown, no extra text.`

  return generateJson<InterviewResponse>(prompt)
}
