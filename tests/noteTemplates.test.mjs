import test from 'node:test'
import assert from 'node:assert/strict'
import { canUseTemplate, noteTemplates } from '../src/noteTemplates.ts'
import { noteHtml, notePlain, parseNote } from '../src/noteCodec.ts'
import { contentWithTags, tagsFor } from '../src/recordTools.ts'

test('templates require a new blank record without any recovered draft', () => {
  assert.equal(canUseTemplate({ hasNote: false, hasDraft: false, body: ' \n' }), true)
  for (const state of [
    { hasNote: true, hasDraft: false, body: '' },
    { hasNote: false, hasDraft: true, body: '' },
    { hasNote: false, hasDraft: true, body: '草稿' },
    { hasNote: false, hasDraft: false, body: '刚输入' },
    { hasNote: false, hasDraft: false, body: '', visibleText: '尚未同步的输入' },
  ]) assert.equal(canUseTemplate(state), false)
})
test('three fixed starter bodies have editable headings and preserve caller metadata', () => {
  assert.deepEqual(noteTemplates.map(template => template.name), ['日记', '会议纪要', '阅读随记'])
  const metadata = { tags: ['旅行'], date: '2026-10-03' }
  for (const template of noteTemplates) {
    const blocks = parseNote(template.body)
    assert.ok(noteHtml(blocks).startsWith('<h2>'))
    assert.equal(notePlain(blocks).includes('#'), false)
    assert.ok(notePlain(blocks).length > 10)
    const stored = contentWithTags(template.body, metadata.tags)
    assert.deepEqual(tagsFor(stored), metadata.tags)
  }
  assert.deepEqual(metadata, { tags: ['旅行'], date: '2026-10-03' })
})
