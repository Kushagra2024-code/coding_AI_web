import Editor from '@monaco-editor/react'
import type { SupportedLanguage } from '../../types/api'

interface EditorPanelProps {
  code: string
  language: SupportedLanguage
  onLanguageChange: (language: SupportedLanguage) => void
  onCodeChange: (code: string) => void
  onRun: () => void
  running: boolean
}

const languageMap: Record<SupportedLanguage, string> = {
  cpp: 'cpp',
  python: 'python',
  java: 'java',
  javascript: 'javascript',
}

export function EditorPanel({
  code,
  language,
  onLanguageChange,
  onCodeChange,
  onRun,
  running,
}: EditorPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300" htmlFor="lang">
            Language
          </label>
          <select
            id="lang"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
            className="rounded-md border border-slate-600 bg-slate-950 px-2 py-1 text-sm text-slate-200"
          >
            <option value="cpp">C++</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="javascript">JavaScript</option>
          </select>
        </div>

        <button
          type="button"
          onClick={onRun}
          disabled={running}
          className="rounded-md border border-emerald-500 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {running ? 'Running...' : 'Run Code'}
        </button>
      </div>

      <Editor
        height="420px"
        language={languageMap[language]}
        value={code}
        theme="vs-dark"
        onChange={(value) => onCodeChange(value ?? '')}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
        }}
      />
    </section>
  )
}
