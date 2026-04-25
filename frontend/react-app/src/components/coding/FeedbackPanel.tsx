import type { CodeFeedback } from '../../types/api'

interface FeedbackPanelProps {
  feedback: CodeFeedback | null
  loading: boolean
  onGenerate: () => void
  disabled: boolean
}

export function FeedbackPanel({ feedback, loading, onGenerate, disabled }: FeedbackPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">AI Code Mentor</h3>
        <button
          type="button"
          onClick={onGenerate}
          disabled={disabled || loading}
          className="rounded-md border border-emerald-500 bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Generating...' : 'Generate Feedback'}
        </button>
      </div>

      {!feedback ? (
        <p className="text-sm text-slate-400">Run code first, then generate AI feedback.</p>
      ) : (
        <div className="space-y-3 text-sm">
          <p className="text-slate-100">{feedback.summary}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Metric label="Time Complexity" value={feedback.timeComplexity} />
            <Metric label="Memory Complexity" value={feedback.memoryComplexity} />
            <Metric label="Readability" value={`${feedback.readabilityScore}/100`} />
            <Metric label="Edge Cases" value={`${feedback.edgeCaseScore}/100`} />
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Suggestions</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-200">
              {feedback.suggestions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
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
