import type { GraphModel } from './noteGraphModel.ts'

export type GraphScope = 'all' | 'one-hop' | 'two-hop'
export type GraphEvidence = 'all' | 'tags' | 'text'

export function projectGraphView(model: GraphModel, options: {
  scope: GraphScope; evidence: GraphEvidence; centerId: string
}): GraphModel {
  const ids = new Set(model.nodes.map(node => node.id))
  const edges = model.edges.filter(edge => ids.has(edge.source) && ids.has(edge.target)
    && (options.evidence === 'all' || (options.evidence === 'tags' ? edge.sharedTags.length > 0 : edge.similarity !== undefined)))
  let visible = ids
  if (options.scope !== 'all' && options.centerId) {
    visible = new Set<string>()
    if (ids.has(options.centerId)) {
      visible.add(options.centerId)
      const neighbors = new Map<string, string[]>()
      for (const edge of edges) {
        const source = neighbors.get(edge.source) ?? [], target = neighbors.get(edge.target) ?? []
        source.push(edge.target); target.push(edge.source)
        neighbors.set(edge.source, source); neighbors.set(edge.target, target)
      }
      let frontier = [options.centerId]
      const depth = options.scope === 'one-hop' ? 1 : 2
      for (let hop = 0; hop < depth; hop++) {
        const next: string[] = []
        for (const id of frontier) {
          for (const neighbor of neighbors.get(id) ?? []) {
            if (visible.has(neighbor)) continue
            visible.add(neighbor); next.push(neighbor)
          }
        }
        frontier = next
      }
    }
  }
  return {
    nodes: model.nodes.filter(node => visible.has(node.id)).map(node => ({ ...node })),
    edges: edges.filter(edge => visible.has(edge.source) && visible.has(edge.target)).map(edge => ({ ...edge, sharedTags: [...edge.sharedTags] })),
  }
}
