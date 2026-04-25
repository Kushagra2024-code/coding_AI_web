import type { QuestionListItem } from '../../types/api'

interface QuestionSidebarProps {
  questions: QuestionListItem[]
  selectedId: string | null
  onSelect: (id: string) => void
}

function difficultyColor(difficulty: QuestionListItem['difficulty']): string {
  if (difficulty === 'easy') return 'text-emerald-300'
  if (difficulty === 'medium') return 'text-amber-300'
  return 'text-rose-300'
}

export function QuestionSidebar({ questions, selectedId, onSelect }: QuestionSidebarProps) {
  return (
    <aside className="h-full rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Questions</h2>
      <div className="mt-4 space-y-3">
        {questions.map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => onSelect(q.id)}
            className={`w-full rounded-lg border p-3 text-left transition ${
              selectedId === q.id
                ? 'border-emerald-400/60 bg-emerald-500/10'
                : 'border-slate-700 bg-slate-950/40 hover:border-slate-500'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-slate-100">{q.title}</p>
              <span className={`text-xs font-semibold uppercase ${difficultyColor(q.difficulty)}`}>
                {q.difficulty}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400">{q.tags.join(', ') || 'general'}</p>
          </button>
        ))}
      </div>
    </aside>
  )
}
