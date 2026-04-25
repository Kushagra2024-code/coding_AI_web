import { useEffect, useMemo, useState } from 'react'
import {
  askInterviewer,
  fetchQuestion,
  fetchQuestions,
  generateAiFeedback,
  generateAiQuestion,
  registerForDemo,
  runCode,
} from './api/coding'
import { EditorPanel } from './components/coding/EditorPanel'
import { ExecutionPanel } from './components/coding/ExecutionPanel'
import { FeedbackPanel } from './components/coding/FeedbackPanel'
import { InterviewerPanel } from './components/coding/InterviewerPanel'
import { QuestionPanel } from './components/coding/QuestionPanel'
import { QuestionSidebar } from './components/coding/QuestionSidebar'
import { useAuthStore } from './store/authStore'
import type {
  CodeFeedback,
  QuestionDetail,
  QuestionListItem,
  SubmitCodeResponse,
  SupportedLanguage,
} from './types/api'

const starterCode: Record<SupportedLanguage, string> = {
  cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  // write solution\n  return 0;\n}\n',
  python: 'def solve():\n    # write solution\n    pass\n\nif __name__ == "__main__":\n    solve()\n',
  java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // write solution\n    }\n}\n',
  javascript:
    "function solve(input) {\n  // write solution\n  return '';\n}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8');\nprocess.stdout.write(String(solve(input)));\n",
}

