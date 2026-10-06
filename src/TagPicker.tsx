import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Modal } from './Modal'
import { filterTags, ignoreNavigationKey } from './recordNavigation'

export function TagPicker({ tags, selected, onTag, onClose }: { tags: string[]; selected: string | null; onTag: (tag: string) => void; onClose: () => void }) {
  const [query, setQuery] = useState(''), [active, setActive] = useState(selected ?? '')
  const input = useRef<HTMLInputElement>(null), rows = useRef<HTMLDivElement>(null)
  const matches = useMemo(() => filterTags(tags, query), [tags, query])
  const options = ['', ...matches], current = options.includes(active) ? active : options[0]
  useEffect(() => { rows.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: 'nearest' }) }, [current])
  const choose = (tag: string) => { onTag(tag); onClose() }
  const keys = (event: React.KeyboardEvent) => {
    if (ignoreNavigationKey(event.nativeEvent)) return
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose(); return }
    if (event.target !== input.current) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); const index = options.indexOf(current)
      setActive(options[(index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length])
    } else if (event.key === 'Enter') { event.preventDefault(); choose(current) }
  }
  return <Modal title="选择标签" onClose={onClose}><section className="record-picker tag-picker" onKeyDown={keys}>
    <header><h2>选择标签</h2><button aria-label="关闭标签选择" onClick={onClose}><X size={18}/></button></header>
    <label className="picker-search"><Search size={18}/><input ref={input} autoFocus aria-label="搜索全部标签" value={query} onChange={event => { setQuery(event.target.value); setActive(filterTags(tags, event.target.value)[0] ?? '') }} placeholder="搜索全部标签…"/></label>
    <p className="picker-count" role="status">{matches.length} / {tags.length} 个标签</p>
    <div ref={rows} className="picker-results">{options.map(tag => <button key={tag} aria-pressed={(selected ?? '') === tag} data-active={current === tag} onFocus={() => setActive(tag)} onClick={() => choose(tag)}>{tag ? `# ${tag}` : '全部标签'}</button>)}{!matches.length && <p className="picker-empty">没有匹配标签，可以清除搜索再看看。</p>}</div>
    <footer><span>↑ ↓ 选择 · Enter 确认 · Esc 返回</span></footer>
  </section></Modal>
}
