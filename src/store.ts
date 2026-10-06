import type { AppData, Note, NoteDraft, Todo, Transaction } from './types'

const NOTES_KEY = 'luma-notes-v1'
const TRANSACTIONS_KEY = 'luma-transactions-v1'
const TODOS_KEY = 'luma-todos-v1'
const DRAFT_PREFIX = 'luma-note-draft-v1:'

const sampleNotes: Note[] = [
  { id: 'welcome-1', content: '欢迎来到晴笺。随时记下一件事。', status: 'none', createdAt: new Date().toISOString(), done: false },
  { id: 'welcome-2', content: '周末去看展览 #生活', status: 'none', createdAt: new Date().toISOString(), done: false },
  { id: 'welcome-3', content: '整理旅行清单 #旅行', status: 'none', createdAt: new Date().toISOString(), done: false },
]

export function loadNotes(): Note[] {
  const saved = localStorage.getItem(NOTES_KEY)
  if (!saved) return sampleNotes.map((note, index) => ({ ...note, scheduledDate: new Date(Date.now() + index * 86_400_000).toISOString().slice(0, 10) }))
  // Migrate data created by the first prototype to a single date-based record format.
  return (JSON.parse(saved) as Note[]).map(note => ({
    ...note,
    status: 'none',
    content: note.content.replace(/(?:^|\s)#准备中(?=\s|$)/g, '').replace(/按\s*(?:<kbd>⌘<\/kbd>\s*<kbd>Enter<\/kbd>|Ctrl\s*\+\s*Enter)\s*/g, '').trim(),
    scheduledDate: note.scheduledDate ?? (note.status === 'today' ? new Date().toISOString().slice(0, 10) : note.status === 'tomorrow' ? new Date(Date.now() + 86_400_000).toISOString().slice(0, 10) : new Date(note.createdAt).toISOString().slice(0, 10)),
  }))
}
export function saveNotes(notes: Note[]) { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)) }
export function loadNoteDraft(id = 'new'): NoteDraft | null {
  try { const value = JSON.parse(localStorage.getItem(`${DRAFT_PREFIX}${id}`) ?? 'null'); return value && typeof value.content === 'string' ? value as NoteDraft : null } catch { return null }
}
export function saveNoteDraft(draft: NoteDraft, id = 'new') { localStorage.setItem(`${DRAFT_PREFIX}${id}`, JSON.stringify(draft)) }
export function clearNoteDraft(id = 'new') { localStorage.removeItem(`${DRAFT_PREFIX}${id}`) }
export function loadTransactions(): Transaction[] {
  const saved = localStorage.getItem(TRANSACTIONS_KEY)
  return saved ? JSON.parse(saved) : []
}
export function saveTransactions(items: Transaction[]) { localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(items)) }
export function loadTodos(): Todo[] {
  try { const value: unknown = JSON.parse(localStorage.getItem(TODOS_KEY) ?? '[]'); return Array.isArray(value) ? value as Todo[] : [] }
  catch { return [] }
}
export function saveTodos(items: Todo[]) { localStorage.setItem(TODOS_KEY, JSON.stringify(items)) }

export function exportData(notes: Note[], transactions: Transaction[], todos: Todo[] = []): AppData {
  return { version: 1, notes, transactions, todos }
}

export function parseBackup(value: unknown): AppData {
  if (!value || typeof value !== 'object') throw new Error('备份文件格式不正确')
  const data = value as Partial<AppData>
  if (!Array.isArray(data.notes) || !Array.isArray(data.transactions)) throw new Error('备份中缺少记录或账目')
  return { version: 1, notes: data.notes as Note[], transactions: data.transactions as Transaction[], todos: Array.isArray(data.todos) ? data.todos as Todo[] : [] }
}

export function importBackupData(value: unknown, currentTodos: Todo[]): { data: AppData; keptExistingTodos: boolean } {
  const data = parseBackup(value)
  const keptExistingTodos = !Object.prototype.hasOwnProperty.call(value, 'todos')
  if (!keptExistingTodos && !Array.isArray((value as Partial<AppData>).todos)) throw new Error('备份中的待办格式不正确')
  return { data: { ...data, todos: keptExistingTodos ? currentTodos : data.todos }, keptExistingTodos }
}
