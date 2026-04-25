import type { SubmitCodeResponse } from '../../types/api'

interface ExecutionPanelProps {
  result: SubmitCodeResponse | null
  error: string | null
}

export function ExecutionPanel({ result, error }: ExecutionPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Execution Result</h3>

      {error ? (
        <p className="mt-3 rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>
      ) : null}

      {!result ? (
        <p className="mt-3 text-sm text-slate-400">Run code to see output and scoring.</p>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Passed" value={`${result.passedTests}/${result.totalTests}`} />
            <Metric label="Correctness" value={`${result.correctnessScore}`} />
            <Metric label="Efficiency" value={`${result.efficiencyScore}`} />
            <Metric label="Status" value={result.execution.status} />
          </div>

          <ResultBlock title="Stdout" value={result.execution.stdout || '(empty)'} />
          <ResultBlock title="Stderr" value={result.execution.stderr || '(empty)'} />
          <ResultBlock title="Compile Output" value={result.execution.compileOutput || '(empty)'} />
        </div>
      )}
    </section>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-3">
      <p className="text-xs uppercase tracking-[0.15em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-100">{value}</p>
    </div>
  )
}

function ResultBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-3">
      <p className="text-xs uppercase tracking-[0.15em] text-slate-400">{title}</p>
      <pre className="mt-2 overflow-auto whitespace-pre-wrap text-sm text-slate-200">{value}</pre>
    </div>
  )
}
