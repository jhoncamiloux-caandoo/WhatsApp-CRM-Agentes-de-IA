/**
 * Reduz os canvasOps do roteiro até o passo atual.
 * As ops do passo atual só entram quando o card de resultado aparece ("Pronto no canvas").
 */
export function buildCanvasState(steps, index, currentApplied, initialStatus) {
  const nodes = []
  const edges = []
  let highlighted = []
  let status = initialStatus
  const fresh = new Set()

  const last = currentApplied ? index : index - 1
  for (let i = 0; i <= last; i += 1) {
    for (const op of steps[i].canvasOps) {
      if (op.op === 'addNode') {
        nodes.push({ id: op.id, type: op.type, position: op.position, data: op.data })
        if (i === index) fresh.add(op.id)
      } else if (op.op === 'addEdge') {
        edges.push({ id: op.id, source: op.source, target: op.target, sourceHandle: op.sourceHandle, data: { tone: op.tone } })
      } else if (op.op === 'highlight') {
        highlighted = i === index ? op.ids : []
      } else if (op.op === 'setStatus') {
        status = op.status
      }
    }
  }

  return { nodes, edges, highlighted, status, fresh }
}
