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

export interface RefactorSuggestion {
  improvedCode: string
  explanation: string
  changes: string[]
}

export interface DesignRefactor {
  suggestedFocus: string
  architecturalPatterns: string[]
  componentsToLink: string[]
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

  try {
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

    return await generateJson<GeneratedQuestion>(prompt)
  } catch (err) {
    console.warn('Gemini API failed, returning question fallback:', err)
    return {
      title: 'AI Fallback: Balanced Binary Tree',
      difficulty: params.difficulty,
      tags: params.tags.length ? params.tags : ['tree', 'recursion'],
      description: 'Given a binary tree, determine if it is height-balanced.',
      constraints: ['The number of nodes in the tree is in the range [0, 5000].', '-10^4 <= Node.val <= 10^4'],
      sampleInput: '[3,9,20,null,null,15,7]',
      sampleOutput: 'true',
      visibleTests: [{ input: '3\n9 20\nnull null 15 7', output: 'true' }],
      hiddenTests: [{ input: '1\n2\n2\n3 3\nnull null\n4 4', output: 'false' }],
    }
  }
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

  try {
    return await generateJson<CodeFeedback>(prompt)
  } catch (err) {
    if (env.NODE_ENV === 'development') {
      console.warn('Gemini API failed, returning code feedback fallback:', err)
      return {
        summary: 'Fallback review: focus on cleaner edge-case handling and tighter complexity. (Development Mock)',
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
    throw err
  }
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

  try {
    return await generateJson<InterviewResponse>(prompt)
  } catch (err) {
    if (env.NODE_ENV === 'development') {
      console.warn('Gemini API failed, returning interview fallback:', err)
      return {
        interviewerMessage:
          'Let us focus on your approach. Explain why your chosen data structure is optimal for this problem. (Development Mock)',
        followUpQuestion: 'What is the worst-case time complexity and can it be improved?',
        focusArea: 'complexity',
      }
    }
    throw err
  }
}

export async function evaluateSystemDesignWithAi(params: {
  questionTitle: string
  architectureText: string
  diagram: {
    nodes: Array<{ id: string; type: 'rectangle' | 'database' | 'text'; label: string }>
    edges: Array<{ id: string; from: string; to: string; label?: string }>
  }
}): Promise<DesignEvaluation> {
  if (!env.GEMINI_API_KEY) {
    return {
      score: 72,
      scalability: 74,
      faultTolerance: 68,
      databaseChoice: 76,
      cachingStrategy: 69,
      microservicesArchitecture: 73,
      missingComponents: ['Rate limiting layer', 'Disaster recovery strategy'],
      improvements: [
        'Add explicit cache invalidation strategy and TTL policy.',
        'Introduce queue-based decoupling for write-heavy components.',
        'Define failover strategy for stateful services and datastore replicas.',
      ],
      summary: 'Strong baseline architecture but needs deeper reliability and cache coherence planning.',
    }
  }

  const prompt = `You are a principal system design interviewer.
Return only valid JSON with this exact shape:
{
  "score": number,
  "scalability": number,
  "faultTolerance": number,
  "databaseChoice": number,
  "cachingStrategy": number,
  "microservicesArchitecture": number,
  "missingComponents": string[],
  "improvements": string[],
  "summary": string
}

Question: ${params.questionTitle}
Architecture Notes:
${params.architectureText}

Diagram nodes: ${params.diagram.nodes.map((n) => `${n.type}:${n.label}`).join(', ')}
Diagram edges: ${params.diagram.edges.map((e) => `${e.from}->${e.to}${e.label ? `(${e.label})` : ''}`).join(', ')}

Rules:
- All numeric scores must be integers in range [0,100].
- Provide 2-6 missing components.
- Provide 3-6 actionable improvements.
- No markdown and no text outside JSON.`

  try {
    return await generateJson<DesignEvaluation>(prompt)
  } catch (err) {
    if (env.NODE_ENV === 'development') {
      console.warn('Gemini API failed, returning design fallback:', err)
      return {
        score: 72,
        scalability: 74,
        faultTolerance: 68,
        databaseChoice: 76,
        cachingStrategy: 69,
        microservicesArchitecture: 73,
        missingComponents: ['Rate limiting layer', 'Disaster recovery strategy'],
        improvements: [
          'Add explicit cache invalidation strategy and TTL policy.',
          'Introduce queue-based decoupling for write-heavy components.',
          'Define failover strategy for stateful services and datastore replicas.',
        ],
        summary: 'Strong baseline architecture but needs deeper reliability and cache coherence planning. (Development Mock Output)',
      }
    }
    throw err
  }
}

export async function generateRefactoredCodeWithAi(params: {
  problemTitle: string
  code: string
  language: string
}): Promise<RefactorSuggestion> {
  if (!env.GEMINI_API_KEY) {
    return {
      improvedCode: params.code + '\n// This is a mock refactor\n// Use cleaner variable names\n// Optimized loop logic',
      explanation: 'Refactoring focuses on readability and slight performance gains.',
      changes: ['Renamed variables', 'Removed redundant checks'],
    }
  }

  const prompt = `You are a world-class software engineer.
Return only valid JSON with this exact shape:
{
  "improvedCode": string,
  "explanation": string,
  "changes": string[]
}

Problem: ${params.problemTitle}
Language: ${params.language}
Current Code:
${params.code}

Rules:
- improvedCode must be a complete, runnable version of the code.
- Focus on clean code, optimal complexity, and idiomatic ${params.language}.
- Keep explanation concise.
- No markdown, no extra text.`

  try {
    return await generateJson<RefactorSuggestion>(prompt)
  } catch (err) {
    return {
      improvedCode: params.code,
      explanation: 'Could not generate refactor at this time.',
      changes: [],
    }
  }
}

export async function suggestDesignImprovements(params: {
  questionTitle: string
  architectureText: string
}): Promise<DesignRefactor> {
  if (!env.GEMINI_API_KEY) {
    return {
      suggestedFocus: 'High Availability',
      architecturalPatterns: ['Sidecar Pattern', 'CQRS'],
      componentsToLink: ['API Gateway -> Auth Service', 'Database -> Read Replica'],
    }
  }

  const prompt = `You are a senior system design architect.
Return only valid JSON with this exact shape:
{
  "suggestedFocus": string,
  "architecturalPatterns": string[],
  "componentsToLink": string[]
}

Question: ${params.questionTitle}
Current Architecture:
${params.architectureText}

Rules:
- Provide 2-3 specific architectural patterns.
- Suggest 2-3 missing component connections.
- Keep output strictly JSON.`

  try {
    return await generateJson<DesignRefactor>(prompt)
  } catch (err) {
    return {
      suggestedFocus: 'Standard Scaling',
      architecturalPatterns: [],
      componentsToLink: [],
    }
  }
}
