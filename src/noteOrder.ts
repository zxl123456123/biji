import type { Note } from './types'
import { presentedGroups } from './notePresentation.ts'
import type { NoteLayout } from './notePresentation.ts'

export function sameIds(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((id, index) => id === b[index])
}

export function reorderVisible(full: Note[], beforeIds: readonly string[], afterIds: readonly string[]): Note[] {
  const ids = new Set(beforeIds)
  if (!ids.size || ids.size !== beforeIds.length || afterIds.length !== ids.size || new Set(afterIds).size !== ids.size || afterIds.some(id => !ids.has(id))) return full
  const selected = full.filter(note => ids.has(note.id))
  if (!sameIds(selected.map(note => note.id), beforeIds) || selected.some(note => !!note.deletedAt) || selected.some(note => !!note.pinned !== !!selected[0].pinned)) return full
  if (sameIds(beforeIds, afterIds)) return full
  const byId = new Map(selected.map(note => [note.id, note]))
  let index = 0
  return full.map(note => ids.has(note.id) ? byId.get(afterIds[index++])! : note)
}

export function toggleNotePin(full: Note[], id: string): Note[] {
  const note = full.find(note => note.id === id && !note.deletedAt)
  if (!note) return full
  return full.map(item => item === note ? { ...item, pinned: !item.pinned } : item)
}

export function reorderInCurrentView(full: Note[], filtered: Note[], layout: NoteLayout, beforeIds: readonly string[], afterIds: readonly string[]) {
  const group = presentedGroups(filtered, layout, Infinity).find(group => beforeIds.includes(group.notes[0].id))
  if (!group || !sameIds(group.notes.slice(0, beforeIds.length).map(note => note.id), beforeIds)) return full
  return reorderVisible(full, beforeIds, afterIds)
}

export type DropRect = { left: number; top: number; right: number; bottom: number }
export function insideVisibleGroup(x: number, y: number, rect: DropRect, width: number, height: number) {
  const left = Math.max(0, rect.left), top = Math.max(0, rect.top)
  const right = Math.min(width, rect.right), bottom = Math.min(height, rect.bottom)
  return Number.isFinite(x) && Number.isFinite(y) && left < right && top < bottom && x >= left && x <= right && y >= top && y <= bottom
}

export function validDropPosition(keyboard: boolean, event: { type: string; clientX?: number; clientY?: number } | undefined, rect: DropRect | undefined, width: number, height: number) {
  if (keyboard) return true
  return event?.type === 'pointerup' && typeof event.clientX === 'number' && typeof event.clientY === 'number' && !!rect &&
    insideVisibleGroup(event.clientX, event.clientY, rect, width, height)
}

export function movedIds(ids: readonly string[], from: number, to: number): string[] | null {
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < 0 || from >= ids.length || to >= ids.length || from === to) return null
  const ordered = [...ids]
  ordered.splice(to, 0, ordered.splice(from, 1)[0])
  return ordered
}
