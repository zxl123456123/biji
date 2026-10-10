import type { Transaction } from './types'
import { dateKey, monthTotals, selectMonth } from './recordTools.ts'

export type TransactionDraft = Omit<Transaction, 'id' | 'updatedAt'>

export function parseLedgerDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number(value.slice(0, 4)) < 1) return null
  const date = new Date(`${value}T12:00:00`)
  return Number.isFinite(date.getTime()) && dateKey(date) === value ? date : null
}

export function transactionDate(value: string, item?: Transaction): string | null {
  const date = parseLedgerDate(value)
  if (!date) return null
  return item && dateKey(new Date(item.createdAt)) === value ? item.createdAt : date.toISOString()
}

export function monthDate(month: string): Date {
  return parseLedgerDate(`${month}-01`)!
}

export function shiftLedgerMonth(month: string, delta: number): string {
  const date = monthDate(month)
  date.setMonth(date.getMonth() + delta)
  return dateKey(date).slice(0, 7)
}

export function defaultLedgerDate(month: string, now = new Date()): string {
  const current = dateKey(now)
  return current.startsWith(`${month}-`) ? current : `${month}-01`
}

export function ledgerYear(items: readonly Transaction[], year: number) {
  return Array.from({ length: 12 }, (_, index) => {
    const month = `${String(year).padStart(4, '0')}-${String(index + 1).padStart(2, '0')}`
    const entries = selectMonth(items, monthDate(month))
    return { month, count: entries.length, ...monthTotals(entries) }
  })
}

export function ledgerDays(items: readonly Transaction[]) {
  const groups = new Map<string, Transaction[]>()
  const sorted = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() || a.id.localeCompare(b.id))
  for (const item of sorted) {
    const day = dateKey(new Date(item.createdAt))
    if (!groups.has(day)) groups.set(day, [])
    groups.get(day)!.push(item)
  }
  return [...groups].map(([day, entries]) => ({ day, entries, ...monthTotals(entries) }))
}
