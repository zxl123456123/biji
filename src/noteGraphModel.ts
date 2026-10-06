import { normaliseBody } from './noteText.ts'
import { tagsFor } from './recordTools.ts'

export type GraphInput = { id: string; content: string }
export type GraphNode = { id: string; group: string }
export type GraphEdge = { source: string; target: string; sharedTags: string[]; similarity?: number }
export type GraphModel = { nodes: GraphNode[]; edges: GraphEdge[] }
export function compare(a: string, b: string) {
  let ai = 0, bi = 0
  while (ai < a.length && bi < b.length) {
    const ac = a.codePointAt(ai)!, bc = b.codePointAt(bi)!
    if (ac !== bc) return ac - bc
    ai += ac > 0xffff ? 2 : 1
    bi += bc > 0xffff ? 2 : 1
  }
  return (ai < a.length ? 1 : 0) - (bi < b.length ? 1 : 0)
}
export function semanticSnapshot(notes: readonly (GraphInput & { deletedAt?: string })[]) {
  return notes.filter(note => !note.deletedAt).map(({ id, content }) => ({ id, content })).sort((a, b) => compare(a.id, b.id))
}
export const semanticKey = (input: readonly GraphInput[]) => JSON.stringify(input.map(({ id, content }) => [id, content]))

export function buildNoteGraph(input: readonly GraphInput[]): GraphModel {
  const records = [...input].sort((a, b) => compare(a.id, b.id)).map(note => ({
    id: note.id, body: normaliseBody(note.content), tags: [...new Set(tagsFor(note.content))].sort(compare),
    vector: new Map<string, number>(),
  }))
  const tagBuckets = new Map<string, number[]>(), postings = new Map<string, number[]>(), duplicates = new Map<string, number[]>()
  const append = (map: Map<string, number[]>, key: string, index: number) => {
    const bucket = map.get(key) ?? []
    bucket.push(index)
    map.set(key, bucket)
  }
  records.forEach((record, index) => {
    record.tags.forEach(tag => append(tagBuckets, tag, index))
    if (record.body) append(duplicates, record.body, index)
    for (const segment of record.body.match(/[\p{L}\p{N}]+/gu) ?? []) {
      const chars = Array.from(segment)
      for (const size of [2, 3]) {
        for (let i = 0; i + size <= chars.length; i++) {
          const gram = size === 2 ? chars[i] + chars[i + 1] : chars[i] + chars[i + 1] + chars[i + 2]
          record.vector.set(gram, (record.vector.get(gram) ?? 0) + 1)
        }
      }
    }
    record.vector.forEach((_, gram) => append(postings, gram, index))
  })
  const weights = new Map([...postings].map(([gram, bucket]) => [gram, 1 + Math.log((1 + records.length) / (1 + bucket.length))]))
  const idf = (gram: string) => weights.get(gram)!
  for (const record of records) {
    let norm = 0
    record.vector.forEach((tf, gram) => {
      const weight = (1 + Math.log(tf)) * idf(gram)
      record.vector.set(gram, weight)
      norm += weight * weight
    })
    norm = Math.sqrt(norm)
    if (norm) record.vector.forEach((weight, gram) => record.vector.set(gram, weight / norm))
  }
  const adjacent = (bucket: number[], index: number) => {
    if (bucket.length < 2) return []
    const at = bucket.indexOf(index)
    return [bucket[(at + 1) % bucket.length], bucket[(at + bucket.length - 1) % bucket.length]]
  }
  const edges = new Map<string, GraphEdge>(), textChoices = new Map<number, Map<number, number>>()
  const shared = (a: number, b: number) => records[a].tags.filter(tag => records[b].tags.includes(tag))
  function merge(a: number, b: number, similarity?: number) {
    const source = records[Math.min(a, b)].id, target = records[Math.max(a, b)].id
    const key = JSON.stringify([source, target])
    const edge = edges.get(key) ?? { source, target, sharedTags: shared(a, b) }
    if (similarity !== undefined) edge.similarity = similarity
    edges.set(key, edge)
  }
  records.forEach((record, index) => {
    const tagCandidates = new Set<number>()
    record.tags.forEach(tag => adjacent(tagBuckets.get(tag)!, index).forEach(other => tagCandidates.add(other)))
    ;[...tagCandidates].sort((a, b) => shared(index, b).length - shared(index, a).length || a - b).slice(0, 2).forEach(other => merge(index, other))
    const candidates = new Set<number>()
    const add = (other: number) => { if (other !== index && candidates.size < 64) candidates.add(other) }
    if (record.body) adjacent(duplicates.get(record.body)!, index).forEach(add)
    const grams = [...record.vector.keys()].filter(gram => postings.get(gram)!.length > 1 && postings.get(gram)!.length <= Math.max(16, Math.ceil(.2 * records.length)))
      .sort((a, b) => idf(b) - idf(a) || compare(a, b))
    for (const gram of grams) {
      if (candidates.size >= 64) break
      for (const other of postings.get(gram)!) {
        add(other)
        if (candidates.size >= 64) break
      }
    }
    const scores = new Map<number, number>()
    // Accumulate in the same gram order as a per-candidate dot product.
    if (candidates.size) {
      record.vector.forEach((weight, gram) => {
        const bucket = postings.get(gram)!
        if (bucket.length < 2) return
        if (bucket.length <= candidates.size) {
          for (const other of bucket) {
            if (candidates.has(other)) scores.set(other, (scores.get(other) ?? 0) + weight * records[other].vector.get(gram)!)
          }
        } else {
          for (const other of candidates) {
            const otherWeight = records[other].vector.get(gram)
            if (otherWeight !== undefined) scores.set(other, (scores.get(other) ?? 0) + weight * otherWeight)
          }
        }
      })
    }
    const scored = [...candidates].map(other => {
      const score = record.body && record.body === records[other].body ? 1 : scores.get(other) ?? 0
      return { other, score: Math.min(1, score) }
    }).filter(pair => pair.score >= .32).sort((a, b) => b.score - a.score || a.other - b.other).slice(0, 2)
    textChoices.set(index, new Map(scored.map(pair => [pair.other, pair.score])))
    scored.forEach(({ other, score }) => merge(index, other, score))
  })
  const parents = records.map((_, index) => index)
  const root = (index: number): number => parents[index] === index ? index : (parents[index] = root(parents[index]))
  textChoices.forEach((choices, index) => {
    if (records[index].tags.length) return
    choices.forEach((score, other) => {
      if (score < .55 || records[other].tags.length || (textChoices.get(other)?.get(index) ?? 0) < .55) return
      const a = root(index), b = root(other)
      parents[Math.max(a, b)] = Math.min(a, b)
    })
  })
  const sizes = new Map<number, number>()
  records.forEach((_, index) => sizes.set(root(index), (sizes.get(root(index)) ?? 0) + 1))
  return {
    nodes: records.map((record, index) => {
      const main = [...record.tags].sort((a, b) => tagBuckets.get(a)!.length - tagBuckets.get(b)!.length || compare(a, b))[0]
      const group = main ? `tag:${main}` : sizes.get(root(index))! > 1 ? `text:${records[root(index)].id}` : `single:${record.id}`
      return { id: record.id, group }
    }),
    edges: [...edges.values()].sort((a, b) => compare(a.source, b.source) || compare(a.target, b.target)),
  }
}

export function projectGraph(model: GraphModel | null, visibleIds: readonly string[]): GraphModel {
  const visible = new Set(visibleIds), nodes = new Map(model?.nodes.map(node => [node.id, node]) ?? [])
  return {
    nodes: visibleIds.map(id => ({ id, group: nodes.get(id)?.group ?? 'pending' })),
    edges: (model?.edges ?? []).filter(edge => visible.has(edge.source) && visible.has(edge.target)).map(edge => ({ ...edge, sharedTags: [...edge.sharedTags] })),
  }
}
