import axios from 'axios'
import { env } from '../../config/env'

export type SupportedLanguage = 'cpp' | 'python' | 'java' | 'javascript'

export interface JudgeResult {
  stdout?: string
  stderr?: string
  compileOutput?: string
  status: string
  timeMs: number
  memoryKb: number
}

const languageMap: Record<SupportedLanguage, number> = {
  cpp: 54,
  python: 71,
  java: 62,
  javascript: 63,
}

function normalizeOutput(output?: string | null): string {
  return (output ?? '').replace(/\r\n/g, '\n').trim()
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (env.JUDGE0_API_KEY) {
    headers['X-RapidAPI-Key'] = env.JUDGE0_API_KEY
    if (env.JUDGE0_API_URL) {
      const host = new URL(env.JUDGE0_API_URL).host
      headers['X-RapidAPI-Host'] = host
    }
  }

  return headers
}

export async function executeWithJudge0(params: {
  code: string
  language: SupportedLanguage
  stdin: string
}): Promise<JudgeResult> {
  if (!env.JUDGE0_API_URL) {
    return {
      stdout: '',
      stderr: 'Judge0 API not configured',
      compileOutput: '',
      status: 'Configuration Error',
      timeMs: 0,
      memoryKb: 0,
    }
  }

  const response = await axios.post(
    `${env.JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
    {
      source_code: params.code,
      language_id: languageMap[params.language],
      stdin: params.stdin,
    },
    { headers: buildHeaders(), timeout: 25_000 },
  )

  const data = response.data as {
    stdout?: string | null
    stderr?: string | null
    compile_output?: string | null
    status?: { description?: string | null }
    time?: string | null
    memory?: number | null
  }

  const seconds = Number(data.time ?? 0)
  const ms = Number.isFinite(seconds) ? Math.round(seconds * 1000) : 0

  return {
    stdout: normalizeOutput(data.stdout),
    stderr: normalizeOutput(data.stderr),
    compileOutput: normalizeOutput(data.compile_output),
    status: data.status?.description ?? 'Unknown',
    timeMs: ms,
    memoryKb: data.memory ?? 0,
  }
}
