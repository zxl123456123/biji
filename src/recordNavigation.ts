import type { Note } from './types.ts'
import { selectNotes, tagsFor } from './recordTools.ts'

export function collectTags(notes: readonly Note[]) {
  return [...new Set(notes.filter(note => !note.deletedAt).flatMap(note => tagsFor(note.content)))].sort((a, b) => a.localeCompare(b, 'zh-CN'))
}
export const filterTags = (tags: readonly string[], query: string) => tags.filter(tag => tag.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
export function matchingRecords(notes: readonly Note[], query: string) {
  return selectNotes(notes, { query, tag: null, unfinished: false, trash: false })
}
export const currentRecord = (notes: readonly Note[], id: string) => notes.find(note => note.id === id && !note.deletedAt)
export const activeRecordId = (notes: readonly Pick<Note, 'id'>[], id: string) => notes.some(note => note.id === id) ? id : notes[0]?.id ?? ''
export const ignoreNavigationKey = (event: { isComposing: boolean; keyCode: number; repeat: boolean }) => event.isComposing || event.keyCode === 229 || event.repeat

// A single owned frame lets the closing dialog restore focus before editing.
export function createEditHandoff(options: {
  notes: () => readonly Note[]; schedule: (run: () => void) => number; cancel: (frame: number) => void
  open: (note: Note) => void; missing: () => void
}) {
  let pending: { id: string; frame: number } | null = null, disposed = false
  const cancel = () => { if (pending) options.cancel(pending.frame); pending = null }
  return {
    cancel,
    open: (id: string) => {
      cancel()
      if (disposed) return
      if (!currentRecord(options.notes(), id)) { options.missing(); return }
      const request = { id, frame: 0 }; pending = request
      request.frame = options.schedule(() => {
        if (disposed || pending !== request) return
        pending = null
        const note = currentRecord(options.notes(), request.id)
        if (note) options.open(note); else options.missing()
      })
    },
    dispose: () => { disposed = true; cancel() },
  }
}
