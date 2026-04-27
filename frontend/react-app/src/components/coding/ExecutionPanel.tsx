import type { SubmitCodeResponse } from '../../types/api'

interface ExecutionPanelProps {
  result: SubmitCodeResponse | null
  error: string | null
  signals?: { 
    tabSwitchCount: number
    windowBlurCount: number
    pasteChars: number
    pasteCount: number
  }
  cheatingRisk?: {
    score: number
    severity: string
  } | null
}

export function ExecutionPanel({ result, error, signals, cheatingRisk }: ExecutionPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Execution Result</h3>
        {result?.isSubmission && (
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
            Persistent Submission
          </span>
        )}
        {result && !result.isSubmission && (
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-slate-700">
            Dry Run
          </span>
        )}
      </div>

      {error ? (
        <p className="mt-3 rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>
      ) : null}

      {!result ? (
        <p className="mt-3 text-sm text-slate-400">Run code to see output and scoring.</p>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <Metric label="Passed" value={`${result.passedTests}/${result.totalTests}`} />
            <Metric label="Correctness" value={`${result.correctnessScore}`} />
            <Metric label="Efficiency" value={`${result.efficiencyScore}`} />
            <Metric label="Standing" value={result.percentile !== undefined ? `Top ${100 - result.percentile}%` : 'N/A'} />
            <Metric label="Status" value={result.execution.status} />
          </div>

          <ResultBlock title="Stdout" value={result.execution.stdout || '(empty)'} />
          
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Test Case Details</h4>
            <div className="grid gap-3">
              {result.testResults?.map((test) => (
                <div 
                  key={test.index} 
                  className={`rounded-lg border p-3 ${
                    test.passed ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold uppercase ${test.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                      Test Case {test.index + 1}: {test.passed ? 'Passed' : 'Failed'}
                    </span>
                    <span className="text-xs text-slate-500">{test.status}</span>
                  </div>
                  {!test.passed && (
                    <div className="grid gap-2 sm:grid-cols-2 mt-2 border-t border-slate-800 pt-2 text-[11px]">
                      <div>
                        <p className="text-slate-500 uppercase tracking-tighter mb-1">Expected</p>
                        <pre className="text-slate-300 bg-slate-950 p-1.5 rounded">{test.expected || '(empty)'}</pre>
                      </div>
                      <div>
                        <p className="text-slate-500 uppercase tracking-tighter mb-1">Actual</p>
                        <pre className="text-rose-300 bg-slate-950 p-1.5 rounded">{test.stdout || '(empty)'}</pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <ResultBlock title="Stderr" value={result.execution.stderr || '(empty)'} />
          <ResultBlock title="Compile Output" value={result.execution.compileOutput || '(empty)'} />

          <div className="mt-6 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 text-center">Session Integrity Assessment</h4>
            <div className="flex items-center justify-center gap-8">
              <IntegrityMetric 
                label="Tab Switches" 
                value={signals?.tabSwitchCount ?? 0}
                threshold={2}
              />
              <IntegrityMetric 
                label="Pastes" 
                value={signals?.pasteCount ?? 0}
                threshold={1}
              />
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mb-1">Security Status</span>
                <span className={`text-lg font-bold ${
                  cheatingRisk?.severity === 'high' ? 'text-rose-500' : 
                  cheatingRisk?.severity === 'medium' ? 'text-amber-500' : 'text-emerald-400'
                }`}>
                  {cheatingRisk ? cheatingRisk.severity.toUpperCase() : 'CLEAR'}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mb-1">Trust Score</span>
                <span className={`text-lg font-bold ${
                  (cheatingRisk?.score ?? 0) > 60 ? 'text-rose-500' : 
                  (cheatingRisk?.score ?? 0) > 30 ? 'text-amber-500' : 'text-emerald-400'
                }`}>
                  {cheatingRisk ? `${100 - cheatingRisk.score}%` : '100%'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function IntegrityMetric({ label, value, threshold }: { label: string; value: number; threshold: number }) {
  const isHigh = value >= threshold
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mb-1">{label}</span>
      <span className={`text-sm font-mono ${isHigh ? 'text-rose-400' : 'text-slate-300'}`}>{value}</span>
    </div>
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
