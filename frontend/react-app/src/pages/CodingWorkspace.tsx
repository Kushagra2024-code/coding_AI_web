import { useEffect, useMemo, useState } from 'react'
import {
  askInterviewer,
  fetchQuestion,
  fetchQuestions,
  generateAiFeedback,
  generateAiQuestion,
  runCode,
} from '../api/coding'
import { EditorPanel } from '../components/coding/EditorPanel'
import { ExecutionPanel } from '../components/coding/ExecutionPanel'
import { FeedbackPanel } from '../components/coding/FeedbackPanel'
import { InterviewerPanel } from '../components/coding/InterviewerPanel'
import { QuestionPanel } from '../components/coding/QuestionPanel'
import { QuestionSidebar } from '../components/coding/QuestionSidebar'
import Layout from '../components/common/Layout'
import type {
  CodeFeedback,
  QuestionDetail,
  QuestionListItem,
  SubmitCodeResponse,
  SupportedLanguage,
} from '../types/api'

const starterCode: Record<SupportedLanguage, string> = {
  cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  // write solution\n  return 0;\n}\n',
  python: 'def solve():\n    # write solution\n    pass\n\nif __name__ == "__main__":\n    solve()\n',
  java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // write solution\n    }\n}\n',
  javascript:
    "function solve(input) {\n  // write solution\n  return '';\n}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8');\nprocess.stdout.write(String(solve(input)));\n",
}

export default function CodingWorkspace() {
  const [questions, setQuestions] = useState<QuestionListItem[]>([])
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  const [questionDetail, setQuestionDetail] = useState<QuestionDetail | null>(null)

  const [language, setLanguage] = useState<SupportedLanguage>('cpp')
  const [code, setCode] = useState(starterCode.cpp)
  const [result, setResult] = useState<SubmitCodeResponse | null>(null)
  const [feedback, setFeedback] = useState<CodeFeedback | null>(null)
  const [feedbackLoading, setFeedbackLoading] = useState(false)

  const [timer, setTimer] = useState(0)
  const [resetKey, setResetKey] = useState(0)
  const [candidateMessage, setCandidateMessage] = useState('')
  const [interviewerMessage, setInterviewerMessage] = useState<string | null>(null)
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null)
  const [focusArea, setFocusArea] = useState<string | null>(null)
  const [askingInterviewer, setAskingInterviewer] = useState(false)

  const [generatingQuestion, setGeneratingQuestion] = useState(false)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedQuestion = useMemo(
    () => questions.find((q) => q.id === selectedQuestionId) ?? null,
    [questions, selectedQuestionId],
  )

  useEffect(() => {
    fetchQuestions()
      .then((codingQuestions) => {
        setQuestions(codingQuestions)
        if (codingQuestions.length > 0) {
          setSelectedQuestionId(codingQuestions[0].id)
        }
      })
      .catch(() => setError('Failed to load coding questions.'))
  }, [])

  useEffect(() => {
    if (!selectedQuestionId) return

    fetchQuestion(selectedQuestionId)
      .then((data) => {
        setQuestionDetail(data)
        setResult(null)
        setFeedback(null)
        setTimer(0)
        setCandidateMessage('')
        setInterviewerMessage(null)
        setFollowUpQuestion(null)
        setFocusArea(null)
      })
      .catch(() => setError('Failed to load question details.'))
  }, [selectedQuestionId])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleLanguageChange = (next: SupportedLanguage) => {
    setLanguage(next)
    setCode(starterCode[next])
  }

  const handleRunCode = async () => {
    if (!selectedQuestion) return
    setRunning(true)
    setError(null)
    try {
      const response = await runCode({ 
        questionId: selectedQuestion.id, 
        language, 
        code, 
        runOnly: true 
      })
      setResult(response)
      setFeedback(null)
    } catch {
      setError('Code execution failed.')
    } finally {
      setRunning(false)
    }
  }

  const handleSubmitCode = async () => {
    if (!selectedQuestion) return
    setRunning(true)
    setError(null)
    try {
      const response = await runCode({ 
        questionId: selectedQuestion.id, 
        language, 
        code, 
        runOnly: false,
        timerSeconds: timer
      })
      setResult(response)
      setFeedback(null)
      alert(`Submission successful! Score: ${response.correctnessScore}%`)
    } catch {
      setError('Code submission failed.')
    } finally {
      setRunning(false)
    }
  }

  const handleResetCode = () => {
    if (confirm('Are you sure you want to reset your code? This will clear all your current changes.')) {
      setCode(starterCode[language])
      setResetKey((prev) => prev + 1)
    }
  }

  const handleGenerateAiQuestion = async () => {
    setGeneratingQuestion(true)
    try {
      const nextDifficulty = selectedQuestion?.difficulty ?? 'medium'
      const nextTags = selectedQuestion?.tags ?? ['array']
      const { question } = await generateAiQuestion({ difficulty: nextDifficulty, tags: nextTags })
      setQuestions((prev) => [{ id: question.id, title: question.title, difficulty: question.difficulty, tags: question.tags, source: question.source }, ...prev])
      setSelectedQuestionId(question.id)
      setQuestionDetail(question)
    } catch {
      setError('AI generation failed.')
    } finally {
      setGeneratingQuestion(false)
    }
  }

  const handleGenerateFeedback = async () => {
    if (!result || !questionDetail) return
    setFeedbackLoading(true)
    try {
      const { feedback: aiFeedback } = await generateAiFeedback({
        problemTitle: questionDetail.title,
        code,
        language,
        correctnessScore: result.correctnessScore,
        efficiencyScore: result.efficiencyScore,
      })
      setFeedback(aiFeedback)
    } finally {
      setFeedbackLoading(false)
    }
  }

  const handleAskInterviewer = async () => {
    if (!questionDetail || !candidateMessage.trim()) return
    setAskingInterviewer(true)
    try {
      const { turn } = await askInterviewer({
        problemTitle: questionDetail.title,
        problemSummary: questionDetail.description,
        candidateMessage,
      })
      setInterviewerMessage(turn.interviewerMessage)
      setFollowUpQuestion(turn.followUpQuestion)
      setFocusArea(turn.focusArea)
    } finally {
      setAskingInterviewer(false)
    }
  }

  return (
    <Layout>
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <QuestionSidebar
          questions={questions}
          selectedId={selectedQuestionId}
          onSelect={setSelectedQuestionId}
          onGenerateAiQuestion={handleGenerateAiQuestion}
          generating={generatingQuestion}
        />

        <div className="space-y-6">
          <QuestionPanel question={questionDetail} />
          <EditorPanel
            key={`${language}-${resetKey}`}
            code={code}
            language={language}
            onCodeChange={setCode}
            onLanguageChange={handleLanguageChange}
            onRun={handleRunCode}
            onReset={handleResetCode}
            onSubmit={handleSubmitCode}
            running={running}
            timerSeconds={timer}
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
    </Layout>
  )
}
