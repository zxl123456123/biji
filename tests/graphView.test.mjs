import test from 'node:test'
import assert from 'node:assert/strict'
import { projectGraphView } from '../src/graphView.ts'
import { buildNoteGraph, projectGraph } from '../src/noteGraphModel.ts'

const node = id => ({ id, group: `single:${id}` })
const edge = (source, target, sharedTags = [], similarity) => ({ source, target, sharedTags, ...(similarity !== undefined ? { similarity } : {}) })
const view = (model, scope = 'all', evidence = 'all', centerId = '') => projectGraphView(model, { scope, evidence, centerId })
const ids = model => model.nodes.map(node => node.id)

test('one and two hops traverse undirected chains and retain only edges in the range', () => {
  const model = { nodes: ['a', 'b', 'c', 'd', 'isolated'].map(node), edges: [edge('b', 'a', ['tag']), edge('b', 'c', ['tag']), edge('c', 'd', ['tag'])] }
  assert.deepEqual(ids(view(model, 'one-hop', 'all', 'a')), ['a', 'b'])
  assert.equal(view(model, 'one-hop', 'all', 'a').edges.length, 1)
  assert.deepEqual(ids(view(model, 'two-hop', 'all', 'a')), ['a', 'b', 'c'])
  assert.equal(view(model, 'two-hop', 'all', 'a').edges.length, 2)
  assert.deepEqual(ids(view(model, 'one-hop', 'all', 'c')), ['b', 'c', 'd'])
})

test('cycles include in-range neighbor edges once and never duplicate UUIDs', () => {
  const model = { nodes: ['a', 'b', 'c', 'd'].map(node), edges: [edge('a', 'b', ['tag']), edge('b', 'c', ['tag']), edge('c', 'a', ['tag']), edge('c', 'd', ['tag'])] }
  const one = view(model, 'one-hop', 'all', 'a'), two = view(model, 'two-hop', 'all', 'a')
  assert.deepEqual(ids(one), ['a', 'b', 'c'])
  assert.equal(one.edges.length, 3)
  assert.deepEqual(ids(two), ['a', 'b', 'c', 'd'])
  assert.equal(two.edges.length, 4)
})

test('evidence is filtered before expansion and mixed edges match both channels', () => {
  const mixed = edge('a', 'b', ['共同'], .75)
  const model = { nodes: ['a', 'b', 'c', 'd', 'e', 'isolated'].map(node), edges: [mixed, edge('b', 'c', [], .5), edge('a', 'd', ['标签']), edge('d', 'e', ['标签'])] }
  const tags = view(model, 'two-hop', 'tags', 'a'), text = view(model, 'two-hop', 'text', 'a')
  assert.deepEqual(ids(tags), ['a', 'b', 'd', 'e'])
  assert.deepEqual(ids(text), ['a', 'b', 'c'])
  assert.equal(tags.edges.length, 3)
  assert.equal(text.edges.length, 2)
  assert.deepEqual(tags.edges[0], mixed)
  assert.deepEqual(text.edges[0], mixed)
  // Evidence existence, rather than truthiness of a score, defines this channel.
  assert.equal(view({ nodes: ['a', 'b'].map(node), edges: [edge('a', 'b', [], 0)] }, 'all', 'text').edges.length, 1)
})

test('all scope keeps every UUID including isolated nodes while filtering only edges', () => {
  const model = { nodes: ['a', 'b', 'c', 'empty'].map(node), edges: [edge('a', 'b', ['标签']), edge('b', 'c', [], .6)] }
  for (const evidence of ['all', 'tags', 'text']) {
    assert.deepEqual(ids(view(model, 'all', evidence, 'missing')), ['a', 'b', 'c', 'empty'])
  }
  assert.equal(view(model).edges.length, 2)
  assert.equal(view(model, 'all', 'tags').edges.length, 1)
  assert.equal(view(model, 'all', 'text').edges.length, 1)
})

test('no center falls back to all, isolated valid centers survive, missing explicit centers stay empty', () => {
  const model = { nodes: ['a', 'b', 'isolated'].map(node), edges: [edge('a', 'b', ['标签'])] }
  for (const scope of ['one-hop', 'two-hop']) {
    assert.deepEqual(view(model, scope), view(model))
    assert.deepEqual(ids(view(model, scope, 'all', 'isolated')), ['isolated'])
    assert.deepEqual(view(model, scope, 'all', 'missing'), { nodes: [], edges: [] })
    assert.deepEqual(view({ nodes: [], edges: [] }, scope), { nodes: [], edges: [] })
  }
})

test('a new center can enter another component without depending on the old local subset', () => {
  const projected = { nodes: ['old', 'old-neighbor', 'requested', 'new-neighbor'].map(node), edges: [edge('old', 'old-neighbor', ['旧']), edge('requested', 'new-neighbor', ['新'])] }
  assert.deepEqual(ids(view(projected, 'one-hop', 'all', 'old')), ['old', 'old-neighbor'])
  assert.deepEqual(ids(view(projected, 'one-hop', 'all', 'requested')), ['requested', 'new-neighbor'])
  assert.deepEqual(view(projected, 'two-hop', 'all', 'deleted-request'), { nodes: [], edges: [] })
})

test('shared search projection constrains expansion and pending fallback retains each current UUID', () => {
  const model = { nodes: ['a', 'b', 'c'].map(node), edges: [edge('a', 'b', ['标签']), edge('b', 'c', ['标签'])] }
  const projected = projectGraph(model, ['a', 'c'])
  assert.deepEqual(ids(view(projected, 'two-hop', 'all', 'a')), ['a'])
  const pending = projectGraph(null, ['a', 'new', 'empty'])
  assert.deepEqual(view(pending).nodes, [{ id: 'a', group: 'pending' }, { id: 'new', group: 'pending' }, { id: 'empty', group: 'pending' }])
  assert.deepEqual(view(pending, 'one-hop', 'text', 'new'), { nodes: [{ id: 'new', group: 'pending' }], edges: [] })
})

test('identical displayed content remains separate UUIDs and empty notes stay visible', () => {
  const graph = buildNoteGraph([{ id: 'same-a', content: '同名正文' }, { id: 'same-b', content: '同名正文' }, { id: 'empty', content: '' }])
  assert.deepEqual(ids(view(graph)), ['empty', 'same-a', 'same-b'])
  assert.deepEqual(ids(view(graph, 'one-hop', 'text', 'same-b')), ['same-a', 'same-b'])
  assert.deepEqual(ids(view(graph, 'two-hop', 'text', 'empty')), ['empty'])
})

test('frozen inputs and source evidence remain unchanged across projections and output mutation', () => {
  const model = Object.freeze({
    nodes: Object.freeze(['a', 'b', 'c'].map(id => Object.freeze(node(id)))),
    edges: Object.freeze([Object.freeze({ source: 'a', target: 'b', sharedTags: Object.freeze(['共同']), similarity: .8 }), Object.freeze({ source: 'b', target: 'c', sharedTags: Object.freeze([]), similarity: .6 })]),
  })
  const before = JSON.stringify(model)
  for (const scope of ['all', 'one-hop', 'two-hop']) {
    for (const evidence of ['all', 'tags', 'text']) {
      const shown = view(model, scope, evidence, 'a')
      shown.nodes[0].group = 'changed'
      shown.edges[0].sharedTags.push('new')
      shown.edges[0].similarity = 0
    }
  }
  assert.equal(JSON.stringify(model), before)
})
