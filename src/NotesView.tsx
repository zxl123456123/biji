import { useEffect, useRef, useState } from 'react'
import { CalendarDays, Check, Copy, GripHorizontal, Pencil, Pin, PinOff, Plus, RotateCcw, Search, Trash2 } from 'lucide-react'
import { SoftButton } from './SoftInteraction'
import { NoteSorter } from './NoteSorter'
import type { SortableCardRefs } from './NoteSorter'
import { NoteFilters } from './NoteFilters'
import { groupNotesByDate, presentedGroups, presentedNotes } from './notePresentation'
import type { Note } from './types'
import { renderMarkdown } from './noteFormat'
import { dateLabel, tagsFor, withoutTags } from './recordTools'

type NotesViewProps = {
  layout: 'grid' | 'reading' | 'date'; onLayout: (layout: 'grid' | 'reading' | 'date') => void
  view: 'all' | 'trash'; notes: Note[]; tags: string[]; pinnedTags: string[]
  query: string; selectedTag: string | null; unfinished: boolean; isTrash: boolean
  onCreate: () => void; onToggle: (id: string) => void; onEdit: (note: Note) => void; onOpenWheel: (id: string, trigger: HTMLButtonElement) => void
  onDelete: (id: string) => void; onRestore: (id: string) => void; onDeleteForever: (id: string) => void
  onTag: (tag: string) => void; onPinTag: (tag: string) => void; onClear: () => void
  onUnfinished: (value: boolean) => void; onCopy: (text: string) => void; onPickTags: () => void
  dataVersion: Note[]; businessEnabled: boolean; motionAllowed: boolean
  onReorder: (orderedIds: string[], expectedIds: string[]) => void; onPin: (id: string) => void
}
export function NotesView(props: NotesViewProps) {
  const { notes, tags, pinnedTags, query, selectedTag, unfinished, isTrash, onCreate, onClear } = props
  const [limit, setLimit] = useState(60)
  useEffect(() => setLimit(60), [query, selectedTag, unfinished, props.layout, isTrash])
  const shown = presentedNotes(notes, props.layout, limit, isTrash)
  const groups = presentedGroups(notes, props.layout, limit, isTrash)
  const card = (note: Note, sortable?: SortableCardRefs) => <NoteCard key={note.id} note={note} trash={isTrash} sortable={sortable} businessEnabled={props.businessEnabled} onPin={() => props.onPin(note.id)} onCopy={props.onCopy} onToggle={() => props.onToggle(note.id)} onEdit={() => props.onEdit(note)} onOpenWheel={trigger => props.onOpenWheel(note.id, trigger)} onDelete={() => props.onDelete(note.id)} onRestore={() => props.onRestore(note.id)} onDeleteForever={() => props.onDeleteForever(note.id)}/>
  const filtered = !!(query.trim() || selectedTag || unfinished)
  return <div className="content">
    <div className="heading"><div><p className="eyebrow">{isTrash ? '为误删留一次回来的机会' : '小小记录，慢慢积累'}</p><h1>{isTrash ? '回收站' : '我的记录'}</h1><p className="subtle">{isTrash ? '恢复后，记录会回到原来的位置。' : '想法、待办和生活里的微光，都放在这里。'}</p></div><span className="record-count">{notes.length} 条</span></div>
    {!isTrash && <SoftButton className="capture-entry" onClick={onCreate}><div><span>此刻想记下什么？</span><small>写下来，让心里轻一点</small></div><span className="capture-plus"><Plus size={21}/></span></SoftButton>}
    <div className="record-controls"><NoteFilters {...props} count={notes.length}/><div className="layout-toggle" aria-label="记录排版"><SoftButton aria-pressed={props.layout==='grid'} onClick={()=>props.onLayout('grid')}>网格</SoftButton><SoftButton aria-pressed={props.layout==='reading'} onClick={()=>props.onLayout('reading')}>阅读</SoftButton><SoftButton aria-pressed={props.layout==='date'} onClick={()=>props.onLayout('date')}>按日期</SoftButton></div></div>
    {!isTrash && notes.length > 0 && <p className="sort-hint">拖动抓手调整顺序，或聚焦抓手后按空格开始</p>}
    {notes.length ? !isTrash ? <NoteSorter groups={groups} layout={props.layout} dataVersion={props.dataVersion}
      context={JSON.stringify([query, selectedTag, unfinished, props.layout, limit, props.view])}
      enabled={props.businessEnabled} motionAllowed={props.motionAllowed} onReorder={props.onReorder} renderCard={card}
      renderOverlay={note => <article aria-hidden="true" className="note-card note-overlay-preview"><div className="markdown-preview">{renderMarkdown(withoutTags(note.content)||'仅标签记录')}</div></article>}/>
      : props.layout === 'date' ? <div className="date-groups">{groupNotesByDate(shown).map(([date, group]) => <section key={date}><header className="date-group-heading"><h2>{date==='未指定日期'?date:`${date.slice(0,4)}年 ${dateLabel(date)}`}</h2><span>已显示 {group.length} 条</span></header><div className="note-grid reading-layout">{group.map(note => card(note))}</div></section>)}</div> : <div className={`note-grid${props.layout==='reading'?' reading-layout':''}`}>{shown.map(note => card(note))}</div>
      : filtered ? <div className="empty"><span><Search size={21}/></span><h2>没有找到匹配记录</h2><p>换个关键词，或清除筛选再看看。</p><button className="soft-button" onClick={onClear}>清除筛选</button></div>
      : isTrash ? <div className="empty"><span>✓</span><h2>回收站是空的</h2><p>这里很干净，也很安心。</p></div> : <Empty onCreate={onCreate}/>}
    {notes.length > 0 && <div className="batch-status"><span>已显示 {shown.length} / 共 {notes.length} 条</span>{shown.length < notes.length && <button className="soft-button" onClick={()=>setLimit(value=>value+60)}>加载更多</button>}</div>}
    {tags.length>0 && !isTrash && <section className="tags-section"><p className="section-title">从一个标签开始</p><div>{tags.slice(0,10).map((tag,index)=><span className={`tag-chip tone-${index%5}${pinnedTags.includes(tag)?' is-pinned':''}`} key={tag}><button aria-pressed={selectedTag===tag} onClick={()=>props.onTag(tag)}>{tag}</button><button aria-label={`${pinnedTags.includes(tag)?'取消固定':'固定'}${tag}`} title={pinnedTags.includes(tag)?'取消固定':'固定到快捷标签'} onClick={()=>props.onPinTag(tag)}>{pinnedTags.includes(tag)?<PinOff size={13}/>:<Pin size={13}/>}</button></span>)}<button className="all-tags-button" onClick={props.onPickTags}>查看全部 {tags.length} 个标签</button></div></section>}
  </div>
}
function Empty({onCreate}:{onCreate:()=>void}) { return <div className="empty"><span>✦</span><h2>这里还很安静</h2><p>写下第一件想记住的事吧。</p><button className="soft-button" onClick={onCreate}><Plus size={17}/>开始记录</button></div> }
function NoteCard({note,trash,sortable,businessEnabled,onPin,onToggle,onEdit,onOpenWheel,onDelete,onRestore,onDeleteForever,onCopy}:{note:Note;trash:boolean;sortable?:SortableCardRefs;businessEnabled:boolean;onPin:()=>void;onToggle:()=>void;onEdit:()=>void;onOpenWheel:(trigger:HTMLButtonElement)=>void;onDelete:()=>void;onRestore:()=>void;onDeleteForever:()=>void;onCopy:(text:string)=>void}) {
  const tags=tagsFor(note.content), content=withoutTags(note.content)
  const previewRef=useRef<HTMLDivElement>(null)
  return <article ref={sortable?.cardRef} className={`note-card${note.done?' done':''}${sortable?.dragging?' is-sorting':''}`}>
    {!trash && <button ref={sortable?.handleRef} type="button" className="card-grip" data-note-handle={note.id} aria-label="调整记录顺序" aria-roledescription="可排序记录" disabled={!businessEnabled} title="拖动调整顺序；空格开始，方向键移动，Esc 取消"><GripHorizontal size={16}/></button>}
    <div className={`note-card-top${trash?' in-trash':''}`}>
      {!trash&&<SoftButton aria-label={note.done?'标记未完成':'标记完成'} aria-pressed={note.done} className="check" onClick={onToggle}>{note.done&&<Check size={13}/>}</SoftButton>}
      <span className="note-state">{trash?'回收站':note.done?'已完成':'未完成'}</span>
      <time>{trash&&note.deletedAt?'删除于 '+new Intl.DateTimeFormat('zh-CN',{month:'numeric',day:'numeric'}).format(new Date(note.deletedAt)):note.scheduledDate?dateLabel(note.scheduledDate):new Intl.DateTimeFormat('zh-CN',{month:'numeric',day:'numeric'}).format(new Date(note.createdAt))}</time>
    </div>
    <button aria-label={trash?'恢复这条记录':'编辑这条记录'} title={trash?'恢复这条记录':'展开查看与编辑'} className="note-body" onClick={trash?onRestore:onEdit}><div ref={previewRef} className="markdown-preview">{renderMarkdown(content||'仅标签记录')}</div></button>
    <div className="note-card-bottom">
      <div className="note-meta">{tags.map((tag,index)=><span className={`tone-${index%5}`} key={tag}>{tag}</span>)}</div>
      <div className="note-actions">{trash?<><SoftButton aria-label="恢复记录" title="恢复" onClick={onRestore}><RotateCcw size={15}/></SoftButton><SoftButton aria-label="永久删除记录" title="永久删除" onClick={onDeleteForever}><Trash2 size={15}/></SoftButton></>:<><SoftButton aria-label={note.pinned?'取消置顶记录':'置顶记录'} title={note.pinned?'取消置顶':'置顶'} aria-pressed={!!note.pinned} className={note.pinned?'record-pin active':'record-pin'} onClick={onPin}>{note.pinned?<PinOff size={15}/>:<Pin size={15}/>}</SoftButton><SoftButton aria-label="复制正文" title="复制正文" onClick={()=>onCopy(previewRef.current?.innerText??previewRef.current?.textContent??'')}><Copy size={15}/></SoftButton><SoftButton data-wheel-entry={note.id} aria-label="查看记录年轮" title="查看记录年轮" onClick={event=>onOpenWheel(event.currentTarget)}><CalendarDays size={15}/></SoftButton><SoftButton aria-label="编辑记录" title="编辑" onClick={onEdit}><Pencil size={15}/></SoftButton><SoftButton aria-label="移至回收站" title="移至回收站" onClick={onDelete}><Trash2 size={15}/></SoftButton></>}</div>
    </div>
  </article>
}
