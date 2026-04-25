interface InterviewerPanelProps {
  candidateMessage: string
  onCandidateMessageChange: (value: string) => void
  onAsk: () => void
  asking: boolean
  interviewerMessage: string | null
  followUpQuestion: string | null
  focusArea: string | null
}

export function InterviewerPanel({
  candidateMessage,
  onCandidateMessageChange,
  onAsk,
  asking,
  interviewerMessage,
  followUpQuestion,
  focusArea,
}: InterviewerPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">AI Interviewer</h3>
        {focusArea ? (
          <span className="rounded-full border border-indigo-500/50 bg-indigo-500/20 px-2 py-1 text-xs text-indigo-200">
            focus: {focusArea}
          </span>
        ) : null}
      </div>

      <textarea
        value={candidateMessage}
        onChange={(event) => onCandidateMessageChange(event.target.value)}
        placeholder="Explain your current approach, trade-offs, and edge cases."
        className="min-h-24 w-full rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-100 outline-none ring-emerald-400/50 placeholder:text-slate-500 focus:ring-2"
      />

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={onAsk}
          disabled={asking || !candidateMessage.trim()}
          className="rounded-md border border-indigo-500 bg-indigo-500/20 px-4 py-2 text-sm font-semibold text-indigo-200 hover:bg-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {asking ? 'Thinking...' : 'Ask Interviewer'}
        </button>
      </div>

      {interviewerMessage ? (
        <div className="mt-4 space-y-3 rounded-lg border border-slate-700 bg-slate-950/60 p-3">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Interviewer</p>
            <p className="mt-1 text-sm text-slate-100">{interviewerMessage}</p>
          </div>
          {followUpQuestion ? (
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Follow-up</p>
              <p className="mt-1 text-sm text-amber-200">{followUpQuestion}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
