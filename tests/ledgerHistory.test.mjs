import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultLedgerDate, ledgerDays, ledgerYear, parseLedgerDate, shiftLedgerMonth, transactionDate } from '../src/ledgerTools.ts'
import { selectMonth } from '../src/recordTools.ts'

const txn = (id, date, kind = 'expense', amount = 10) => Object.freeze({ id, createdAt: new Date(`${date}T12:00:00`).toISOString(), kind, amount, category: '餐饮', note: '' })

test('local occurrence dates support leap days and reject missing, rolled and out-of-range days', () => {
  assert.equal(parseLedgerDate('2024-02-29').getDate(), 29)
  for (const date of ['', '2023-02-29', '2024-02-30', '2026-13-01', '0000-01-01', '10000-01-01']) assert.equal(parseLedgerDate(date), null)
  const saved = transactionDate('2024-02-29')
  assert.equal(new Date(saved).getFullYear(), 2024)
  assert.equal(new Date(saved).getMonth(), 1)
  assert.equal(new Date(saved).getDate(), 29)
})

test('editing details preserves the original timestamp; moving the date moves the selected month', () => {
  const item = { ...txn('edit', '2026-10-10'), createdAt: new Date(2026, 9, 10, 0, 0, 1).toISOString() }
  assert.equal(transactionDate('2026-10-10', item), item.createdAt)
  const edited = { ...item, createdAt: transactionDate('2025-12-31', item) }
  assert.deepEqual(selectMonth([edited], new Date(2026, 9, 1)), [])
  assert.deepEqual(selectMonth([edited], new Date(2025, 11, 1)), [edited])
  assert.equal(transactionDate('2026-02-30', item), null)
})

test('month navigation crosses years; historical creation stays within its selected month', () => {
  assert.equal(shiftLedgerMonth('2026-01', -1), '2025-12')
  assert.equal(shiftLedgerMonth('2025-12', 1), '2026-01')
  assert.equal(shiftLedgerMonth('2024-02', 12), '2025-02')
  assert.equal(defaultLedgerDate('2026-10', new Date(2026, 9, 10)), '2026-10-10')
  assert.equal(defaultLedgerDate('2024-02', new Date(2026, 9, 10)), '2024-02-01')
})

test('year overview covers twelve months and recomputes after edit and delete', () => {
  const items = [txn('old', '2025-12-31', 'income', 999), txn('a', '2026-01-01', 'income', 100), txn('b', '2026-02-28', 'expense', 20)]
  const year = ledgerYear(items, 2026)
  assert.equal(year.length, 12)
  assert.deepEqual(year[0], { month: '2026-01', count: 1, income: 100, expense: 0 })
  assert.equal(year[1].expense, 20)
  assert.equal(year[11].count, 0)
  assert.equal(ledgerYear(items.filter(item => item.id !== 'b'), 2026)[1].expense, 0)
  assert.equal(ledgerYear(items.map(item => item.id === 'b' ? { ...item, createdAt: transactionDate('2026-01-31') } : item), 2026)[0].expense, 20)
})

test('date groups descend and same timestamp order stays deterministic across storage sources', () => {
  const a = txn('a', '2026-10-01'), b = txn('b', '2026-10-01', 'income', 50), c = txn('c', '2026-10-02')
  const source = Object.freeze([b, a, c])
  const result = ledgerDays(source)
  assert.deepEqual(result.map(group => group.day), ['2026-10-02', '2026-10-01'])
  assert.deepEqual(result[1].entries.map(item => item.id), ['a', 'b'])
  assert.equal(result[1].income, 50)
  assert.equal(result[1].expense, 10)
  assert.deepEqual(ledgerDays([c, a, b]), result)
  assert.deepEqual(source, [b, a, c])
})
