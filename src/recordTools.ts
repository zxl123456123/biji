import type { Note, Transaction } from './types'
import { notePlain, parseNote, splitProtectedCode } from './noteCodec.ts'

export const money = (n: number) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(n)
export const dateKey = (d = new Date()) => new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
export const today = () => dateKey()
export const dateLabel = (s?: string) => s ? new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date(`${s}T12:00:00`)) : ''
const TAG_PATTERN = /#[\p{L}\p{N}_-]+/gu
export const tagsFor = (content: string) => splitProtectedCode(content).flatMap(part => part.code ? [] : (part.text.match(TAG_PATTERN) ?? []).map(tag => tag.slice(1)))
export const withoutTags = (content: string) => {
  const parts = splitProtectedCode(content)
  return parts.map((part, index) => {
    if (part.code) return part.text
    let text = part.text.replace(TAG_PATTERN, '').replace(/[ \t]+\n/g, '\n')
    if (index === 0) text = text.trimStart()
    if (index === parts.length - 1) text = text.trimEnd()
    return text
  }).join('')
}
export const normaliseTag = (tag: string) => tag.trim().replace(/^#/, '').replace(/\s+/g, '-')
export const contentWithTags = (content: string, tags: string[]) => [content.trim(), ...tags.map(tag => `#${tag}`)].filter(Boolean).join('\n')

export type NoteFilter = { query: string; tag: string | null; unfinished: boolean; trash: boolean }

const searchCache = new WeakMap<Note, { content: string; body: string; tags: string[]; text: string; lower: string }>()
export function noteSearchData(note: Note) {
  const cached = searchCache.get(note)
  if (cached?.content === note.content) return cached
  const body = notePlain(parseNote(withoutTags(note.content))), tags = tagsFor(note.content)
  const text = body + ' ' + tags.map(tag => `#${tag}`).join(' ')
  const data = { content: note.content, body, tags, text, lower: text.toLowerCase() }
  searchCache.set(note, data)
  return data
}

export function selectNotes(notes: readonly Note[], filter: NoteFilter): Note[] {
  const query = filter.query.trim().toLowerCase()
  return notes.filter(note =>
    Boolean(note.deletedAt) === filter.trash &&
    (!filter.unfinished || !note.done) &&
    (!filter.tag || tagsFor(note.content).includes(filter.tag)) &&
    (!query || noteSearchData(note).lower.includes(query)),
  )
}

export function selectMonth(items: readonly Transaction[], now = new Date()): Transaction[] {
  return items.filter(item => {
    const date = new Date(item.createdAt)
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
  })
}

export function monthTotals(items: readonly Transaction[]): { income: number; expense: number } {
  return items.reduce((totals, item) => {
    totals[item.kind] += item.amount
    return totals
  }, { income: 0, expense: 0 })
}
