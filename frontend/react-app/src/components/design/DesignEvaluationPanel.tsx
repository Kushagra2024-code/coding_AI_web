import type { DesignEvaluation } from '../../types/api'

interface DesignEvaluationPanelProps {
  architectureText: string
  onArchitectureTextChange: (value: string) => void
  onEvaluate: () => void
  evaluating: boolean
  evaluation: DesignEvaluation | null
  disabled: boolean
}

export function DesignEvaluationPanel({
  architectureText,
  onArchitectureTextChange,
  onEvaluate,
  evaluating,
  evaluation,
  disabled,
}: DesignEvaluationPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Design Evaluation</h3>
        <button
          type="button"
          onClick={onEvaluate}
          disabled={disabled || evaluating}
          className="rounded-md border border-emerald-500 bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {evaluating ? 'Evaluating...' : 'Evaluate Design'}
        </button>
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

          <p className="rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-slate-100">{evaluation.summary}</p>

          <List title="Missing Components" items={evaluation.missingComponents} />
          <List title="Improvements" items={evaluation.improvements} />
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
