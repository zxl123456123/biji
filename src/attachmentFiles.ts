import type { NoteAttachment } from './types'

export const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024
export const MAX_NOTE_ATTACHMENT_BYTES = 50 * 1024 * 1024
export const isPreviewImage = (file: NoteAttachment) => /^(image\/(png|jpeg|gif|webp|bmp|avif))$/.test(file.mime)
export function validateAttachments(value: unknown): asserts value is NoteAttachment[] {
  if (!Array.isArray(value)) throw new Error('附件格式不正确')
  let total = 0
  const ids = new Set<string>()
  for (const file of value) {
    if (!file || typeof file.id !== 'string' || !file.id || ids.has(file.id) || typeof file.name !== 'string' || !file.name || typeof file.mime !== 'string' || !/^[\w.+-]+\/[\w.+-]+$/.test(file.mime) || !Number.isSafeInteger(file.size) || file.size < 0 || file.size > MAX_ATTACHMENT_BYTES || typeof file.data !== 'string') throw new Error('附件格式或大小不正确')
    const prefix = `data:${file.mime};base64,`
    const body = file.data.startsWith(prefix) ? file.data.slice(prefix.length) : ''
    if (!file.data.startsWith(prefix) || body.length !== 4 * Math.ceil(file.size / 3) || !/^[A-Za-z0-9+/]*={0,2}$/.test(body) || (body.length * 3 / 4 - (body.endsWith('==') ? 2 : body.endsWith('=') ? 1 : 0)) !== file.size) throw new Error('附件内容不完整')
    ids.add(file.id)
    total += file.size
  }
  if (total > MAX_NOTE_ATTACHMENT_BYTES) throw new Error('每条记录的附件合计不能超过 50 MB')
}
export async function readAttachments(files: File[], existing: NoteAttachment[]): Promise<NoteAttachment[]> {
  if (files.some(file => file.size > MAX_ATTACHMENT_BYTES)) throw new Error('单个文件不能超过 20 MB')
  if ([...files, ...existing].reduce((sum, file) => sum + file.size, 0) > MAX_NOTE_ATTACHMENT_BYTES) throw new Error('每条记录的附件合计不能超过 50 MB')
  const added: NoteAttachment[] = []
  for (const file of files) {
    const mime = /^[\w.+-]+\/[\w.+-]+$/.test(file.type) ? file.type : 'application/octet-stream'
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(`data:${mime};base64,${String(reader.result).split(',')[1]}`)
      reader.onerror = () => reject(new Error(`无法读取 ${file.name}`))
      reader.onabort = () => reject(new Error('文件读取已取消'))
      reader.readAsDataURL(file)
    })
    added.push({ id: crypto.randomUUID(), name: file.name, mime, size: file.size, data })
  }
  validateAttachments([...existing, ...added])
  return added
}
export function downloadAttachment(file: NoteAttachment) {
  const bytes = Uint8Array.from(atob(file.data.split(',')[1]), character => character.charCodeAt(0))
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/octet-stream' }))
  const link = document.createElement('a')
  link.href = url; link.download = file.name; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
}
