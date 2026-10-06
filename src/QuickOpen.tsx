import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Modal } from './Modal'
import { activeRecordId, ignoreNavigationKey, matchingRecords } from './recordNavigation'
import { noteSearchData } from './recordTools'
import { searchPreview } from './searchPreview'
import type { Note } from './types'

export function QuickOpen({ notes, onClose, onOpen }: { notes: Note[]; onClose: () => void; onOpen: (id: string, action: 'edit' | 'graph') => void }) {
  const [query, setQuery] = useState(''), [selected, setSelected] = useState(''), [limit, setLimit] = useState(40)
  const rows = useRef<HTMLDivElement>(null), input = useRef<HTMLInputElement>(null)
  const matches = useMemo(() => matchingRecords(notes, query), [notes, query])
  const visibleRows = useMemo(() => matches.slice(0, limit).map(note => {
    const data = noteSearchData(note)
    return { note, data, preview: query.trim() ? searchPreview(data.text, query) : null }
  }), [matches, limit, query])
  const activeId = activeRecordId(matches, selected), activeIndex = matches.findIndex(note => note.id === activeId)
  useEffect(() => setLimit(40), [query])
  useEffect(() => { rows.current?.querySelector<HTMLElement>('[aria-pressed="true"]')?.scrollIntoView({ block: 'nearest' }) }, [activeId, limit])
  const keys = (event: React.KeyboardEvent) => {
    if (ignoreNavigationKey(event.nativeEvent)) return
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose(); return }
    if (event.target !== input.current) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!matches.length) return
      const next = (activeIndex + (event.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length
      setSelected(matches[next].id); setLimit(value => Math.max(value, next + 1))
    } else if (event.key === 'Enter') {
      event.preventDefault(); if (activeId) onOpen(activeId, event.ctrlKey || event.metaKey ? 'graph' : 'edit')
    }
  }
  return <Modal title="快速打开记录" onClose={onClose}><section className="record-picker" onKeyDown={keys}>
    <header><h2>快速打开</h2><button aria-label="关闭快速打开" onClick={onClose}><X size={18}/></button></header>
    <label className="picker-search"><Search size={18}/><input ref={input} autoFocus aria-label="查找并打开记录" aria-describedby="quick-open-hint" value={query} onChange={event => setQuery(event.target.value)} placeholder="输入正文或标签…"/></label>
    <p className="picker-count" role="status">{matches.length} 条匹配记录</p>
    <div className="picker-results" ref={rows}>{visibleRows.map(({ note, data, preview }) => {
      return <button key={note.id} className={preview ? 'picker-match-row' : undefined} aria-pressed={note.id === activeId} onFocus={() => setSelected(note.id)} onClick={() => onOpen(note.id, 'edit')}>
        <strong>{(preview ? data.body.split('\n').find(line => line.trim()) : data.body) || '仅标签记录'}</strong>
        {preview && <span className="picker-snippet">{preview.map((part, index) => part.match ? <mark key={index}>{part.text}</mark> : <span key={index}>{part.text}</span>)}</span>}
        <small>创建 {new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' }).format(new Date(note.createdAt))}{data.tags.length > 0 && ` · ${data.tags.map(tag => `#${tag}`).join(' ')}`}</small>
      </button>
    })}{!matches.length && <p className="picker-empty">没有匹配记录，换个关键词看看。</p>}{matches.length > limit && <button className="picker-more" onClick={() => setLimit(value => value + 40)}>加载更多记录</button>}</div>
    <footer><span id="quick-open-hint">↑ ↓ 选择 · Enter 编辑 · Ctrl/⌘ Enter 定位</span><button className="soft-button" disabled={!activeId} onClick={() => activeId && onOpen(activeId, 'graph')}>在图中定位</button></footer>
  </section></Modal>
}
