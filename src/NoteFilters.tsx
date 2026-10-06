import { X } from 'lucide-react'
import { SoftButton } from './SoftInteraction'

export type NoteFiltersProps = {
  query: string; selectedTag: string | null; unfinished: boolean; count: number; isTrash?: boolean
  onUnfinished: (value: boolean) => void; onClear: () => void
  tags?: string[]; onTag?: (tag: string) => void; onPickTags?: () => void
}
export function NoteFilters(props: NoteFiltersProps) {
  const { query, selectedTag, unfinished, count, isTrash, onClear, onUnfinished } = props
  return <div className="filter-bar">
    {!isTrash && <div className="filter-tabs" aria-label="记录状态">
      <SoftButton aria-pressed={!unfinished} className={!unfinished ? 'selected' : ''} onClick={() => onUnfinished(false)}>全部</SoftButton>
      <SoftButton aria-pressed={unfinished} className={unfinished ? 'selected' : ''} onClick={() => onUnfinished(true)}>未完成</SoftButton>
    </div>}
    {!isTrash && props.onPickTags && <SoftButton className="tag-filter" aria-label="标签筛选" onClick={props.onPickTags}>{selectedTag ? `# ${selectedTag}` : '全部标签'}</SoftButton>}
    {selectedTag && (isTrash || !props.onPickTags) && <span className="active-filter"># {selectedTag}</span>}
    {query.trim() && <span className="query-result">“{query.trim()}” · {count} 条结果</span>}
    {(query.trim() || selectedTag || unfinished) && <SoftButton className="clear-filter" onClick={onClear}><X size={13}/>清除筛选</SoftButton>}
  </div>
}
