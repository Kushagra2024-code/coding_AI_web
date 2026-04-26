import { useState } from 'react'
import type { RefactorSuggestion } from '../../types/api'
import { Sparkles, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'

interface RefactorPanelProps {
  refactor: RefactorSuggestion | null
  loading: boolean
  onGenerate: () => void
  disabled: boolean
}

export function RefactorPanel({ refactor, loading, onGenerate, disabled }: RefactorPanelProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-sm transition-all hover:bg-slate-900/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">AI Refactor Suggestion</h3>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={disabled || loading}
          className="rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? 'Refining...' : 'Get Refactored Version'}
        </button>
      </div>

      {!refactor ? (
        <p className="mt-3 text-xs text-slate-500 italic">Generate feedback first to enable AI refactoring suggestions.</p>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3">
            <p className="text-sm font-medium text-slate-200 leading-relaxed">{refactor.explanation}</p>
          </div>

          <div className="space-y-2">
            <button 
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 w-full text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-200 transition-colors"
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? 'Hide Improved Code' : 'View Improved Code'}
            </button>
            
            {expanded && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <pre className="rounded-lg border border-slate-800 bg-slate-950 p-4 overflow-auto max-h-[400px] text-sm font-mono text-emerald-300">
                  {refactor.improvedCode}
                </pre>
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Key Changes</p>
            <div className="flex flex-wrap gap-2">
              {refactor.changes.map((change, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/80 px-2.5 py-1 text-[11px] text-slate-300 border border-slate-700/50">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  {change}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
