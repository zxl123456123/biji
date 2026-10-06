import test from 'node:test'
import assert from 'node:assert/strict'
import { selectNotes, selectMonth, monthTotals } from '../src/recordTools.ts'
import { matchingRecords } from '../src/recordNavigation.ts'

const note = (id, content, extra = {}) => Object.freeze({ id, content, status: 'none', createdAt: '2026-10-02T12:00:00', done: false, ...extra })
const notes = Object.freeze([
  note('a', '机票 #旅行 #Work'),
  note('b', '机票 #旅行计划'),
  note('c', '机票 #旅行', { done: true }),
  note('d', '机票 #旅行', { deletedAt: '2026-10-02T13:00:00' }),
  note('e', '正文旅行，不是标签 #work'),
])
const filter = (extra = {}) => ({ query: '', tag: null, unfinished: false, trash: false, ...extra })
for (const [name, conditions, expected] of [
  ['exact tag excludes similar tags and plain mentions', { tag: '旅行' }, ['a', 'c']],
  ['tag names remain case sensitive', { tag: 'Work' }, ['a']],
  ['lowercase tag is a different tag', { tag: 'work' }, ['e']],
  ['query is trimmed and case insensitive', { query: '  wOrK  ' }, ['a', 'e']],
  ['query, tag and unfinished compose with AND', { query: '机票', tag: '旅行', unfinished: true }, ['a']],
  ['trash does not leak active records', { trash: true }, ['d']],
  ['clearing all filters restores source order', {}, ['a', 'b', 'c', 'e']],
  ['missing result returns an empty array', { query: '不存在' }, []],
]) {
  test(name, () => assert.deepEqual(selectNotes(notes, filter(conditions)).map(n => n.id), expected))
}
test('selectors preserve records and do not mutate the source', () => {
  const result = selectNotes(notes, filter())
  assert.notEqual(result, notes)
  assert.equal(result[0], notes[0])
  assert.deepEqual(notes.map(n => n.id), ['a', 'b', 'c', 'd', 'e'])
})

test('main search and quick open agree on visible phrases across formatting', () => {
  const source = [note('bold', '想要柔**和**交互 #体验'), note('italic', '想要柔_和_交互 #体验')]
  const main = selectNotes(source, filter({ query: '柔和交互' }))
  const quick = matchingRecords(source, '柔和交互')
  assert.deepEqual(main.map(item => item.id), ['bold', 'italic'])
  assert.deepEqual(main, quick)
  assert.equal(main[0], source[0])
})

test('search finds displayed code literals but does not expose hidden formatting syntax', () => {
  const tick = String.fromCharCode(96)
  const source = [note('format', '**文字**'), note('code', tick + '**文字** #代码' + tick)]
  assert.deepEqual(selectNotes(source, filter({ query: '**' })).map(item => item.id), ['code'])
  assert.deepEqual(matchingRecords(source, '**').map(item => item.id), ['code'])
  assert.deepEqual(selectNotes(source, filter({ query: '#代码' })).map(item => item.id), ['code'])
})

test('visible-text search retains exact tag, completion, trash and source-order filters', () => {
  const source = [note('a', '柔**和**交互 #体验'), note('done', '柔和交互 #体验', { done: true }), note('similar', '柔和交互 #体验计划'), note('trash', '柔**和**交互 #体验', { deletedAt: '2026-10-04' })]
  assert.deepEqual(selectNotes(source, filter({ query: '柔和交互', tag: '体验', unfinished: true })).map(item => item.id), ['a'])
  assert.deepEqual(selectNotes(source, filter({ query: '柔和交互', trash: true })).map(item => item.id), ['trash'])
  assert.deepEqual(matchingRecords(source, '柔和交互').map(item => item.id), ['a', 'done', 'similar'])
})

const transaction = (id, date, kind = 'expense', amount = 10) => Object.freeze({ id, createdAt: date, kind, amount, category: '其他', note: '' })
const items = Object.freeze([
  transaction('previous', new Date(2025, 11, 31, 23, 59, 59).toISOString()),
  transaction('first', new Date(2026, 0, 1, 0, 0, 0).toISOString(), 'income', 200),
  transaction('last', new Date(2026, 0, 31, 23, 59, 59).toISOString(), 'expense', 25.5),
  transaction('next', new Date(2026, 1, 1, 0, 0, 0).toISOString()),
  transaction('invalid', 'invalid'),
])
test('month selection respects local midnight and cross-year boundaries', () => {
  const month = selectMonth(items, new Date(2026, 0, 15))
  assert.deepEqual(month.map(t => t.id), ['first', 'last'])
  assert.equal(month[0], items[1])
  assert.deepEqual(monthTotals(month), { income: 200, expense: 25.5 })
})
test('previous year and following month remain separately selectable', () => {
  assert.deepEqual(selectMonth(items, new Date(2025, 11, 15)).map(t => t.id), ['previous'])
  assert.deepEqual(selectMonth(items, new Date(2026, 1, 15)).map(t => t.id), ['next'])
})
test('empty month has zero totals and invalid dates are excluded', () => {
  assert.deepEqual(selectMonth(items, new Date(2026, 2, 15)), [])
  assert.deepEqual(monthTotals([]), { income: 0, expense: 0 })
})
