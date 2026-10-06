import type { Note } from './types.ts'
import type { GraphState } from './useNoteGraph.ts'
import { buildRecordGardenModel, monthDays } from './recordGardenModel.ts'

export type WheelDay = { key: string; day: number; count: number; noteIds: string[]; relatedIds: string[] }
export type WheelMonth = { month: number; key: string; days: WheelDay[]; count: number }
export type CelestialWheelModel =
  | { kind: 'missing' }
  | { kind: 'undated'; center: Note }
  | { kind: 'ready'; center: Note; centerDate: string; year: string; months: WheelMonth[]; daysByKey: Map<string, WheelDay>; relationStatus: GraphState['status'] }

export function buildCelestialWheelModel(entryId: string, notes: readonly Note[], graph: GraphState): CelestialWheelModel {
  const active = notes.filter(note => !note.deletedAt)
  const center = active.find(note => note.id === entryId)
  if (!center) return { kind: 'missing' }
  const garden = buildRecordGardenModel(active, 'created')
  const centerDate = [...garden.days].find(([, items]) => items.some(note => note.id === entryId))?.[0]
  if (!centerDate) return { kind: 'undated', center }
  const year = centerDate.slice(0, 4)
  const neighbors = new Set<string>()
  if (graph.status === 'ready' && graph.model) for (const edge of graph.model.edges) {
    if (edge.source === entryId) neighbors.add(edge.target)
    if (edge.target === entryId) neighbors.add(edge.source)
  }
  const daysByKey = new Map<string, WheelDay>()
  const months = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1, key = `${year}-${String(month).padStart(2, '0')}`
    const days = monthDays(key, garden).map(date => {
      const dayNotes = garden.days.get(date.date) ?? []
      const day: WheelDay = { key: date.date, day: date.day, count: dayNotes.length,
        noteIds: dayNotes.map(note => note.id), relatedIds: dayNotes.filter(note => neighbors.has(note.id)).map(note => note.id) }
      daysByKey.set(day.key, day)
      return day
    })
    return { month, key, days, count: days.reduce((total, day) => total + day.count, 0) }
  })
  return { kind: 'ready', center, centerDate, year, months, daysByKey, relationStatus: graph.status }
}
