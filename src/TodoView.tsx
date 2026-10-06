import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Todo } from './types'
import { today } from './recordTools'

type Props = {
  items: Todo[]
  onAdd(title: string, dueDate: string): void
  onChange(id: string, title: string, dueDate: string): void
  onToggle(id: string): void
  onDelete(id: string): void
}

export function TodoView({ items, onAdd, onChange, onToggle, onDelete }: Props) {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState(today())
  const [editing, setEditing] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDate, setEditDate] = useState('')
  const sorted = [...items].sort((a, b) => Number(a.done) - Number(b.done) || a.dueDate.localeCompare(b.dueDate) || a.createdAt.localeCompare(b.createdAt))
  const add = (event: React.FormEvent) => { event.preventDefault(); if (!title.trim()) return; onAdd(title.trim(), dueDate); setTitle('') }
  const startEdit = (item: Todo) => { setEditing(item.id); setEditTitle(item.title); setEditDate(item.dueDate) }
  const saveEdit = (event: React.FormEvent) => { event.preventDefault(); if (!editing || !editTitle.trim()) return; onChange(editing, editTitle.trim(), editDate); setEditing(null) }
  return <div className="content todo-view">
    <div className="heading"><div><p className="eyebrow">留给今天一点清晰</p><h1>待办清单</h1><p className="subtle">具体的事放在这里，灵感继续写在记录里。</p></div></div>
    <form className="todo-add" onSubmit={add}><input aria-label="新待办" placeholder="写下一件要做的事" value={title} onChange={event => setTitle(event.target.value)} maxLength={160}/><input aria-label="计划日期" type="date" required value={dueDate} onChange={event => setDueDate(event.target.value)}/><button type="submit" disabled={!title.trim()}><Plus size={16}/>添加</button></form>
    <div className="todo-summary">{items.filter(item => !item.done && item.dueDate <= today()).length} 件今天及此前未完成 · {items.filter(item => item.done).length} 件已完成</div>
    <div className="todo-list">{sorted.length ? sorted.map(item => <article className="todo-item" key={item.id} data-done={item.done}>
      <input type="checkbox" checked={item.done} aria-label={`完成${item.title}`} onChange={() => onToggle(item.id)}/>
      {editing === item.id ? <form className="todo-edit" onSubmit={saveEdit}><input aria-label="修改待办" value={editTitle} onChange={event => setEditTitle(event.target.value)} maxLength={160}/><input aria-label="修改日期" type="date" required value={editDate} onChange={event => setEditDate(event.target.value)}/><button type="submit">保存</button><button type="button" onClick={() => setEditing(null)}>取消</button></form> : <><div className="todo-main"><b>{item.title}</b><small>{item.dueDate === today() ? '今天' : item.dueDate}</small></div><button onClick={() => startEdit(item)}>编辑</button><button aria-label={`删除${item.title}`} onClick={() => onDelete(item.id)}><Trash2 size={16}/></button></>}
    </article>) : <p className="todo-empty">还没有待办。先写下一件想完成的小事。</p>}</div>
  </div>
}
