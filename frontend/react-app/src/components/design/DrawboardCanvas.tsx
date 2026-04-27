import { useMemo, useRef, useState, type MouseEventHandler, type WheelEventHandler } from 'react'
import type { DiagramEdge, DiagramNode } from '../../types/api'

interface DrawboardCanvasProps {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  onMoveNode: (id: string, x: number, y: number) => void
  onEditNodeLabel: (id: string, label: string) => void
}

export function DrawboardCanvas({ nodes, edges, onMoveNode, onEditNodeLabel }: DrawboardCanvasProps) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)
  const [isPanning, setIsPanning] = useState(false)

  const dragOffset = useRef({ x: 0, y: 0 })
  const panOrigin = useRef({ x: 0, y: 0 })

  const nodeMap = useMemo(() => {
    const map = new Map<string, DiagramNode>()
    nodes.forEach((n) => map.set(n.id, n))
    return map
  }, [nodes])

  const handleWheel: WheelEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault()
    const delta = event.deltaY < 0 ? 0.1 : -0.1
    setZoom((prev) => Math.min(1.8, Math.max(0.6, Number((prev + delta).toFixed(2)))))
  }

  const handleBackgroundMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    if ((event.target as HTMLElement).dataset.role === 'node') {
      return
    }

    setIsPanning(true)
    panOrigin.current = {
      x: event.clientX - pan.x,
      y: event.clientY - pan.y,
    }
  }

  const handleMouseMove: MouseEventHandler<HTMLDivElement> = (event) => {
    if (draggingNodeId) {
      const x = (event.clientX - dragOffset.current.x - pan.x) / zoom
      const y = (event.clientY - dragOffset.current.y - pan.y) / zoom
      onMoveNode(draggingNodeId, x, y)
      return
    }

    if (isPanning) {
      setPan({
        x: event.clientX - panOrigin.current.x,
        y: event.clientY - panOrigin.current.y,
      })
    }
  }

  const handleMouseUp = () => {
    setDraggingNodeId(null)
    setIsPanning(false)
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
      <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
        <span>Zoom: {(zoom * 100).toFixed(0)}%</span>
        <span>Nodes: {nodes.length} | Edges: {edges.length}</span>
      </div>

      <div
        className="relative h-[420px] overflow-hidden rounded-xl border border-slate-700 bg-slate-950"
        onWheel={handleWheel}
        onMouseDown={handleBackgroundMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'top left',
          }}
        >
          <svg className="absolute inset-0 h-full w-full pointer-events-none">
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <path d="M0,0 L0,6 L9,3 z" fill="#94a3b8" />
              </marker>
            </defs>
            {edges.map((edge) => {
              const from = nodeMap.get(edge.from)
              const to = nodeMap.get(edge.to)
              if (!from || !to) return null

              const x1 = from.x + from.width
              const y1 = from.y + from.height / 2
              const x2 = to.x
              const y2 = to.y + to.height / 2

              return (
                <g key={edge.id}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" />
                  {edge.label ? (
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 6}
                      fill="#e2e8f0"
                      fontSize="11"
                      textAnchor="middle"
                    >
                      {edge.label}
                    </text>
                  ) : null}
                </g>
              )
            })}
          </svg>

          {nodes.map((node) => {
            const typeColor = 
              node.type === 'database' ? 'border-emerald-500/60 text-emerald-400' :
              node.type === 'cache' ? 'border-orange-500/60 text-orange-400' :
              node.type === 'load_balancer' ? 'border-purple-500/60 text-purple-400' :
              node.type === 'queue' ? 'border-blue-500/60 text-blue-400' :
              node.type === 'client' ? 'border-pink-500/60 text-pink-400' :
              node.type === 'external_api' ? 'border-yellow-500/60 text-yellow-400' :
              node.type === 'cloud_storage' ? 'border-sky-500/60 text-sky-400' :
              'border-cyan-500/60 text-cyan-300'

            return (
              <div
                key={node.id}
                data-role="node"
                className={`absolute rounded-xl border-2 bg-slate-900/95 shadow-2xl transition-shadow hover:shadow-cyan-500/20 ${typeColor}`}
                style={{ left: node.x, top: node.y, width: node.width, height: node.height }}
                onMouseDown={(event) => {
                  setDraggingNodeId(node.id)
                  dragOffset.current = {
                    x: event.clientX - node.x * zoom - pan.x,
                    y: event.clientY - node.y * zoom - pan.y,
                  }
                  event.stopPropagation()
                }}
              >
                <div className="flex h-full w-full flex-col">
                  <span className="px-3 pt-1.5 text-[9px] font-black uppercase tracking-[0.2em] opacity-70">
                    {node.type.replace('_', ' ')}
                  </span>
                  <input
                    value={node.label}
                    onChange={(event) => onEditNodeLabel(node.id, event.target.value)}
                    className="mx-3 mb-3 mt-1.5 rounded-lg border border-slate-700/50 bg-slate-950/40 px-2 py-1.5 text-xs text-slate-100 outline-none transition-colors focus:border-cyan-500/50"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
