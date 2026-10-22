import { useCallback, useEffect, useMemo, useState } from 'react'
import { t } from '../../i18n.js'
import { NodeToolbar, Position, ReactFlow, ReactFlowProvider, useReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/base.css'
import Icon from '../Icon.jsx'
import { NODE_META } from '../../data/nodeTypes.js'
import { nodeTypes } from './FlowNodes.jsx'

const EDGE_COLOR = '#aab6ff'
const EDGE_DANGER = '#f94575'
const FIT = { padding: 0.18, maxZoom: 0.85 }

function ZoomButton({ label, icon, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-md text-fg-muted transition-colors hover:bg-emphasized hover:text-fg focus-visible:outline-2 focus-visible:outline-primary"
    >
      <Icon name={icon} />
    </button>
  )
}

function NodeTooltip({ node, onClose }) {
  const meta = NODE_META[node.type]
  return (
    <NodeToolbar nodeId={node.id} isVisible position={Position.Top} offset={12}>
      <div role="tooltip" id="cdemo-node-tip" className="w-64 rounded-[10px] border border-line-strong bg-emphasized p-3 shadow-2xl shadow-black/60">
        <div className="flex items-center gap-2">
          <span style={{ color: meta.color }}><Icon name={meta.icon} size={14} /></span>
          <p className="flex-1 text-xs font-semibold text-fg">{meta.label}</p>
          <button type="button" aria-label={t.closeTip} onClick={onClose} className="grid h-5 w-5 place-items-center rounded text-fg-subtle hover:text-fg">
            ×
          </button>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-fg-muted">{meta.help}</p>
      </div>
    </NodeToolbar>
  )
}

function Flow({ canvas, onInteract, reducedMotion, stats, focusNodes }) {
  const { fitView, zoomIn, zoomOut } = useReactFlow()
  const [selectedId, setSelectedId] = useState(null)
  // Nós controlados pelo roteiro: guardamos só as medidas que o React Flow reporta,
  // sem elas o fitView não enxerga os blocos recém-adicionados.
  const [measured, setMeasured] = useState({})
  const onNodesChange = useCallback((changes) => {
    const dims = changes.filter((c) => c.type === 'dimensions' && c.dimensions)
    if (!dims.length) return
    setMeasured((m) => {
      const next = { ...m }
      dims.forEach((c) => { next[c.id] = c.dimensions })
      return next
    })
  }, [])

  const nodes = useMemo(() => canvas.nodes.map((n) => ({
    ...n,
    measured: measured[n.id],
    data: {
      ...n.data,
      fresh: canvas.fresh.has(n.id) && !reducedMotion,
      highlighted: canvas.highlighted.includes(n.id),
      selected: n.id === selectedId,
      stats: stats?.[n.id],
    },
    ariaLabel: `${NODE_META[n.type].label}: ${n.data.title}. ${t.nodeHint}`,
  })), [canvas, selectedId, reducedMotion, measured, stats])

  const edges = useMemo(() => canvas.edges.map((e) => {
    const danger = e.data?.tone === 'danger'
    return {
      ...e,
      sourceHandle: e.sourceHandle ?? `${e.source}-out`,
      animated: !reducedMotion,
      focusable: false,
      style: { stroke: danger ? EDGE_DANGER : EDGE_COLOR, strokeWidth: 2 },
    }
  }), [canvas.edges, reducedMotion])

  // A câmera acompanha a construção: enquadra os blocos novos e quem os conecta;
  // na revisão (highlight) mostra a automação inteira.
  const focusIds = useMemo(() => {
    if (canvas.highlighted.length) return null
    const ids = new Set(canvas.fresh)
    if (!ids.size) return focusNodes ? focusNodes.map((id) => ({ id })) : null
    canvas.edges.forEach((e) => { if (ids.has(e.target)) ids.add(e.source) })
    return [...ids].map((id) => ({ id }))
  }, [canvas, focusNodes])

  const nodesInitialized = canvas.nodes.every((n) => measured[n.id])
  const fitKey = focusIds ? focusIds.map((n) => n.id).join() : canvas.highlighted.length ? 'all' : `count-${canvas.nodes.length}`
  useEffect(() => {
    if (!nodesInitialized) return undefined
    // Espera um frame extra para os nós recém-montados serem medidos.
    const t = setTimeout(() => {
      fitView({ ...FIT, nodes: focusIds ?? undefined, maxZoom: focusIds ? 0.75 : FIT.maxZoom, duration: reducedMotion ? 0 : 700 })
    }, 80)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodesInitialized, fitKey])

  useEffect(() => {
    if (selectedId && !canvas.nodes.some((n) => n.id === selectedId)) setSelectedId(null)
  }, [canvas.nodes, selectedId])

  const selected = canvas.nodes.find((n) => n.id === selectedId)

  const onKeyDown = (e) => {
    if (e.key === 'Escape' && selectedId) {
      e.stopPropagation()
      setSelectedId(null)
      return
    }
    const nodeEl = e.target.closest?.('.react-flow__node')
    if (nodeEl && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      e.stopPropagation()
      onInteract()
      const id = nodeEl.getAttribute('data-id')
      setSelectedId((cur) => (cur === id ? null : id))
    }
  }

  return (
    <div className="absolute inset-0" onPointerDownCapture={onInteract} onKeyDown={onKeyDown}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={(_, node) => setSelectedId((cur) => (cur === node.id ? null : node.id))}
        onPaneClick={() => setSelectedId(null)}
        fitView
        fitViewOptions={FIT}
        minZoom={0.15}
        maxZoom={1.2}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        preventScrolling={false}
        zoomOnDoubleClick={false}
        proOptions={{ hideAttribution: true }}
        aria-label={t.canvas}
      >
        {selected && <NodeTooltip node={selected} onClose={() => setSelectedId(null)} />}
      </ReactFlow>

      <div className="absolute bottom-4 left-4 z-10 flex flex-col rounded-md border border-line bg-panel p-0.5">
        <ZoomButton label={t.zoomIn} icon="plus" onClick={() => zoomIn({ duration: 200 })} />
        <ZoomButton label={t.zoomOut} icon="minus" onClick={() => zoomOut({ duration: 200 })} />
        <ZoomButton label={t.fit} icon="fit" onClick={() => fitView({ ...FIT, duration: 300 })} />
      </div>
    </div>
  )
}

export default function FlowCanvas(props) {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  )
}
