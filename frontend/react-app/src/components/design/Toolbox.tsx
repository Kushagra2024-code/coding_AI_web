import type { DiagramNodeType } from '../../types/api'

interface ToolboxProps {
  onAddNode: (type: DiagramNodeType) => void
  onConnectLastTwo: () => void
  onClear: () => void
}

export function Toolbox({ onAddNode, onConnectLastTwo, onClear }: ToolboxProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Drawboard Tools</h3>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <ToolButton label="+ Service" onClick={() => onAddNode('rectangle')} />
        <ToolButton label="+ Database" onClick={() => onAddNode('database')} />
        <ToolButton label="+ Cache" onClick={() => onAddNode('cache')} />
        <ToolButton label="+ Load Balancer" onClick={() => onAddNode('load_balancer')} />
        <ToolButton label="+ Queue" onClick={() => onAddNode('queue')} />
        <ToolButton label="+ Storage" onClick={() => onAddNode('cloud_storage')} />
        <ToolButton label="+ External API" onClick={() => onAddNode('external_api')} />
        <ToolButton label="+ User/Client" onClick={() => onAddNode('client')} />
        <ToolButton label="+ Note/Text" onClick={() => onAddNode('text')} />
        <ToolButton label="Connect Last Two" onClick={onConnectLastTwo} />
      </div>

      <button
        type="button"
        onClick={onClear}
        className="mt-3 w-full rounded-md border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/20"
      >
        Clear Diagram
      </button>

      <p className="mt-3 text-xs text-slate-400">
        Drag nodes to reposition. Scroll to zoom. Hold mouse and drag empty space to pan.
      </p>
    </section>
  )
}

function ToolButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-cyan-500/60 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/20"
    >
      {label}
    </button>
  )
}
