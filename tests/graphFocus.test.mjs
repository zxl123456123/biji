import test from 'node:test'
import assert from 'node:assert/strict'
import { createGraphLocator } from '../src/graphFocus.ts'
import { centeredCamera, toScreen } from '../src/graphGeometry.ts'

test('centered camera uses CSS dimensions and bounded zoom at different world positions', () => {
  for (const position of [{ x: 900, y: -420 }, { x: -123, y: 456 }]) {
    for (const zoom of [.2, 1.3, 4]) {
      const camera = centeredCamera(position, 800, 450, zoom)
      assert.deepEqual(toScreen(position, camera), { x: 400, y: 225 })
      assert.ok(camera.k >= .6 && camera.k <= 2)
    }
  }
})
test('one long-lived graph owner waits for model and dimensions then consumes the latest request once', () => {
  let width = 0, status = 'updating', request = { id: 'a', token: 1 }, nodes = ['a']
  const oldReplies = [], replies = [], located = []
  let finish = result => oldReplies.push(result)
  const locator = createGraphLocator({ latest: () => ({ request, status, finish }), locate: id => {
    if (!width) return 'waiting'
    if (!nodes.includes(id)) return 'missing'
    located.push(id); return 'located'
  } })
  locator.retry(); assert.equal(located.length, 0)
  status = 'ready'; locator.retry(); assert.equal(oldReplies.length, 0)
  request = { id: 'b', token: 2 }; nodes = ['a', 'b']; finish = result => replies.push(result)
  width = 800; locator.retry(); locator.retry()
  assert.deepEqual(located, ['b']); assert.equal(oldReplies.length, 0); assert.deepEqual(replies, [{ token: 2, ok: true }])
  // A detail request uses the same owner, including the error fallback nodes.
  status = 'error'; request = { id: 'a', token: 3 }; locator.retry()
  assert.deepEqual(located, ['b', 'a']); assert.deepEqual(replies[1], { token: 3, ok: true })
  request = { id: 'deleted', token: 4 }; locator.retry()
  assert.deepEqual(replies[2], { token: 4, ok: false, reason: 'missing' })
  request = null; locator.retry(); locator.dispose(); request = { id: 'a', token: 5 }; locator.retry()
  assert.equal(replies.length, 3)
})
test('a replaced token and disposed canvas never report an obsolete locate result', () => {
  let request = { id: 'old', token: 1 }, replies = []
  const locator = createGraphLocator({ latest: () => ({ request, status: 'ready', finish: result => replies.push(result) }), locate: () => { request = { id: 'new', token: 2 }; return 'located' } })
  locator.retry(); assert.deepEqual(replies, [])
  const gone = createGraphLocator({ latest: () => ({ request, status: 'ready', finish: result => replies.push(result) }), locate: () => { gone.dispose(); return 'located' } })
  gone.retry(); assert.deepEqual(replies, [])
})
test('local requests keep the waiting, latest callback, consume-once and missing protocol', () => {
  let request = { id: 'first-space-record', token: 10, local: true }, status = 'updating', width = 0
  let nodes = ['first-space-record', 'latest-space-record']
  const attempts = [], located = [], oldReplies = [], replies = []
  let finish = result => oldReplies.push(result)
  const locator = createGraphLocator({ latest: () => ({ request, status, finish }), locate: id => {
    attempts.push(id)
    if (!width) return 'waiting'
    if (!nodes.includes(id)) return 'missing'
    located.push(id); return 'located'
  } })
  locator.retry(); assert.deepEqual(attempts, [])
  status = 'ready'; locator.retry(); assert.deepEqual(oldReplies, [])
  request = { id: 'latest-space-record', token: 11, local: true }; finish = result => replies.push(result)
  width = 800; locator.retry(); locator.retry()
  assert.deepEqual(located, ['latest-space-record'])
  assert.deepEqual(attempts, ['first-space-record', 'latest-space-record'])
  assert.deepEqual(oldReplies, []); assert.deepEqual(replies, [{ token: 11, ok: true }])
  // A removed UUID reports missing without substituting another record.
  nodes = ['replacement']; request = { id: 'latest-space-record', token: 12, local: true }
  locator.retry(); locator.retry()
  assert.deepEqual(replies[1], { token: 12, ok: false, reason: 'missing' })
  assert.equal(replies.length, 2)
  request = null; locator.retry(); locator.dispose()
  request = { id: 'replacement', token: 13, local: true }; locator.retry()
  assert.equal(replies.length, 2); assert.equal(attempts.length, 3)
})
test('a local request superseded by a legacy request cannot finish the stale token', () => {
  let request = { id: 'space-record', token: 20, local: true }
  const replies = [], located = []
  const locator = createGraphLocator({ latest: () => ({ request, status: 'ready', finish: result => replies.push(result) }), locate: id => {
    located.push(id)
    if (id === 'space-record') request = { id: 'quick-open-record', token: 21 }
    return 'located'
  } })
  locator.retry(); assert.deepEqual(replies, [])
  locator.retry(); locator.retry()
  assert.deepEqual(located, ['space-record', 'quick-open-record'])
  assert.deepEqual(replies, [{ token: 21, ok: true }])
})
