import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ArrowDownToLine, CalendarDays, CheckSquare, Download, FileUp, LayoutList, Network, Minus, Moon, PinOff, Plus, Search, Settings, Sparkles, Square, Sun, Trash2, WalletCards, X } from 'lucide-react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { askAi, isDesktop, loadDesktopData, prepareAi, saveDesktopData } from './desktop'
import { exportData, importBackupData, loadNotes, loadTodos, loadTransactions, saveNotes, saveTodos, saveTransactions } from './store'
import type { Note, Todo, Transaction } from './types'
import { TodoView } from './TodoView'

import { NoteComposer } from './NoteComposer'
import { Modal } from './Modal'
import { NotesView } from './NotesView'
import { reorderInCurrentView, toggleNotePin } from './noteOrder'
import { today, selectNotes, withoutTags } from './recordTools'
import { LedgerView, LedgerComposer } from './LedgerView'
import type { TransactionDraft } from './ledgerTools'
import { dateKey } from './recordTools'
import { renderMarkdown } from './noteFormat'
import { useNoteGraph } from './useNoteGraph'
import { SoftButton, SoftInteraction } from './SoftInteraction'
import { QuickOpen } from './QuickOpen'
import { TagPicker } from './TagPicker'
import { NoteFilters } from './NoteFilters'
import { PetCompanion, PetPortrait, PetShowcase } from './PetCompanion'
import { PET_VISIBLE_KEY } from './petBehavior'
import { PET_CHARACTER_NAMES, parsePetAppearance, readPetAppearance, writePetAppearance } from './petAppearance'
import type { PetAppearance } from './petAppearance'
import { collectTags, createEditHandoff, currentRecord, ignoreNavigationKey } from './recordNavigation'
import type { LocateRequest, LocateResult } from './graphFocus'
import type { GraphSession } from './graphGeometry'
const NoteGraph = lazy(() => import('./NoteGraph'))
const RecordGarden = lazy(() => import('./RecordGarden'))
const CelestialNoteWheel = lazy(() => import('./CelestialNoteWheel'))

