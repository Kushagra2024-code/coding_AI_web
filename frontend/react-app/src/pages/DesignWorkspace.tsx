import { useEffect, useMemo, useState } from 'react'
import {
  evaluateSystemDesign,
  fetchDesignQuestions,
  fetchDesignRefactor,
} from '../api/coding'
import { DesignEvaluationPanel } from '../components/design/DesignEvaluationPanel'
import { DrawboardCanvas } from '../components/design/DrawboardCanvas'
import { Toolbox } from '../components/design/Toolbox'
import Layout from '../components/common/Layout'
import type {
  DesignEvaluation,
  DesignQuestion,
  DesignRefactor,
  DiagramEdge,
  DiagramNode,
  DiagramNodeType,
} from '../types/api'

function createDefaultNode(type: DiagramNodeType, index: number): DiagramNode {
  const getLabel = () => {
    switch(type) {
      case 'database': return 'Database'
      case 'cache': return 'Redis/Memcached'
      case 'load_balancer': return 'Nginx/ALB'
      case 'queue': return 'Kafka/RabbitMQ'
      case 'client': return 'Mobile/Web Client'
      case 'external_api': return 'Stripe/AWS API'
      case 'cloud_storage': return 'S3 Bucket'
      case 'text': return 'Note'
      default: return 'Service'
    }
  }
  return {
    id: `node_${Date.now().toString(36)}_${index}`,
    type,
    x: 40 + (index % 4) * 200,
    y: 40 + Math.floor(index / 4) * 140,
    width: type === 'text' ? 180 : 160,
    height: 80,
    label: `${getLabel()} ${index + 1}`,
  }
}

export default function DesignWorkspace() {
  const [designQuestions, setDesignQuestions] = useState<DesignQuestion[]>([])
  const [selectedDesignQuestionId, setSelectedDesignQuestionId] = useState<string | null>(null)
  
  const [designNodes, setDesignNodes] = useState<DiagramNode[]>([])
  const [designEdges, setDesignEdges] = useState<DiagramEdge[]>([])
  const [architectureText, setArchitectureText] = useState('')
  const [designEvaluation, setDesignEvaluation] = useState<DesignEvaluation | null>(null)
  const [designRefactor, setDesignRefactor] = useState<DesignRefactor | null>(null)
  const [evaluatingDesign, setEvaluatingDesign] = useState(false)
  const [refactoringDesign, setRefactoringDesign] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timer, setTimer] = useState(0)
  const [percentile, setPercentile] = useState<number | null>(null)

  const selectedDesignQuestion = useMemo(
    () => designQuestions.find((q) => q.id === selectedDesignQuestionId) ?? null,
    [designQuestions, selectedDesignQuestionId],
  )

  useEffect(() => {
    setLoading(true)
    fetchDesignQuestions()
      .then((questions) => {
        setDesignQuestions(questions)
        if (questions.length > 0) {
          setSelectedDesignQuestionId(questions[0].id)
        }
      })
      .catch(() => setError('Failed to load system design questions.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((p) => p + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const addDesignNode = (type: DiagramNodeType) => {
    setDesignNodes((prev) => [...prev, createDefaultNode(type, prev.length)])
  }

  const connectLastTwo = () => {
    setDesignEdges((prev) => {
      if (designNodes.length < 2) return prev
      const last = designNodes[designNodes.length - 1]
      const prevNode = designNodes[designNodes.length - 2]
      return [...prev, { id: `edge_${Date.now().toString(36)}_${prev.length}`, from: prevNode.id, to: last.id, label: 'flow' }]
    })
  }

  const moveNode = (id: string, x: number, y: number) => {
    setDesignNodes((prev) => prev.map((node) => node.id === id ? { ...node, x: Math.max(0, x), y: Math.max(0, y) } : node))
  }

  const editNodeLabel = (id: string, label: string) => {
    setDesignNodes((prev) => prev.map((node) => node.id === id ? { ...node, label } : node))
  }

  const clearDiagram = () => {
    setDesignNodes([])
    setDesignEdges([])
  }

  const handleEvaluateDesign = async () => {
    if (!selectedDesignQuestion || !architectureText.trim()) return
    setEvaluatingDesign(true)
    try {
      const response = await evaluateSystemDesign({
        questionTitle: selectedDesignQuestion.title,
        architectureText,
        timerSeconds: timer,
        diagram: {
          nodes: designNodes,
          edges: designEdges,
        },
      })
      setDesignEvaluation(response.evaluation)
      setPercentile(response.percentile)
    } finally {
      setEvaluatingDesign(false)
    }
  }

  const handleDesignRefactor = async () => {
    if (!selectedDesignQuestion || !architectureText.trim()) return
    setRefactoringDesign(true)
    try {
      const refactor = await fetchDesignRefactor({
        questionTitle: selectedDesignQuestion.title,
        architectureText,
      })
      setDesignRefactor(refactor)
    } finally {
      setRefactoringDesign(false)
    }
  }

  return (
    <Layout>
      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        <aside className="space-y-6">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 px-1">Design Catalog</h2>
            <div className="space-y-2">
              {designQuestions.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setSelectedDesignQuestionId(q.id)}
                  className={`w-full group rounded-2xl border p-4 text-left transition-all ${
                    selectedDesignQuestionId === q.id
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : 'border-slate-800 bg-slate-900/30 hover:bg-slate-800/50'
                  }`}
                >
                  <p className={`text-sm font-bold ${selectedDesignQuestionId === q.id ? 'text-emerald-400' : 'text-slate-200'}`}>{q.title}</p>
                  <p className="mt-2 text-[10px] text-slate-500 font-mono uppercase tracking-wider">{q.focusAreas.join(' • ')}</p>
                </button>
              ))}
            </div>
          </section>
          <Toolbox onAddNode={addDesignNode} onConnectLastTwo={connectLastTwo} onClear={clearDiagram} />
        </aside>

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white tracking-tight">{selectedDesignQuestion?.title ?? 'Architecture Studio'}</h2>
            <p className="mt-3 text-slate-400 leading-relaxed font-medium">{selectedDesignQuestion?.description ?? 'Select a design challenge to start.'}</p>
            {loading && <p className="mt-2 text-xs text-emerald-400 animate-pulse">Syncing design catalog...</p>}
            {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
          </section>

          <DrawboardCanvas nodes={designNodes} edges={designEdges} onMoveNode={moveNode} onEditNodeLabel={editNodeLabel} />

          <DesignEvaluationPanel
            architectureText={architectureText}
            onArchitectureTextChange={setArchitectureText}
            onEvaluate={handleEvaluateDesign}
            evaluating={evaluatingDesign}
            evaluation={designEvaluation}
            refactor={designRefactor}
            onRefactor={handleDesignRefactor}
            refactoring={refactoringDesign}
            percentile={percentile}
            timerSeconds={timer}
            disabled={!selectedDesignQuestion || !architectureText.trim()}
          />
        </div>
      </div>
    </Layout>
  )
}
