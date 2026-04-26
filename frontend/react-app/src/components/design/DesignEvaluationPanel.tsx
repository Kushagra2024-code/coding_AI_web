import type { DesignEvaluation, DesignRefactor } from '../../types/api'
import { Lightbulb, Workflow } from 'lucide-react'

interface DesignEvaluationPanelProps {
  architectureText: string
  onArchitectureTextChange: (value: string) => void
  onEvaluate: () => void
  evaluating: boolean
  evaluation: DesignEvaluation | null
  refactor: DesignRefactor | null
  onRefactor: () => void
  refactoring: boolean
  percentile: number | null
  timerSeconds: number
  disabled: boolean
}

export function DesignEvaluationPanel({
  architectureText,
  onArchitectureTextChange,
  onEvaluate,
  evaluating,
  evaluation,
  refactor,
  onRefactor,
  refactoring,
  percentile,
  timerSeconds,
  disabled,
}: DesignEvaluationPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Design Evaluation</h3>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 mr-4 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter">Time</span>
            <span className="text-xs font-mono text-emerald-400">
              {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <button
            type="button"
            onClick={onRefactor}
            disabled={disabled || refactoring}
            className="rounded-md border border-amber-500 bg-amber-500/20 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/30 disabled:cursor-not-allowed disabled:opacity-60 flex items-center gap-1.5"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            {refactoring ? 'Advising...' : 'Architectural Patterns'}
          </button>
          <button
            type="button"
            onClick={onEvaluate}
            disabled={disabled || evaluating}
            className="rounded-md border border-emerald-500 bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {evaluating ? 'Evaluating...' : 'Evaluate Design'}
          </button>
        </div>
      </div>

      <textarea
        value={architectureText}
        onChange={(event) => onArchitectureTextChange(event.target.value)}
        className="min-h-32 w-full rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-100 outline-none ring-indigo-400/60 placeholder:text-slate-500 focus:ring-2"
        placeholder="Describe traffic flow, data model, scaling, cache strategy, fault tolerance, and trade-offs."
      />

      {!evaluation ? (
        <p className="mt-3 text-sm text-slate-400">Submit architecture details to receive AI system design scoring.</p>
      ) : (
        <div className="mt-4 space-y-3 text-sm">
          <div className="grid gap-2 sm:grid-cols-3">
            <Metric label="Overall" value={`${evaluation.score}/100`} />
            <Metric label="Scalability" value={`${evaluation.scalability}`} />
            <Metric label="Fault Tolerance" value={`${evaluation.faultTolerance}`} />
            <Metric label="Database" value={`${evaluation.databaseChoice}`} />
            <Metric label="Caching" value={`${evaluation.cachingStrategy}`} />
            <Metric label="Microservices" value={`${evaluation.microservicesArchitecture}`} />
          </div>

          {percentile !== null && (
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Performance Standing</p>
                <p className="text-sm text-slate-300 mt-1">You solved this faster than <span className="text-indigo-400 font-bold">{percentile}%</span> of other engineers.</p>
              </div>
              <div className="h-12 w-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{percentile}%</span>
              </div>
            </div>
          )}

          <p className="rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-slate-100">{evaluation.summary}</p>

          <List title="Missing Components" items={evaluation.missingComponents} />
          <List title="Improvements" items={evaluation.improvements} />

          {refactor && (
            <div className="mt-6 pt-4 border-t border-slate-800 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Workflow className="h-4 w-4 text-amber-500" />
                <h4 className="text-xs font-bold uppercase tracking-widest text-amber-500">Strategic Design patterns</h4>
              </div>
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                <p className="text-[11px] font-bold text-amber-400/80 mb-2 uppercase tracking-tighter">Recommended Focus: {refactor.suggestedFocus}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1.5">Patterns</p>
                    <div className="flex flex-wrap gap-1.5">
                      {refactor.architecturalPatterns.map(p => (
                        <span key={p} className="px-2 py-0.5 bg-slate-800 rounded text-[11px] text-slate-300 border border-slate-700">{p}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1.5">Critical Connections</p>
                    <div className="flex flex-col gap-1">
                      {refactor.componentsToLink.map(c => (
                        <span key={c} className="text-[11px] text-slate-400 font-mono">→ {c}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
      <p className="text-xs uppercase tracking-[0.15em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm text-slate-100">{value}</p>
    </div>
  )
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
      <p className="text-xs uppercase tracking-[0.15em] text-slate-400">{title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-200">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
