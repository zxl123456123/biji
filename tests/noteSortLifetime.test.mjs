import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'

// Execute the actual production boundary with a controlled layout-effect adapter.
// This checks cleanup ordering, not React's commit traversal or real sensor removal.
const source = readFileSync(new URL('../src/NoteSorter.tsx', import.meta.url), 'utf8')
const start = source.indexOf('function SortLifetime(')
const end = source.indexOf('\nfunction SortableCard(', start)
assert.ok(start >= 0 && end > start, 'the production lifetime boundary must exist')
const output = stripTypeScriptTypes(`${source.slice(start, end)}\nexport { SortLifetime }`, { mode: 'strip' })
const adapter = 'let setup; function useLayoutEffect(callback) { setup = callback } export function mountLayout() { return setup() }\n'
const { SortLifetime, mountLayout } = await import('data:text/javascript;base64,' + Buffer.from(adapter + output).toString('base64'))

test('production layout cleanup invalidates owner and session before canceled stop', () => {
  const steps = []
  const owner = { alive: false, session: { valid: true }, manager: { actions: { stop(options) {
    steps.push({ alive: owner.alive, valid: owner.session.valid, options })
  } } } }
  const child = { provider: 'the same child' }
  assert.equal(SortLifetime({ owner, children: child }), child)
  const cleanup = mountLayout()
  assert.equal(owner.alive, true)
  cleanup()
  assert.deepEqual(steps, [{ alive: false, valid: false, options: { canceled: true } }])

  // StrictMode's initial layout replay must restore this still-mounted owner.
  const replayCleanup = mountLayout()
  assert.equal(owner.alive, true)
  assert.equal(owner.session.valid, false)
  replayCleanup()
  assert.equal(steps.length, 2)
})

test('production cleanup also invalidates an owner before manager binding is ready', () => {
  const owner = { alive: false, session: null, manager: null }
  SortLifetime({ owner, children: null })
  const cleanup = mountLayout()
  assert.equal(owner.alive, true)
  cleanup()
  assert.equal(owner.alive, false)
})
