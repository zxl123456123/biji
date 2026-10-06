import test from 'node:test'
import assert from 'node:assert/strict'
import { searchPreview } from '../src/searchPreview.ts'
import { noteSearchData, selectNotes } from '../src/recordTools.ts'
import { matchingRecords } from '../src/recordNavigation.ts'

const marks = parts => parts.filter(part => part.match).map(part => part.text)
const filter = query => ({ query, tag: null, unfinished: false, trash: false })
const note = content => ({ id: 'a', content, createdAt: '2026-10-04T00:00:00Z', status: 'none', done: false })

test('preview brings a late first match into context without changing the original characters', () => {
  const text = '开头'.repeat(150) + '报销凭证' + '后续'.repeat(80), parts = searchPreview(text, ' 报销凭证 ')
  assert.deepEqual(marks(parts), ['报销凭证'])
  assert.equal(parts[0].text, '…')
  assert.equal(parts.at(-1).text, '…')
  assert.equal(parts.slice(1, -1).map(part => part.text).join(''), text.slice(284, 404))
  assert.equal(searchPreview('命中再命中', '命中').filter(part => part.match).length, 1)
})

test('lowercase expansion maps to the original glyph and does not shift later matches', () => {
  assert.deepEqual(marks(searchPreview('İ ABC 尾', 'abc')), ['ABC'])
  for (const query of ['i', '\u0307']) assert.deepEqual(marks(searchPreview('İ ABC', query)), ['İ'])
  assert.deepEqual(marks(searchPreview('ΟΣ ABC', 'ος')), ['ΟΣ'])
})

test('preview boundaries and highlights preserve complete emoji and combining graphemes', () => {
  const family = '👨‍👩‍👧‍👦', text = '前'.repeat(130) + family + ' Cafe\u0301后🙂结束'
  assert.deepEqual(marks(searchPreview(text, '👩')), [family])
  assert.deepEqual(marks(searchPreview(text, 'fe\u0301')), ['fe\u0301'])
  assert.deepEqual(marks(searchPreview(text, '\u0301')), ['e\u0301'])
  const window = searchPreview('前'.repeat(16) + family + '后'.repeat(140), family)
  assert.equal(window.slice(0, -1).map(part => part.text).join(''), '前'.repeat(16) + family + '后'.repeat(103))
  assert.deepEqual(marks(searchPreview(text, 'café')), [])
})

test('blank and missing queries keep a safe leading preview with no highlight', () => {
  assert.deepEqual(searchPreview('', ''), [])
  assert.deepEqual(searchPreview('正文', '  '), [{ text: '正文', match: false }])
  assert.deepEqual(searchPreview('正文', '缺失'), [{ text: '正文', match: false }])
  assert.deepEqual(marks(searchPreview('长'.repeat(160), '长'.repeat(150))), ['长'.repeat(150)])
})

test('joined tags and displayed HTML-like code remain searchable preview text', () => {
  const source = [note('收尾\n#旅行 #Work')]
  for (const query of ['#旅行', '收尾 #旅行', '#旅行 #Work']) {
    assert.deepEqual(selectNotes(source, filter(query)), matchingRecords(source, query))
    assert.deepEqual(marks(searchPreview(noteSearchData(source[0]).text, query)), [query])
  }
  const tick = String.fromCharCode(96), code = note(tick + '**字面** #代码 </mark><img src=x onerror=alert(1)>' + tick + '\n#旅行')
  assert.deepEqual(noteSearchData(code).tags, ['旅行'])
  assert.deepEqual(marks(searchPreview(noteSearchData(code).text, '</mark><img')), ['</mark><img'])
  assert.equal(selectNotes([code], filter('**字面**'))[0], code)
})

test('cached search data is reused but follows changed content and replacement records', () => {
  const record = note('柔**和** #体验'), first = noteSearchData(record)
  assert.equal(noteSearchData(record), first)
  record.content = '新_正文_ #工作'
  const next = noteSearchData(record)
  assert.notEqual(next, first)
  assert.deepEqual(next.tags, ['工作'])
  assert.equal(selectNotes([record], filter('新正文'))[0], record)
  assert.deepEqual(selectNotes([record], filter('柔和')), [])
  assert.notEqual(noteSearchData({ ...record }), next)
})
