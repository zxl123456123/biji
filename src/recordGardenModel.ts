import type { Note } from './types'

export type RecordDateBasis = 'created' | 'record'
export type RecordDay = { date: string; day: number; count: number; doneCount: number }
export type RecordGardenModel = { days: Map<string, Note[]>; undated: Note[] }

export function validDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T12:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function localDateKey(date = new Date()): string {
  if (!Number.isFinite(date.getTime())) return ''
  const year = date.getFullYear()
  if (year < 0 || year > 9999) return ''
  return `${String(year).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function buildRecordGardenModel(notes: readonly Note[], basis: RecordDateBasis): RecordGardenModel {
  const days = new Map<string, Note[]>(), undated: Note[] = []
  for (const note of notes) {
    if (note.deletedAt) continue
    // Date parsing can normalize an impossible ISO calendar date into another day.
    const civilDate = /^\d{4}-\d{2}-\d{2}(?=T|\s|$)/.exec(note.createdAt.trim())?.[0]
    let key = civilDate && !validDateKey(civilDate) ? '' : localDateKey(new Date(note.createdAt))
    // An explicit invalid record date stays undated instead of falling back.
    if (basis === 'record' && note.scheduledDate) key = validDateKey(note.scheduledDate) ? note.scheduledDate : ''
    if (!key) { undated.push(note); continue }
    const rows = days.get(key)
    if (rows) rows.push(note)
    else days.set(key, [note])
  }
  return { days, undated }
}

function monthDate(month: string): Date {
  if (!validDateKey(`${month}-01`)) throw new RangeError('月份格式必须为 YYYY-MM')
  // UTC calendar components avoid DST gaps while keeping date keys unchanged.
  return new Date(`${month}-01T12:00:00Z`)
}

export function monthDays(month: string, model: RecordGardenModel): RecordDay[] {
  const end = monthDate(month)
  end.setUTCMonth(end.getUTCMonth() + 1, 0)
  return Array.from({ length: end.getUTCDate() }, (_, index) => {
    const day = index + 1, date = `${month}-${String(day).padStart(2, '0')}`
    const notes = model.days.get(date) ?? []
    return { date, day, count: notes.length, doneCount: notes.reduce((count, note) => count + Number(note.done), 0) }
  })
}

export function monthCells(month: string, model: RecordGardenModel): (RecordDay | null)[] {
  const leading = (monthDate(month).getUTCDay() + 6) % 7
  const cells: (RecordDay | null)[] = [...Array<RecordDay | null>(leading).fill(null), ...monthDays(month, model)]
  while (cells.length % 7) cells.push(null)
  return cells
}

export function shiftMonth(month: string, delta: number): string {
  const date = monthDate(month)
  if (!Number.isInteger(delta)) throw new RangeError('月份偏移必须为整数')
  date.setUTCMonth(date.getUTCMonth() + delta)
  const next = `${String(date.getUTCFullYear()).padStart(4, '0')}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
  if (!validDateKey(`${next}-01`)) throw new RangeError('月份超出支持的日期范围')
  return next
}

export function dayLabel(date: string): string {
  if (!validDateKey(date)) return '未指定日期'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`))
}
