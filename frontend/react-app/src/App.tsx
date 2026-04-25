function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <span className="inline-flex rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
          Phase 0 Scaffold
        </span>

        <h1 className="mt-6 text-4xl font-bold leading-tight text-white md:text-6xl">
          AI OA Practice
        </h1>

        <p className="mt-6 max-w-2xl text-base text-slate-300 md:text-lg">
          Production-ready open-source platform for coding interview simulation,
          online assessments, and AI-driven system design feedback.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-5">
            <h2 className="text-lg font-semibold text-white">Frontend</h2>
            <p className="mt-2 text-sm text-slate-300">
              React + TypeScript + Tailwind + Monaco + Zustand
            </p>
          </section>

          <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-5">
            <h2 className="text-lg font-semibold text-white">Backend</h2>
            <p className="mt-2 text-sm text-slate-300">
              Node.js + Express + MongoDB + Gemini + Judge0 + Socket.io
            </p>
          </section>
        </div>

        <div className="mt-10 rounded-xl border border-slate-700 bg-slate-900/60 p-5">
          <h3 className="text-base font-semibold text-white">Next Milestones</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
            <li>Implement auth and session lifecycle APIs.</li>
            <li>Add coding workspace with Monaco and Judge0 integration.</li>
            <li>Build AI interviewer and analytics dashboard modules.</li>
          </ul>
        </div>
      </div>
    </main>
  )
}

export default App
