export type NoteStatus = 'today' | 'tomorrow' | 'later' | 'none'

export type NoteAttachment = {
  id: string
  name: string
  mime: string
  size: number
  data: string
}

export type Note = {
  id: string
  content: string
  status: NoteStatus
  createdAt: string
  updatedAt?: string
  scheduledDate?: string
  done: boolean
  deletedAt?: string
  pinned?: boolean
  attachments?: NoteAttachment[]
}

export type NoteDraft = Pick<Note, 'content' | 'status' | 'scheduledDate' | 'attachments'> & {
  savedAt: string
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

export type Todo = {
  id: string
  title: string
  dueDate: string
  done: boolean
  createdAt: string
  updatedAt?: string
}

export type AppData = {
  version: 1
  notes: Note[]
  transactions: Transaction[]
  todos: Todo[]
}
