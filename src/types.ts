export type NoteStatus = 'today' | 'tomorrow' | 'later' | 'none'

export type Note = {
  id: string
  content: string
  status: NoteStatus
  createdAt: string
  updatedAt?: string
  scheduledDate?: string
  done: boolean
}

export type Transaction = {
  id: string
  amount: number
  category: string
  note: string
  kind: 'expense' | 'income'
  createdAt: string
  updatedAt?: string
}

export type AppData = {
  version: 1
  notes: Note[]
  transactions: Transaction[]
}
