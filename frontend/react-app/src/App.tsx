import { useEffect, useMemo, useState } from 'react'
import {
  askInterviewer,
  evaluateSystemDesign,
  fetchDesignQuestions,
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
import { DesignEvaluationPanel } from './components/design/DesignEvaluationPanel'
import { DrawboardCanvas } from './components/design/DrawboardCanvas'
import { Toolbox } from './components/design/Toolbox'
import { useAuthStore } from './store/authStore'
import type {
  CodeFeedback,
  DesignEvaluation,
  DesignQuestion,
  DiagramEdge,
  DiagramNode,
  DiagramNodeType,
  QuestionDetail,
  QuestionListItem,
  SubmitCodeResponse,
  SupportedLanguage,
} from './types/api'

type WorkspaceMode = 'coding' | 'design'

const starterCode: Record<SupportedLanguage, string> = {
  cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  // write solution\n  return 0;\n}\n',
  python: 'def solve():\n    # write solution\n    pass\n\nif __name__ == "__main__":\n    solve()\n',
  java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // write solution\n    }\n}\n',
  javascript:
    "function solve(input) {\n  // write solution\n  return '';\n}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8');\nprocess.stdout.write(String(solve(input)));\n",
}

function createDefaultNode(type: DiagramNodeType, index: number): DiagramNode {
  const baseLabel = type === 'database' ? 'DB' : type === 'text' ? 'Note' : 'Service'
  return {
    id: `node_${Date.now().toString(36)}_${index}`,
    type,
    x: 40 + (index % 4) * 180,
    y: 40 + Math.floor(index / 4) * 120,
    width: type === 'text' ? 180 : 150,
    height: 70,
    label: `${baseLabel} ${index + 1}`,
  }
}

function App() {
  const { token, setAuth, logout, user } = useAuthStore()

  const [mode, setMode] = useState<WorkspaceMode>('coding')

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

  const [designQuestions, setDesignQuestions] = useState<DesignQuestion[]>([])
  const [selectedDesignQuestionId, setSelectedDesignQuestionId] = useState<string | null>(null)
  const [designNodes, setDesignNodes] = useState<DiagramNode[]>([])
  const [designEdges, setDesignEdges] = useState<DiagramEdge[]>([])
  const [architectureText, setArchitectureText] = useState('')
  const [designEvaluation, setDesignEvaluation] = useState<DesignEvaluation | null>(null)
  const [evaluatingDesign, setEvaluatingDesign] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const selectedQuestion = useMemo(
    () => questions.find((q) => q.id === selectedQuestionId) ?? null,
    [questions, selectedQuestionId],
  )

  const selectedDesignQuestion = useMemo(
    () => designQuestions.find((q) => q.id === selectedDesignQuestionId) ?? null,
    [designQuestions, selectedDesignQuestionId],
  )

  useEffect(() => {
    if (!token) return

    setLoading(true)

    Promise.all([fetchQuestions(), fetchDesignQuestions()])
      .then(([codingQuestions, systemDesignQuestions]) => {
        setQuestions(codingQuestions)
        if (codingQuestions.length > 0) {
          setSelectedQuestionId(codingQuestions[0].id)
        }

        setDesignQuestions(systemDesignQuestions)
        if (systemDesignQuestions.length > 0) {
          setSelectedDesignQuestionId(systemDesignQuestions[0].id)
        }
      })
      .catch(() => setError('Failed to load workspace content. Ensure backend is running.'))
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
      setMode('coding')
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

  const addDesignNode = (type: DiagramNodeType) => {
    setDesignNodes((prev) => [...prev, createDefaultNode(type, prev.length)])
  }

  const connectLastTwo = () => {
    setDesignEdges((prev) => {
      if (designNodes.length < 2) return prev

      const last = designNodes[designNodes.length - 1]
      const prevNode = designNodes[designNodes.length - 2]
      const edgeId = `edge_${Date.now().toString(36)}_${prev.length}`

      return [
        ...prev,
        {
          id: edgeId,
          from: prevNode.id,
          to: last.id,
          label: 'flow',
        },
      ]
    })
  }

  const moveNode = (id: string, x: number, y: number) => {
    setDesignNodes((prev) =>
      prev.map((node) => {
        if (node.id !== id) return node
        return {
          ...node,
          x: Math.max(0, x),
          y: Math.max(0, y),
        }
      }),
    )
  }

  const editNodeLabel = (id: string, label: string) => {
    setDesignNodes((prev) => prev.map((node) => (node.id === id ? { ...node, label } : node)))
  }

  const clearDiagram = () => {
    setDesignNodes([])
    setDesignEdges([])
  }

  const handleEvaluateDesign = async () => {
    if (!selectedDesignQuestion) {
      setError('Select a system design problem first.')
      return
    }

    if (!architectureText.trim()) {
      setError('Provide architecture explanation before evaluation.')
      return
    }

    setEvaluatingDesign(true)
    setError(null)

    try {
      const { evaluation } = await evaluateSystemDesign({
        questionTitle: selectedDesignQuestion.title,
        architectureText,
        diagram: {
          nodes: designNodes,
          edges: designEdges,
        },
      })

      setDesignEvaluation(evaluation)
    } catch {
      setError('System design evaluation failed. Check Gemini configuration.')
    } finally {
      setEvaluatingDesign(false)
    }
  }

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
        <section className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
          <p className="inline-flex rounded-full border border-emerald-400/50 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Phase 4 MVP
          </p>
          <h1 className="mt-4 text-4xl font-bold text-white">AI OA Practice</h1>
          <p className="mt-3 text-sm text-slate-300">
            Coding + system design workspace is ready. Use demo login to enter the interview simulator.
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
      <div className="mx-auto max-w-[1500px] px-4 py-6 md:px-8">
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

        <div className="mb-4 flex gap-2">
          <TabButton active={mode === 'coding'} label="Coding Workspace" onClick={() => setMode('coding')} />
          <TabButton active={mode === 'design'} label="System Design" onClick={() => setMode('design')} />
        </div>

        {loading ? <p className="mb-4 text-sm text-slate-400">Loading workspace...</p> : null}
        {error ? <p className="mb-4 text-sm text-rose-300">{error}</p> : null}

        {mode === 'coding' ? (
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
        ) : (
          <div className="grid gap-4 xl:grid-cols-[300px_1fr]">
            <aside className="space-y-4">
              <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Design Problems</h2>
                <div className="mt-3 space-y-2">
                  {designQuestions.map((question) => (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => setSelectedDesignQuestionId(question.id)}
                      className={`w-full rounded-lg border p-3 text-left ${
                        selectedDesignQuestionId === question.id
                          ? 'border-indigo-400/70 bg-indigo-500/10'
                          : 'border-slate-700 bg-slate-950/50 hover:border-slate-500'
                      }`}
                    >
                      <p className="text-sm font-semibold text-slate-100">{question.title}</p>
                      <p className="mt-2 text-xs text-slate-400">{question.focusAreas.join(', ')}</p>
                    </button>
                  ))}
                </div>
              </section>

              <Toolbox onAddNode={addDesignNode} onConnectLastTwo={connectLastTwo} onClear={clearDiagram} />
            </aside>

            <div className="space-y-4">
              <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <h2 className="text-xl font-semibold text-white">{selectedDesignQuestion?.title ?? 'System Design'}</h2>
                <p className="mt-2 text-sm text-slate-300">{selectedDesignQuestion?.description ?? 'Select a design question.'}</p>
              </section>

              <DrawboardCanvas
                nodes={designNodes}
                edges={designEdges}
                onMoveNode={moveNode}
                onEditNodeLabel={editNodeLabel}
              />

              <DesignEvaluationPanel
                architectureText={architectureText}
                onArchitectureTextChange={setArchitectureText}
                onEvaluate={handleEvaluateDesign}
                evaluating={evaluatingDesign}
                evaluation={designEvaluation}
                disabled={!selectedDesignQuestion}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function TabButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-3 py-2 text-sm font-semibold ${
        active
          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200'
          : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'
      }`}
    >
      {label}
    </button>
  )
}

export default App
