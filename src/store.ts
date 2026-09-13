import type { AppData, Note, Transaction } from './types'

const NOTES_KEY = 'luma-notes-v1'
const TRANSACTIONS_KEY = 'luma-transactions-v1'

const sampleNotes: Note[] = [
  { id: 'welcome-1', content: '欢迎来到晴笺。按 <kbd>⌘</kbd> <kbd>Enter</kbd> 随时记下一件事。', status: 'today', createdAt: new Date().toISOString(), done: false },
  { id: 'welcome-2', content: '周末去看展览 #生活', status: 'tomorrow', createdAt: new Date().toISOString(), done: false },
  { id: 'welcome-3', content: '整理旅行清单 #准备中', status: 'later', createdAt: new Date().toISOString(), done: false },
]

export function loadNotes(): Note[] {
  const saved = localStorage.getItem(NOTES_KEY)
  if (!saved) return sampleNotes.map(note => ({ ...note, scheduledDate: note.status === 'today' ? new Date().toISOString().slice(0, 10) : note.status === 'tomorrow' ? new Date(Date.now() + 86_400_000).toISOString().slice(0, 10) : undefined }))
  // Migrate data created by the first prototype, which used status for dates.
  return (JSON.parse(saved) as Note[]).map(note => ({
    ...note,
    scheduledDate: note.scheduledDate ?? (note.status === 'today' ? new Date().toISOString().slice(0, 10) : note.status === 'tomorrow' ? new Date(Date.now() + 86_400_000).toISOString().slice(0, 10) : undefined),
  }))
}
export function saveNotes(notes: Note[]) { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)) }
export function loadTransactions(): Transaction[] {
  const saved = localStorage.getItem(TRANSACTIONS_KEY)
  return saved ? JSON.parse(saved) : []
}
export function saveTransactions(items: Transaction[]) { localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(items)) }

export function exportData(notes: Note[], transactions: Transaction[]): AppData {
  return { version: 1, notes, transactions }
}

export function parseBackup(value: unknown): AppData {
  if (!value || typeof value !== 'object') throw new Error('备份文件格式不正确')
  const data = value as Partial<AppData>
  if (!Array.isArray(data.notes) || !Array.isArray(data.transactions)) throw new Error('备份中缺少记录或账目')
  return { version: 1, notes: data.notes as Note[], transactions: data.transactions as Transaction[] }
}
