import type { QuestionDetail } from '../../types/api'

interface QuestionPanelProps {
  question: QuestionDetail | null
}

export function QuestionPanel({ question }: QuestionPanelProps) {
  if (!question) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-slate-300">
        Select a question to begin.
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-bold text-white">{question.title}</h2>
        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase text-slate-300">
          {question.difficulty}
        </span>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{question.description}</p>

      <h3 className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Constraints</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-200">
        {question.constraints.map((constraint) => (
          <li key={constraint}>{constraint}</li>
        ))}
      </ul>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-300">Sample Input</h4>
          <pre className="mt-2 overflow-auto whitespace-pre-wrap text-sm text-emerald-200">{question.sampleInput}</pre>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-300">Sample Output</h4>
          <pre className="mt-2 overflow-auto whitespace-pre-wrap text-sm text-emerald-200">{question.sampleOutput}</pre>
        </div>
      </div>
    </section>
  )
}
