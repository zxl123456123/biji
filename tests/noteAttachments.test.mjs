import test from 'node:test'
import assert from 'node:assert/strict'
import { validateAttachments, readAttachments, isPreviewImage, MAX_ATTACHMENT_BYTES } from '../src/attachmentFiles.ts'
import { exportData, importBackupData } from '../src/store.ts'

const file = { id: 'file-1', name: '合同.pdf', mime: 'application/pdf', size: 3, data: 'data:application/pdf;base64,YWJj' }
const note = { id: 'n1', content: '', status: 'none', createdAt: '2026-10-10T00:00:00Z', done: false, attachments: [file] }
test('attachment-only notes and original file bytes survive JSON backup including trash', () => {
  const backup = JSON.parse(JSON.stringify(exportData([{ ...note, deletedAt: '2026-10-10T01:00:00Z', pinned: true }], [], [])))
  assert.deepEqual(importBackupData(backup, []).data, backup)
})
test('malformed attachment backups fail before replacing notes', () => {
  for (const invalid of [null, {}, [{ ...file, data: 'https://example.com/image.png' }], [{ ...file, size: 4 }], [{ ...file, data: 'data:text/html;base64,YWJj' }], [file, file]]) {
    assert.throws(() => importBackupData({ notes: [{ ...note, attachments: invalid }], transactions: [] }, []), /附件/)
  }
})
test('only raster images preview; SVG and HTML stay downloadable files', () => {
  for (const mime of ['image/png', 'image/jpeg', 'image/webp']) assert.equal(isPreviewImage({ ...file, mime }), true)
  for (const mime of ['image/svg+xml', 'text/html', 'application/pdf']) assert.equal(isPreviewImage({ ...file, mime }), false)
})
test('oversized additions reject before reading files and leave existing files untouched', async () => {
  await assert.rejects(readAttachments([{ size: MAX_ATTACHMENT_BYTES + 1 }], [file]), /20 MB/)
  await assert.rejects(readAttachments(Array.from({ length: 3 }, () => ({ size: MAX_ATTACHMENT_BYTES })), [file]), /50 MB/)
  assert.equal(file.data, 'data:application/pdf;base64,YWJj')
})
test('empty file is valid; broken base64 padding and truncated bytes are rejected', () => {
  validateAttachments([{ ...file, size: 0, data: 'data:application/pdf;base64,' }])
  assert.throws(() => validateAttachments([{ ...file, size: 0, data: 'https://example.com' }]), /附件/)
  for (const data of ['data:application/pdf;base64,YW==', 'data:application/pdf;base64,YWJ!', 'data:application/pdf;base64,YWJjAA==']) assert.throws(() => validateAttachments([{ ...file, data }]), /附件/)
})
test('a file at the 20 MB limit validates without regex stack overflow', () => {
  const data = `data:application/pdf;base64,${Buffer.alloc(MAX_ATTACHMENT_BYTES).toString('base64')}`
  validateAttachments([{ ...file, size: MAX_ATTACHMENT_BYTES, data }])
})
