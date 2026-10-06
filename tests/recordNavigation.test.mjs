import test from 'node:test'
import assert from 'node:assert/strict'
import { activeRecordId, collectTags, createEditHandoff, filterTags, ignoreNavigationKey, matchingRecords } from '../src/recordNavigation.ts'

const record = (id, content, extra = {}) => Object.freeze({ id, content, status: 'none', createdAt: '2026-10-03T00:00:00Z', done: false, ...extra })
test('all active tags remain searchable beyond ten without changing exact names', () => {
  const notes = Object.freeze([record('a', Array.from({ length: 18 }, (_, i) => `#主题${String(i + 1).padStart(2, '0')}`).join(' ') + ' #Work #work #旅行 #旅行计划'), record('trash', '#只有回收站', { deletedAt: '2026-10-03' })])
  const tags = collectTags(notes)
  assert.equal(tags.length, 22)
  assert.ok(tags.includes('主题18')); assert.ok(tags.includes('Work')); assert.ok(tags.includes('work'))
  assert.deepEqual(filterTags(tags, ' 主 题 '), [])
  assert.deepEqual(filterTags(tags, '主题18'), ['主题18'])
  assert.deepEqual(filterTags(tags, 'WORK'), ['work', 'Work'].sort((a, b) => a.localeCompare(b, 'zh-CN')))
  assert.equal(notes[0].content.includes('#主题18'), true)
  assert.equal(tags.includes('只有回收站'), false)
})
test('quick open searches the entire active source before UI batching and keeps duplicate UUIDs', () => {
  const notes = Object.freeze([...Array.from({ length: 45 }, (_, i) => record(String(i), '同名正文 #旅行')), record('last', '**唯一正文** #主题18'), record('trash', '唯一正文 #主题18', { deletedAt: '2026-10-03' })])
  assert.deepEqual(matchingRecords(notes, '唯一正文').map(n => n.id), ['last'])
  assert.deepEqual(matchingRecords(notes, '#主题18').map(n => n.id), ['last'])
  assert.equal(matchingRecords(notes, '旅行').length, 45)
  assert.deepEqual(matchingRecords(notes, '同名').slice(0, 2).map(n => n.id), ['0', '1'])
  assert.equal(activeRecordId(matchingRecords(notes, '同名'), '1'), '1')
  assert.equal(activeRecordId(matchingRecords(notes, '唯一正文'), '1'), 'last')
  assert.equal(activeRecordId([], '1'), '')
  assert.equal(notes.length, 47)
})
test('navigation keys leave IME confirmation and repeated events untouched', () => {
  const base = { isComposing: false, keyCode: 13, repeat: false }
  assert.equal(ignoreNavigationKey(base), false)
  for (const extra of [{ isComposing: true }, { keyCode: 229 }, { repeat: true }]) assert.equal(ignoreNavigationKey({ ...base, ...extra }), true)
})
function handoffFixture() {
  let notes = [record('a', '旧内容'), record('b', '同名内容')], next = 0
  const frames = new Map(), opened = [], missing = [], cancelled = []
  const handoff = createEditHandoff({ notes: () => notes, schedule: run => { const id = ++next; frames.set(id, run); return id }, cancel: id => { cancelled.push(id) }, open: note => opened.push(note), missing: () => missing.push(true) })
  return { handoff, frames, opened, missing, cancelled, update: value => { notes = value } }
}
test('editing re-reads the latest UUID at frame execution, including content updates and disappearance', () => {
  const f = handoffFixture()
  f.handoff.open('a'); f.update([record('a', '最新正文')]); f.frames.get(1)()
  assert.equal(f.opened[0].content, '最新正文')
  f.handoff.open('a'); f.update([record('a', '最新正文', { deletedAt: '2026-10-03' })]); f.frames.get(2)()
  assert.equal(f.opened.length, 1); assert.equal(f.missing.length, 1)
  f.update([record('a', '原 UUID')]); f.handoff.open('a'); f.update([record('replacement', '原 UUID')]); f.frames.get(3)()
  assert.equal(f.opened.length, 1); assert.equal(f.missing.length, 2)
})
test('new actions, navigation cancellation and unmount reject already queued editing frames', () => {
  const f = handoffFixture()
  f.handoff.open('a'); f.handoff.open('b'); f.frames.get(1)(); f.frames.get(2)()
  assert.deepEqual(f.opened.map(n => n.id), ['b'])
  f.handoff.open('a'); f.handoff.cancel(); f.frames.get(3)()
  f.handoff.open('a'); f.handoff.dispose(); f.frames.get(4)(); f.handoff.open('b')
  assert.equal(f.opened.length, 1); assert.deepEqual(f.cancelled, [1, 3, 4])
  const fresh = handoffFixture(); fresh.handoff.open('a'); fresh.frames.get(1)()
  assert.equal(fresh.opened.length, 1)
})
