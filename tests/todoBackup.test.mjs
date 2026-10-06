import test from 'node:test'
import assert from 'node:assert/strict'
import { importBackupData } from '../src/store.ts'

const notes = [{ id: 'note-1', content: '记录', status: 'none', createdAt: '2026-10-06T00:00:00Z', done: false }]
const currentTodos = [{ id: 'todo-1', title: '保留待办', dueDate: '2026-10-06', done: false, createdAt: '2026-10-06T00:00:00Z' }]

test('old backup replaces notes and transactions while retaining current todos', () => {
  const result = importBackupData({ version: 1, notes, transactions: [] }, currentTodos)
  assert.equal(result.keptExistingTodos, true)
  assert.deepEqual(result.data.notes, notes)
  assert.equal(result.data.todos, currentTodos)
})

test('new backup replaces todos including an explicit empty array', () => {
  const replacement = [{ ...currentTodos[0], id: 'todo-2' }]
  assert.deepEqual(importBackupData({ version: 1, notes, transactions: [], todos: replacement }, currentTodos).data.todos, replacement)
  const empty = importBackupData({ version: 1, notes, transactions: [], todos: [] }, currentTodos)
  assert.equal(empty.keptExistingTodos, false)
  assert.deepEqual(empty.data.todos, [])
})

test('malformed old backup still fails original format validation', () => {
  assert.throws(() => importBackupData({ version: 1, notes }, currentTodos), /备份中缺少记录或账目/)
})

test('explicit malformed todos cannot erase current tasks', () => {
  for (const todos of [null, {}, 'invalid']) {
    assert.throws(() => importBackupData({ version: 1, notes, transactions: [], todos }, currentTodos), /待办格式不正确/)
  }
})