function App() {
  const { token, setAuth, logout, user } = useAuthStore()

  const [questions, setQuestions] = useState<QuestionListItem[]>([])
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  const [questionDetail, setQuestionDetail] = useState<QuestionDetail | null>(null)

  const [language, setLanguage] = useState<SupportedLanguage>('cpp')
  const [code, setCode] = useState(starterCode.cpp)
  const [result, setResult] = useState<SubmitCodeResponse | null>(null)
  const [feedback, setFeedback] = useState<CodeFeedback | null>(null)
  const [feedbackLoading, setFeedbackLoading] = useState(false)

  const [candidateMessage, setCandidateMessage] = useState('')
  const [interviewerMessage, setInterviewerMessage] = useState<string | null>(null)
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null)
  const [focusArea, setFocusArea] = useState<string | null>(null)
  const [askingInterviewer, setAskingInterviewer] = useState(false)

  const [generatingQuestion, setGeneratingQuestion] = useState(false)

  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const selectedQuestion = useMemo(
    () => questions.find((q) => q.id === selectedQuestionId) ?? null,
    [questions, selectedQuestionId],
  )

  useEffect(() => {
    if (!token) return

    setLoading(true)
    fetchQuestions()
      .then((items) => {
        setQuestions(items)
        if (items.length > 0) {
          setSelectedQuestionId(items[0].id)
        }
      })
      .catch(() => setError('Failed to load questions. Ensure backend is running.'))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    if (!selectedQuestionId || !token) return

    fetchQuestion(selectedQuestionId)
      .then((data) => {
        setQuestionDetail(data)
        setResult(null)
        setFeedback(null)
        setCandidateMessage('')
        setInterviewerMessage(null)
        setFollowUpQuestion(null)
        setFocusArea(null)
      })
      .catch(() => setError('Failed to load question details.'))
  }, [selectedQuestionId, token])

  const handleDemoLogin = async () => {
    setError(null)
    try {
      const data = await registerForDemo()
      setAuth(data.token, data.user)
    } catch {
      setError('Demo login failed. Verify API and DB connectivity.')
    }
  }

  const handleLanguageChange = (next: SupportedLanguage) => {
    setLanguage(next)
    setCode(starterCode[next])
  }

  const handleRunCode = async () => {
    if (!selectedQuestion) {
      setError('Select a question first.')
      return
    }

    setRunning(true)
    setError(null)

    try {
      const response = await runCode({
        questionId: selectedQuestion.id,
        language,
        code,
      })
      setResult(response)
      setFeedback(null)
    } catch {
      setError('Code execution failed. Check Judge0 configuration in backend .env.')
    } finally {
      setRunning(false)
    }
  }

  const handleGenerateAiQuestion = async () => {
    setGeneratingQuestion(true)
    setError(null)

    try {
      const nextDifficulty = selectedQuestion?.difficulty ?? 'medium'
      const nextTags = selectedQuestion?.tags ?? ['array']

      const { question } = await generateAiQuestion({
        difficulty: nextDifficulty,
        tags: nextTags,
      })

      const listItem: QuestionListItem = {
        id: question.id,
        title: question.title,
        difficulty: question.difficulty,
        tags: question.tags,
        source: question.source,
      }

      setQuestions((prev) => [listItem, ...prev])
      setSelectedQuestionId(question.id)
      setQuestionDetail(question)
    } catch {
      setError('AI question generation failed. Check Gemini configuration.')
    } finally {
      setGeneratingQuestion(false)
    }
  }

  const handleGenerateFeedback = async () => {
    if (!result || !questionDetail) {
      setError('Run code before requesting AI feedback.')
      return
    }

    setFeedbackLoading(true)
    setError(null)

    try {
      const { feedback: aiFeedback } = await generateAiFeedback({
        problemTitle: questionDetail.title,
        code,
        language,
        correctnessScore: result.correctnessScore,
        efficiencyScore: result.efficiencyScore,
      })

      setFeedback(aiFeedback)
    } catch {
      setError('AI feedback generation failed. Check Gemini configuration.')
    } finally {
      setFeedbackLoading(false)
    }
  }

  const handleAskInterviewer = async () => {
    if (!questionDetail || !candidateMessage.trim()) {
      setError('Provide your explanation before asking interviewer.')
      return
    }

    setAskingInterviewer(true)
    setError(null)

    try {
      const { turn } = await askInterviewer({
        problemTitle: questionDetail.title,
        problemSummary: questionDetail.description,
        candidateMessage,
      })

      setInterviewerMessage(turn.interviewerMessage)
      setFollowUpQuestion(turn.followUpQuestion)
      setFocusArea(turn.focusArea)
    } catch {
      setError('AI interviewer request failed. Check Gemini configuration.')
    } finally {
      setAskingInterviewer(false)
    }
  }

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
        <section className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
          <p className="inline-flex rounded-full border border-emerald-400/50 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Phase 3 MVP
          </p>
          <h1 className="mt-4 text-4xl font-bold text-white">AI OA Practice</h1>
          <p className="mt-3 text-sm text-slate-300">
            Coding workspace is ready. Use demo login to access question list and Monaco execution flow.
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="mt-6 rounded-lg border border-emerald-500 bg-emerald-500/20 px-5 py-2 font-semibold text-emerald-200 hover:bg-emerald-500/30"
          >
            Continue as Demo User
          </button>
          {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div>
            <h1 className="text-2xl font-bold text-white">AI OA Practice Workspace</h1>
            <p className="text-sm text-slate-300">
              Signed in as {user?.name} ({user?.email})
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
          >
            Logout
          </button>
        </header>

        {loading ? <p className="mb-4 text-sm text-slate-400">Loading questions...</p> : null}
        {error ? <p className="mb-4 text-sm text-rose-300">{error}</p> : null}

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <QuestionSidebar
            questions={questions}
            selectedId={selectedQuestionId}
            onSelect={setSelectedQuestionId}
            onGenerateAiQuestion={handleGenerateAiQuestion}
            generating={generatingQuestion}
          />

          <div className="space-y-4">
            <QuestionPanel question={questionDetail} />
            <EditorPanel
              code={code}
              language={language}
              onCodeChange={setCode}
              onLanguageChange={handleLanguageChange}
              onRun={handleRunCode}
              running={running}
            />
            <ExecutionPanel result={result} error={error} />
            <FeedbackPanel
              feedback={feedback}
              loading={feedbackLoading}
              onGenerate={handleGenerateFeedback}
              disabled={!result || !questionDetail}
            />
            <InterviewerPanel
              candidateMessage={candidateMessage}
              onCandidateMessageChange={setCandidateMessage}
              onAsk={handleAskInterviewer}
              asking={askingInterviewer}
              interviewerMessage={interviewerMessage}
              followUpQuestion={followUpQuestion}
              focusArea={focusArea}
            />
          </div>
        </div>
      </div>
    </main>
  )
}

export default App