type View = 'graph' | 'pet' | 'garden' | 'all' | 'todos' | 'trash' | 'ledger' | 'settings'
type Composer = { type: 'note'; note?: Note } | { type: 'transaction'; item?: Transaction; date?: string } | null
type Toast = { message: string; action?: { label: string; run: () => void } }
export default function App() {
  const [notes, setNotes] = useState<Note[]>(loadNotes), [transactions, setTransactions] = useState<Transaction[]>(loadTransactions), [todos, setTodos] = useState<Todo[]>(loadTodos)
  const [view, setView] = useState<View>('all'), [query, setQuery] = useState(''), [composer, setComposer] = useState<Composer>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => localStorage.getItem('luma-theme') === 'dark' ? 'dark' : 'light')
  const [toast, setToast] = useState<Toast | null>(null), [ready, setReady] = useState(!isDesktop()), [aiOpen, setAiOpen] = useState(false)
  const [pinnedTags, setPinnedTags] = useState<string[]>(() => JSON.parse(localStorage.getItem('luma-pinned-tags') ?? '[]'))
  const [selectedTag, setSelectedTag] = useState<string | null>(null), [unfinished, setUnfinished] = useState(false)
  const [ambientEnabled, setAmbientEnabled] = useState(() => localStorage.getItem('luma-ambient-motion') !== 'off')
  const [petShown, setPetShown] = useState(() => localStorage.getItem(PET_VISIBLE_KEY) !== 'off')
  const [petAppearance, setPetAppearance] = useState(readPetAppearance)
  const [todoReminder, setTodoReminder] = useState(false)
  const reminderClose = useRef<HTMLButtonElement>(null), reminderPanel = useRef<HTMLDivElement>(null), reminderReturnFocus = useRef<HTMLElement | null>(null)
  const [localDay, setLocalDay] = useState(today)
  const applyPetAppearance = (next: PetAppearance): boolean => {
    const value = parsePetAppearance(next)
    setPetAppearance(value)
    return writePetAppearance(value)
  }
  const [reducedMotion, setReducedMotion] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [recordLayout, setRecordLayout] = useState<'grid' | 'reading' | 'date'>('grid')
  const [pageVisible, setPageVisible] = useState(() => !document.hidden)
  const [quickOpen, setQuickOpen] = useState(false), [tagPickerOpen, setTagPickerOpen] = useState(false)
  const [locateRequest, setLocateRequest] = useState<LocateRequest | null>(null)
  const [wheelEntryId, setWheelEntryId] = useState<string | null>(null)
  const wheelReturnFocus = useRef<HTMLElement | null>(null), wheelFocusFrame = useRef<number | null>(null)
  const wheelReturnId = useRef<string | null>(null)
  const wheelFocusPending = useRef(false)
  const locateToken = useRef(0), notesRef = useRef(notes)
  notesRef.current = notes
  const editHandoff = useRef<ReturnType<typeof createEditHandoff> | null>(null)
  useEffect(() => () => { if (wheelFocusFrame.current !== null) cancelAnimationFrame(wheelFocusFrame.current) }, [])
  useEffect(() => {
    if (wheelEntryId !== null || !wheelFocusPending.current) return
    wheelFocusPending.current = false
    wheelFocusFrame.current = requestAnimationFrame(() => {
      wheelFocusFrame.current = null
      const currentButton = [...document.querySelectorAll<HTMLButtonElement>('[data-wheel-entry]')]
        .find(button => button.dataset.wheelEntry === wheelReturnId.current)
      const target = wheelReturnFocus.current?.isConnected ? wheelReturnFocus.current : currentButton ?? searchRef.current
      if (!document.querySelector('[role="dialog"]') && target?.isConnected && !target.closest('[inert]')) target.focus({ preventScroll: true })
    })
  }, [wheelEntryId])
  useEffect(() => {
    const handoff = createEditHandoff({ notes: () => notesRef.current, schedule: run => requestAnimationFrame(run), cancel: frame => cancelAnimationFrame(frame),
      open: note => setComposer({ type: 'note', note }), missing: () => setToast({ message: '这条记录已不可用' }) })
    editHandoff.current = handoff
    return () => { handoff.dispose(); editHandoff.current = null }
  }, [])
  const graphSession = useRef<GraphSession>({ positions: new Map(), camera: null, fitted: false })
  useEffect(() => {
    const update = () => setPageVisible(!document.hidden)
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])
  const searchRef = useRef<HTMLInputElement>(null)
  const importRef = useRef<HTMLInputElement>(null)
  useEffect(() => { if (!isDesktop()) return; loadDesktopData().then(data => { setNotes(data.notes); setTransactions(data.transactions); setTodos(data.todos); setReady(true) }).catch(() => { setReady(true); setToast({message:'本地数据库暂不可用，已使用浏览器存储'}) }) }, [])
  useEffect(() => { if (!ready) return; saveNotes(notes); saveTransactions(transactions); saveTodos(todos); if (isDesktop()) saveDesktopData(exportData(notes, transactions, todos)).catch(() => setToast({message:'本地数据库保存失败'})) }, [notes, transactions, todos, ready])
  useEffect(() => { const timer = setInterval(() => setLocalDay(today()), 60_000); return () => clearInterval(timer) }, [])
  useEffect(() => { if (!ready || !petShown || !pageVisible || composer || quickOpen || tagPickerOpen || aiOpen || wheelEntryId || !todos.some(item => !item.done && item.dueDate <= localDay)) return; const key = `luma-todo-reminded:${localDay}`; if (!localStorage.getItem(key)) setTodoReminder(true) }, [ready, petShown, pageVisible, composer, quickOpen, tagPickerOpen, aiOpen, wheelEntryId, todos, localDay])
  useEffect(() => { if (todoReminder && todos.some(item => !item.done && item.dueDate <= localDay)) localStorage.setItem(`luma-todo-reminded:${localDay}`, '1') }, [todoReminder, todos, localDay])
  useLayoutEffect(() => { if (!todoReminder) return; const panel = reminderPanel.current; reminderReturnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; reminderClose.current?.focus(); return () => { if (panel?.contains(document.activeElement) && reminderReturnFocus.current?.isConnected) reminderReturnFocus.current.focus(); reminderReturnFocus.current = null } }, [todoReminder])
  useEffect(() => { if (composer || quickOpen || tagPickerOpen || aiOpen) setTodoReminder(false) }, [composer, quickOpen, tagPickerOpen, aiOpen])
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('luma-theme', theme) }, [theme])
  useEffect(() => localStorage.setItem('luma-pinned-tags', JSON.stringify(pinnedTags)), [pinnedTags])
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(null), toast.action ? 5000 : 2800); return () => clearTimeout(timer) }, [toast])
  useEffect(() => localStorage.setItem('luma-ambient-motion', ambientEnabled ? 'on' : 'off'), [ambientEnabled])
  useEffect(() => localStorage.setItem(PET_VISIBLE_KEY, petShown ? 'on' : 'off'), [petShown])
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if (ignoreNavigationKey(event)) return
      if (event.key === 'Escape') {
        if (composer) setComposer(null)
        else if (quickOpen) setQuickOpen(false)
        else if (aiOpen) setAiOpen(false)
        else if (todoReminder) setTodoReminder(false)
        else if (tagPickerOpen) setTagPickerOpen(false)
        else if (wheelEntryId) closeWheel()
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !composer && !aiOpen && !tagPickerOpen && !wheelEntryId) {
        event.preventDefault()
        setQuickOpen(true)
      }
    }
    addEventListener('keydown', keys)
    return () => removeEventListener('keydown', keys)
  }, [composer, aiOpen, quickOpen, tagPickerOpen, todoReminder, wheelEntryId])
  const activeNotes = useMemo(() => notes.filter(n => !n.deletedAt), [notes])
  const visibleNotes = useMemo(() => selectNotes(notes, { query, tag: selectedTag, unfinished, trash: view === 'trash' }), [notes, view, query, selectedTag, unfinished])
  const graph = useNoteGraph(activeNotes, view === 'graph' || !!wheelEntryId)
  const motionAllowed = ambientEnabled && !reducedMotion && pageVisible && !composer && !quickOpen && !tagPickerOpen && !aiOpen
  const sortingEnabled = pageVisible && !composer && !quickOpen && !tagPickerOpen && !aiOpen && !wheelEntryId
  const businessEnabled = sortingEnabled
  const tags = useMemo(() => collectTags(activeNotes), [activeNotes])
  const [ledgerMonth, setLedgerMonth] = useState(() => today().slice(0, 7))
  const [ledgerRevealMonth, setLedgerRevealMonth] = useState(0)
  const show = (message: string, action?: Toast['action']) => setToast({ message, action })
  const clearFilters = () => { setQuery(''); setSelectedTag(null); setUnfinished(false) }
  const nav = (next: View) => { editHandoff.current?.cancel(); setWheelEntryId(null); setQuickOpen(false); setTagPickerOpen(false); if (next !== 'graph') setLocateRequest(null); if (next === 'trash') clearFilters(); setView(next) }
  const selectTag = (tag: string) => { setSelectedTag(tag || null); nav(view === 'graph' ? view : 'all') }
  const createInView = () => { editHandoff.current?.cancel(); if (view === 'todos') { document.querySelector<HTMLInputElement>('[aria-label="新待办"]')?.focus(); return } setComposer({ type: view === 'ledger' ? 'transaction' : 'note' }) }
  useEffect(() => { if (composer) editHandoff.current?.cancel() }, [composer])
  useEffect(() => {
    if (locateRequest && !currentRecord(notes, locateRequest.id)) {
      setLocateRequest(null); setToast({ message: '这条记录已不可用' })
    }
  }, [notes, locateRequest])
  useEffect(() => {
    if (wheelEntryId && !currentRecord(notes, wheelEntryId)) {
      setWheelEntryId(null); setToast({ message: '这条记录已不可用' })
      requestAnimationFrame(() => searchRef.current?.focus({ preventScroll: true }))
    }
  }, [notes, wheelEntryId])
  const openWheel = (id: string, trigger: HTMLButtonElement) => {
    if (view !== 'all' || !currentRecord(notesRef.current, id)) { show('这条记录已不可用'); return }
    if (wheelFocusFrame.current !== null) cancelAnimationFrame(wheelFocusFrame.current)
    wheelFocusFrame.current = null
    wheelFocusPending.current = false
    wheelReturnFocus.current = trigger
    wheelReturnId.current = id
    editHandoff.current?.cancel(); setWheelEntryId(id)
  }
  const closeWheel = () => {
    if (wheelFocusFrame.current !== null) cancelAnimationFrame(wheelFocusFrame.current)
    wheelFocusFrame.current = null
    wheelFocusPending.current = true
    setWheelEntryId(null)
  }
  const openWheelRecord = (id: string) => {
    if (!currentRecord(notesRef.current, id)) { show('这条记录已不可用'); return }
    if (wheelFocusFrame.current !== null) cancelAnimationFrame(wheelFocusFrame.current)
    wheelFocusFrame.current = null
    wheelFocusPending.current = false
    setWheelEntryId(null); editHandoff.current?.open(id)
  }
  // Local requests open one-hop relations without changing caller filter policy.
  const requestLocate = (id: string, clearBlockingFilters: boolean, local = false) => {
    editHandoff.current?.cancel()
    if (!currentRecord(notesRef.current, id)) { show('这条记录已不可用'); return }
    if (clearBlockingFilters) { clearFilters(); show('已清除筛选并在图中定位') }
    setView('graph'); setLocateRequest({ id, token: ++locateToken.current, local })
  }
  const openRecord = (id: string, action: 'edit' | 'graph') => {
    editHandoff.current?.cancel()
    if (!currentRecord(notesRef.current, id)) { show('这条记录已不可用'); return }
    setQuickOpen(false)
    if (action === 'edit') editHandoff.current?.open(id)
    else requestLocate(id, true)
  }
  const finishLocate = (result: LocateResult) => {
    setLocateRequest(current => current?.token === result.token ? null : current)
    if (!result.ok && locateRequest?.token === result.token) show('这条记录暂无法定位，请重新查找')
  }
  async function copyBody(text: string) {
    try { await navigator.clipboard.writeText(text); show('正文已复制') }
    catch { show('复制未完成，请打开记录后选择正文复制') }
  }
  const togglePinTag = (tag: string) => setPinnedTags(items => items.includes(tag) ? items.filter(item => item !== tag) : [...items, tag])
  const reorderNotes = (orderedIds: string[], expectedIds: string[]) => {
    if (view !== 'all' || !sortingEnabled) return
    setNotes(current => {
      const filtered = selectNotes(current, { query, tag: selectedTag, unfinished, trash: false })
      return reorderInCurrentView(current, filtered, recordLayout, expectedIds, orderedIds)
    })
  }
  function saveNote(draft: Omit<Note, 'id' | 'createdAt'>, id?: string) { const now = new Date().toISOString(); id ? setNotes(v => v.map(n => n.id === id ? { ...n, ...draft, updatedAt: now } : n)) : setNotes(v => [{ ...draft, id: crypto.randomUUID(), createdAt: now, updatedAt: now }, ...v]); setComposer(null); show(id ? '记录已更新' : '已保存到你的记录') }
  function saveTransaction(draft: TransactionDraft, id?: string) {
    const now = new Date().toISOString()
    id ? setTransactions(items => items.map(item => item.id === id ? { ...item, ...draft, updatedAt: now } : item))
      : setTransactions(items => [{ ...draft, id: crypto.randomUUID(), updatedAt: now }, ...items])
    setLedgerMonth(dateKey(new Date(draft.createdAt)).slice(0, 7)); setLedgerRevealMonth(value => value + 1); setComposer(null)
    show(id ? '账目已更新' : '账目已保存')
  }
  function exportBackup() { const blob = new Blob([JSON.stringify(exportData(notes, transactions, todos), null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `晴笺备份-${today()}.json`; link.click(); URL.revokeObjectURL(url); show('备份文件已生成') }
  async function importBackup(file?: File) { if (!file) return; try { const { data, keptExistingTodos } = importBackupData(JSON.parse(await file.text()), todos); setNotes(data.notes); setTransactions(data.transactions); setTodos(data.todos); show(keptExistingTodos ? '旧版备份已导入，当前待办已保留' : '记录、待办和账目已成功导入') } catch { show('导入失败：请选择晴笺备份文件') } finally { if (importRef.current) importRef.current.value = '' } }
  const trashNote = (id:string) => { setNotes(v=>v.map(n=>n.id===id?{...n,deletedAt:new Date().toISOString()}:n)); show('已移至回收站',{label:'撤销',run:()=>{setNotes(v=>v.map(n=>n.id===id?{...n,deletedAt:undefined}:n));setToast(null)}}) }
  const restoreNote = (id:string) => { setNotes(v=>v.map(n=>n.id===id?{...n,deletedAt:undefined}:n)); show('记录已恢复') }
  const deleteForever = (id:string) => show('永久删除后无法恢复',{label:'确认删除',run:()=>{setNotes(v=>v.filter(n=>n.id!==id));setToast({message:'记录已永久删除'})}})
  const deleteTodo = (id: string) => {
    const index = todos.findIndex(item => item.id === id), item = todos[index]
    if (!item) return
    setTodos(items => items.filter(todo => todo.id !== id))
    show('待办已删除', { label: '撤销', run: () => { setTodos(items => { if (items.some(todo => todo.id === id)) return items; const restored = [...items]; restored.splice(Math.min(index, restored.length), 0, item); return restored }); setToast(null) } })
  }
  const editLatestNote = (id: string) => {
    editHandoff.current?.cancel()
    const note = currentRecord(notesRef.current, id)
    if (note) setComposer({ type: 'note', note })
  }
  let viewContent: React.ReactNode
  if (view === 'todos') {
    viewContent = <TodoView items={todos} onAdd={(title, dueDate) => { const now = new Date().toISOString(); setTodos(items => [{ id: crypto.randomUUID(), title, dueDate, done: false, createdAt: now }, ...items]) }}
      onChange={(id, title, dueDate) => setTodos(items => items.map(item => item.id === id ? { ...item, title, dueDate, updatedAt: new Date().toISOString() } : item))}
      onToggle={id => setTodos(items => items.map(item => item.id === id ? { ...item, done: !item.done, updatedAt: new Date().toISOString() } : item))}
      onDelete={deleteTodo}/>
  } else if (view === 'ledger') {
    viewContent = <LedgerView items={transactions} month={ledgerMonth} revealMonth={ledgerRevealMonth} browserPetVisible={petShown && !isDesktop()} onMonth={setLedgerMonth}
      onAdd={date => setComposer({ type: 'transaction', date })}
      onEdit={item => setComposer({ type: 'transaction', item })}
      onDelete={id => { setTransactions(items => items.filter(item => item.id !== id)); show('账目已删除') }}/>
  } else if (view === 'settings') {
    viewContent = <SettingsView ambientEnabled={ambientEnabled} reducedMotion={reducedMotion}
      onAmbient={() => setAmbientEnabled(value => !value)} theme={theme}
      petShown={petShown} onPet={() => setPetShown(value => !value)} petName={PET_CHARACTER_NAMES[petAppearance.character]}
      onTheme={() => setTheme(value => value === 'light' ? 'dark' : 'light')}
      onOpenWardrobe={() => nav('pet')}
      onExport={exportBackup} onImport={() => importRef.current?.click()}/>
  } else if (view === 'pet') {
    viewContent = <div className="content pet-workspace">
      <div className="heading"><div><p className="eyebrow">你的本机伙伴</p><h1>伙伴</h1>
        <p className="subtle">挑选角色与装扮，穿上后陪你记录。</p></div></div>
      <PetShowcase theme={theme} motionAllowed={motionAllowed} visible={pageVisible}
        businessEnabled={businessEnabled} appearance={petAppearance} onApplyAppearance={applyPetAppearance}/>
    </div>
  } else if (view === 'garden') {
    viewContent = <Suspense fallback={<div className="content" role="status">正在打开记录时光…</div>}>
      <RecordGarden notes={activeNotes} renderNote={note => renderMarkdown(withoutTags(note.content) || '仅标签记录', petAppearance)}
        onOpenNote={editLatestNote} onCreate={createInView} animate={motionAllowed && pageVisible && businessEnabled}
        companionName={PET_CHARACTER_NAMES[petAppearance.character]}
        renderCompanionFigure={localAnimate => <PetPortrait appearance={petAppearance} mood="idle" animate={localAnimate}/>}/>
    </Suspense>
  } else if (view === 'graph') {
    viewContent = <Suspense fallback={<div className="content" role="status">正在打开关联图…</div>}>
      <NoteGraph notes={visibleNotes} graph={graph} session={graphSession} theme={theme} appearance={petAppearance}
        animate={motionAllowed} visible={pageVisible} enabled={ambientEnabled}
        onMotion={() => setAmbientEnabled(value => !value)} onCreate={() => setComposer({ type: 'note' })}
        onEdit={editLatestNote} onDelete={trashNote}
        locateRequest={locateRequest} onLocateResult={finishLocate} onLocate={id => requestLocate(id, false)}
        filters={{ query, selectedTag, unfinished, tags, onTag: selectTag, onPickTags: () => setTagPickerOpen(true), count: visibleNotes.length, onUnfinished: setUnfinished, onClear: clearFilters }}/>
    </Suspense>
  } else {
    viewContent = <NotesView layout={recordLayout} onLayout={setRecordLayout} view={view} appearance={petAppearance}
      dataVersion={notes} businessEnabled={sortingEnabled} motionAllowed={motionAllowed}
      onReorder={reorderNotes} onPin={id => setNotes(current => toggleNotePin(current, id))}
      notes={visibleNotes} tags={tags} pinnedTags={pinnedTags} query={query} selectedTag={selectedTag}
      unfinished={unfinished} onUnfinished={setUnfinished} onClear={clearFilters} onCopy={copyBody}
      onPickTags={() => setTagPickerOpen(true)}
      isTrash={view === 'trash'} onCreate={() => setComposer({ type: 'note' })}
      onToggle={id => setNotes(items => items.map(note => note.id === id ? { ...note, done: !note.done } : note))}
      onEdit={note => editLatestNote(note.id)} onOpenWheel={openWheel} onDelete={trashNote} onRestore={restoreNote}
      onDeleteForever={deleteForever} onTag={selectTag} onPinTag={togglePinTag}/>
  }
  return <SoftInteraction allowed={motionAllowed}><main className={`app-shell${motionAllowed ? '' : ' motion-disabled'}`}>
    <div className="workbench-light" aria-hidden="true"><i/><i/><i/></div>
    {isDesktop() && <div className="desktop-titlebar" inert={!!wheelEntryId} aria-hidden={!!wheelEntryId}><div className="desktop-drag" data-tauri-drag-region onDoubleClick={() => void getCurrentWindow().toggleMaximize()}><Sparkles size={14}/><span data-tauri-drag-region>晴笺</span></div><div className="desktop-controls"><button aria-label="最小化窗口" onClick={() => void getCurrentWindow().minimize()}><Minus size={16}/></button><button aria-label="最大化或还原窗口" onClick={() => void getCurrentWindow().toggleMaximize()}><Square size={12}/></button><button aria-label="关闭窗口" onClick={() => void getCurrentWindow().close()}><X size={16}/></button></div></div>}
    <header className="workbench-header" inert={!!wheelEntryId} aria-hidden={!!wheelEntryId}>
      <div className="brand"><span className="brand-mark"><Sparkles size={17}/></span><span>晴笺<small>留一点晴朗，给自己</small></span></div>
      <nav aria-label="主导航">
        <Nav icon={<LayoutList/>} text="记录" selected={view==='all'} onClick={()=>nav('all')}/>
        <Nav icon={<CheckSquare/>} text="待办" selected={view==='todos'} onClick={()=>nav('todos')}/>
        <Nav icon={<CalendarDays/>} text="记录时光" selected={view==='garden'} onClick={()=>nav('garden')}/>
        <Nav icon={<Network/>} text="关联图" selected={view==='graph'} onClick={()=>nav('graph')}/>
        <Nav icon={<Sparkles/>} text="伙伴" selected={view==='pet'} onClick={()=>nav('pet')}/>
        <Nav icon={<WalletCards/>} text="账本" selected={view==='ledger'} onClick={()=>nav('ledger')}/>
      </nav>
      <div className="workbench-utilities"><span className="local-status"><span className="local-dot"/>记录留在本机</span><SoftButton className={view==='trash'?'active':''} onClick={()=>nav('trash')}><Trash2 size={16}/>回收站</SoftButton><SoftButton className={view==='settings'?'active':''} onClick={()=>nav('settings')}><Settings size={16}/>设置</SoftButton><SoftButton className="new-button" onClick={createInView}><Plus size={17}/>{view==='ledger'?'记一笔':view==='todos'?'添加待办':'新建记录'}</SoftButton></div>
    </header>
    {pinnedTags.length>0 && <div className="quick-tags" inert={!!wheelEntryId} aria-hidden={!!wheelEntryId}>{pinnedTags.map(tag=><span key={tag}><button onClick={()=>selectTag(tag)}># {tag}</button><button aria-label={`取消固定${tag}`} onClick={()=>togglePinTag(tag)}><PinOff size={13}/></button></span>)}</div>}
    <section className="workspace" inert={!!wheelEntryId} aria-hidden={!!wheelEntryId}>
      <header className="topbar">
        {view==='all'||view==='trash'||view==='graph'?<div className="search"><Search size={18}/><input ref={searchRef} aria-label="搜索记录" data-search value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索记录和标签"/>{query&&<button aria-label="清除搜索" onClick={()=>setQuery('')}><X size={15}/></button>}</div>:<button className="search-link" onClick={()=>{nav('all');requestAnimationFrame(()=>searchRef.current?.focus())}}><Search size={17}/>查找记录</button>}
        <div className="topbar-actions"><SoftButton className="quick-open-button" aria-label="快速打开" disabled={!!composer || aiOpen || tagPickerOpen} onClick={() => setQuickOpen(true)}><Search size={16}/><span>快速打开</span><kbd>Ctrl K</kbd></SoftButton><SoftButton className="ai-button" aria-label="打开晴笺 AI" onClick={() => { editHandoff.current?.cancel(); setAiOpen(true) }}><Sparkles size={17}/><span>晴笺 AI</span></SoftButton><SoftButton aria-label={theme==='light'?'使用深色':'使用浅色'} className="theme-button" onClick={() => setTheme(v=>v==='light'?'dark':'light')}>{theme==='light'?<Moon size={18}/>:<Sun size={18}/>}</SoftButton></div>
      </header>
      {viewContent}
    </section>
    <PetCompanion theme={theme} motionAllowed={motionAllowed} visible={pageVisible} businessEnabled={businessEnabled}
      appearance={petAppearance} onOpenNotes={() => setQuickOpen(true)} onOpenTodos={() => setTodoReminder(true)}
      shown={petShown} hidden={!!wheelEntryId || view === 'settings' || view === 'pet' || view === 'garden' || view === 'graph'} onHide={() => setPetShown(false)}/>
    <input ref={importRef} className="visually-hidden" type="file" accept="application/json" disabled={!!wheelEntryId} onChange={e=>importBackup(e.target.files?.[0])}/>
    {wheelEntryId && <Modal title="记录年轮" className="celestial-wheel-frame" onClose={closeWheel}><Suspense fallback={<p role="status">正在打开记录年轮…</p>}><CelestialNoteWheel entryId={wheelEntryId} notes={activeNotes} graph={graph} theme={theme}
      motionAllowed={motionAllowed} visible={pageVisible} businessEnabled={!composer && !quickOpen && !tagPickerOpen && !aiOpen && !todoReminder}
      onClose={closeWheel} onOpenNote={openWheelRecord}/></Suspense></Modal>}
    {composer?.type==='note'&&<NoteComposer note={composer.note} availableTags={tags} appearance={petAppearance} animatePet={ambientEnabled && !reducedMotion && pageVisible} onClose={()=>setComposer(null)} onSave={saveNote}/>}
    {composer?.type==='transaction'&&<LedgerComposer item={composer.item} initialDate={composer.date} onClose={()=>setComposer(null)} onSave={saveTransaction}/>}
    {aiOpen&&<AiPanel notes={activeNotes} transactions={transactions} onClose={()=>setAiOpen(false)} onToast={show}/>}
    {quickOpen&&<QuickOpen notes={activeNotes} onClose={() => setQuickOpen(false)} onOpen={openRecord}/>}
    {todoReminder && <div ref={reminderPanel} className="todo-reminder" role="dialog" aria-label="今日待办"><div><b>今天的小清单</b><button ref={reminderClose} aria-label="关闭今日待办" onClick={() => setTodoReminder(false)}><X size={16}/></button></div>{todos.filter(item => !item.done && item.dueDate <= localDay).length ? <ul>{todos.filter(item => !item.done && item.dueDate <= localDay).slice(0, 5).map(item => <li key={item.id}>{item.title}</li>)}</ul> : <p>今天没有未完成的待办。</p>}<button className="todo-reminder-open" onClick={() => { setTodoReminder(false); nav('todos') }}>打开待办清单</button></div>}
    {tagPickerOpen&&<TagPicker tags={tags} selected={selectedTag} onTag={selectTag} onClose={() => setTagPickerOpen(false)}/>}
    {toast&&<div role="status" className="toast" inert={!!wheelEntryId}><span>{toast.message}</span>{toast.action&&<button onClick={toast.action.run}>{toast.action.label}</button>}</div>}
  </main></SoftInteraction>
}

function Nav({icon,text,count,selected,onClick,subdued=false}:{icon:React.ReactNode;text:string;count?:number;selected:boolean;onClick:()=>void;subdued?:boolean}) { return <SoftButton className={`${selected?'nav-item active':'nav-item'}${subdued?' subdued':''}`} onClick={onClick}>{icon}<span>{text}</span>{count?<em>{count}</em>:null}</SoftButton> }
function SettingsView({theme,onTheme,onExport,onImport,ambientEnabled,reducedMotion,onAmbient,petShown,onPet,petName,onOpenWardrobe}:{ambientEnabled:boolean;reducedMotion:boolean;onAmbient:()=>void;petShown:boolean;onPet:()=>void;petName:string;onOpenWardrobe:()=>void;theme:'light'|'dark';onTheme:()=>void;onExport:()=>void;onImport:()=>void}) { return <div className="content settings-view"><div className="heading"><div><p className="eyebrow">偏好与数据</p><h1>设置</h1><p className="subtle">你的数据只存放在这台设备上。</p></div></div><Setting title="外观" description="在浅色与深色之间切换" action={<button className="soft-button" onClick={onTheme}>{theme==='light'?<Moon size={16}/>:<Sun size={16}/>}{theme==='light'?'使用深色':'使用浅色'}</button>}/><Setting title="动态效果" description={reducedMotion?'已随系统减少动态效果，静态关联仍可操作':'让主体光场、记录节点与关联流光缓缓呼吸'} action={<button aria-pressed={ambientEnabled} className="soft-button" onClick={onAmbient}><Sparkles size={16}/>{ambientEnabled?'关闭动态':'开启动效'}</button>}/><Setting title="宠物伙伴" description={`让${petName}陪你留一点晴朗，可随时收起或重新开启`} action={<div className="pet-setting-actions"><button aria-pressed={petShown} className="soft-button" onClick={onPet}><Sparkles size={16}/>{petShown?'收起伙伴':'显示伙伴'}</button><SoftButton className="soft-button" onClick={onOpenWardrobe}>挑选装扮</SoftButton></div>}/><Setting title="导出备份" description="下载包含所有记录、待办和账目的 JSON 文件" action={<button className="soft-button" onClick={onExport}><Download size={16}/>导出</button>}/><Setting title="导入备份" description="导入会替换当前设备上的记录、待办和账目" action={<button className="soft-button" onClick={onImport}><FileUp size={16}/>导入</button>}/></div> }
function Setting({title,description,action}:{title:string;description:string;action:React.ReactNode}) { return <section className="settings-card"><div><b>{title}</b><p>{description}</p></div>{action}</section> }

function AiPanel({ notes, transactions, onClose, onToast }: { notes: Note[]; transactions: Transaction[]; onClose: () => void; onToast: (message: string) => void }) {
  const [prompt, setPrompt] = useState(''), [answer, setAnswer] = useState(''), [busy, setBusy] = useState(false), [configured, setConfigured] = useState<boolean | null>(null)
  useEffect(() => { prepareAi().then(setConfigured).catch(() => setConfigured(false)) }, [])
  const context = () => JSON.stringify({ notes: notes.slice(0, 50).map(n => ({ content:n.content, date:n.scheduledDate, done:n.done })), transactions: transactions.slice(0, 80).map(t => ({ amount:t.amount, category:t.category, kind:t.kind, note:t.note, date:t.createdAt })) })
  async function ask(value = prompt) { if (!value.trim()) return; if (!isDesktop()) { setAnswer('AI 功能需要在原生桌面版中运行，这样 API 密钥才不会暴露在浏览器。请运行 npm run desktop。'); return } if (!configured) { onToast('未能从本机配置导入 DeepSeek 密钥'); return } setBusy(true); setAnswer(''); try { const reply = await askAi(value, context()); setAnswer(reply.content) } catch { setAnswer('这次请求没有完成。请检查网络和 DeepSeek 账户余额后重试。') } finally { setBusy(false) } }
  return <div className="ai-drawer"><header><div><span className="ai-orb"><Sparkles size={16}/></span><div><b>晴笺 AI</b><p>{configured === null ? '检测本机 AI 配置…' : configured ? 'DeepSeek V4.1-Flash 已就绪' : '桌面端 AI 未配置'}</p></div></div><button aria-label="关闭" onClick={onClose}><X size={19}/></button></header><div className="ai-content">{answer ? <div className="ai-answer">{answer}</div> : <div className="ai-intro"><span>✦</span><h2>想从哪里开始？</h2><p>我可以只基于你的本地记录，帮你整理与回顾。</p><button onClick={() => ask('请总结我近期的记录，并给出 3 条简短的行动建议。')}>总结记录</button><button onClick={() => ask('请从我的笔记中提取待办，并按日期与标签整理。')}>整理待办</button><button onClick={() => ask('请分析本月账目，指出最主要的支出方向和一个可实行的小建议。')}>分析账本</button></div>}</div><footer><textarea aria-label="向晴笺 AI 提问" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="问问你的笔记与账本…"/><button aria-label="发送提问" disabled={busy || !prompt.trim()} onClick={() => ask()}>{busy ? '思考中…' : <ArrowDownToLine size={18}/>}</button></footer></div>
}
