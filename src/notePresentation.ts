import type { Note } from './types'
import { dateKey } from './recordTools.ts'

export function groupNotesByDate(notes: readonly Note[]) {
  const groups = new Map<string, Note[]>()
  for (const note of notes) {
    const date = new Date(note.createdAt)
    const scheduledDate = note.scheduledDate ? new Date(note.scheduledDate) : null
    const scheduled = note.scheduledDate && /^\d{4}-\d{2}-\d{2}$/.test(note.scheduledDate) && !isNaN(scheduledDate!.getTime()) && scheduledDate!.toISOString().slice(0,10) === note.scheduledDate
    const key = note.scheduledDate ? scheduled ? note.scheduledDate : '未指定日期' : !isNaN(date.getTime()) ? dateKey(date) : '未指定日期'
    groups.set(key, [...(groups.get(key) ?? []), note])
  }
  return [...groups].sort(([a], [b]) => b.localeCompare(a))
}
export type NoteLayout = 'grid' | 'reading' | 'date'
export type NoteGroup = { id: string; notes: Note[]; date?: string }

export function presentedNotes(notes: readonly Note[], layout: NoteLayout, limit: number, trash = false) {
  const pins = trash ? [] : notes.filter(note => !!note.pinned)
  const regular = trash ? notes : notes.filter(note => !note.pinned)
  const ordered = [...pins, ...(layout === 'date' ? groupNotesByDate(regular).flatMap(([, group]) => group) : regular)]
  return ordered.slice(0, limit)
}

export function presentedGroups(notes: readonly Note[], layout: NoteLayout, limit: number, trash = false): NoteGroup[] {
  const shown = presentedNotes(notes, layout, limit, trash)
  const pins = trash ? [] : shown.filter(note => !!note.pinned)
  const regular = trash ? shown : shown.filter(note => !note.pinned)
  const groups: NoteGroup[] = pins.length ? [{ id: 'pinned', notes: pins }] : []
  if (layout === 'date') {
    groups.push(...groupNotesByDate(regular).map(([date, items]) => ({ id: `date:${date}`, date, notes: items })))
  } else if (regular.length) {
    groups.push({ id: 'regular', notes: regular })
  }
  return groups
}
