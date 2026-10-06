import { useEffect, useInsertionEffect, useLayoutEffect, useRef, useState } from 'react'
import { DragDropProvider, DragOverlay, useDragDropManager } from '@dnd-kit/react'
import { isSortable, useSortable } from '@dnd-kit/react/sortable'
import { Accessibility, Feedback, KeyboardSensor, PointerActivationConstraints, PointerSensor } from '@dnd-kit/dom'
import type { DragDropManager, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/dom'
import type { NoteGroup, NoteLayout } from './notePresentation'
import type { Note } from './types'
import { validDropPosition, movedIds, sameIds } from './noteOrder'
import { dateLabel } from './recordTools'

export type SortableCardRefs = {
  cardRef: (element: Element | null) => void
  handleRef: (element: Element | null) => void
  dragging: boolean
}
type SortSession = { valid: boolean; id: string; group: string; ids: string[]; from: number; keyboard: boolean }
type SortOwner = { alive: boolean; manager: DragDropManager | null; session: SortSession | null }
type Props = {
  groups: NoteGroup[]; layout: NoteLayout; context: string; dataVersion: Note[]
  enabled: boolean; motionAllowed: boolean
  onReorder: (orderedIds: string[], expectedIds: string[]) => void
  renderCard: (note: Note, refs: SortableCardRefs) => React.ReactNode
  renderOverlay: (note: Note) => React.ReactNode
}

function ManagerBinding({ owner }: { owner: SortOwner }) {
  owner.manager = useDragDropManager()
  return null
}

function SortLifetime({ owner, children }: { owner: SortOwner; children: React.ReactNode }) {
  useLayoutEffect(() => {
    // StrictMode replays layout effects without destroying this Provider.
    owner.alive = true
    return () => {
      owner.alive = false
      if (owner.session) owner.session.valid = false
      // Parent layout cleanup precedes the child Provider's insertion destroy.
      // Stop first so its Renderer never receives dragend inside insertion cleanup.
      owner.manager?.actions.stop({ canceled: true })
    }
  }, [owner])
  return children
}

function SortableCard({ note, group, index, enabled, motionAllowed, render }: {
  note: Note; group: string; index: number; enabled: boolean; motionAllowed: boolean; render: Props['renderCard']
}) {
  const sortable = useSortable({ id: note.id, index, group, type: group, accept: group,
    disabled: !enabled, transition: { duration: motionAllowed ? 180 : 0 } })
  return render(note, { cardRef: sortable.ref, handleRef: sortable.handleRef, dragging: sortable.isDragSource })
}

const sensors = [PointerSensor.configure({
  activationConstraints: [new PointerActivationConstraints.Distance({ value: 5 })],
  preventActivation: event => !event.isPrimary || event.button !== 0,
}), KeyboardSensor]
const chineseAccessibility = Accessibility.configure({
  screenReaderInstructions: { draggable: '按空格或回车开始调整记录顺序，方向键移动，空格或回车放下，Escape 取消。只能在同一区域内排序。' },
  announcements: {
    dragstart: () => '已拿起记录。使用方向键调整顺序，Escape 取消。',
    dragover: (event: DragOverEvent) => isSortable(event.operation.source) ? `记录移到本区域第 ${event.operation.source.index + 1} 个位置。` : undefined,
    dragend: (event: DragEndEvent) => event.canceled ? '已取消调整，记录顺序保持不变。' : '已放下记录。',
  },
})

export function NoteSorter(props: Props) {
  const [generation, setGeneration] = useState(0)
  const mounted = useRef(false)
  const root = useRef<HTMLDivElement>(null)
  const groupElements = useRef(new Map<string, HTMLDivElement>())
  const focusRequest = useRef<{ id: string; context: string; commit?: { data: Note[]; group: string; ids: string[] } } | null>(null)
  const latest = useRef(props); latest.current = props
  const identity = useRef<{ context: string; data: Note[]; enabled: boolean; generation: number; serial: number; owner: SortOwner } | null>(null)
  const previous = identity.current
  if (!previous || previous.context !== props.context || previous.data !== props.dataVersion || previous.enabled !== props.enabled || previous.generation !== generation) {
    if (previous) {
      previous.owner.alive = false
      if (previous.owner.session) previous.owner.session.valid = false
    }
    identity.current = { context: props.context, data: props.dataVersion, enabled: props.enabled, generation,
      serial: (previous?.serial ?? 0) + 1, owner: { alive: true, manager: null, session: null } }
  }
  const current = identity.current!
  const owner = current.owner

  // Invalid callbacks never update React state, including during Provider destruction.
  const requestReset = (captured: typeof current, focusId?: string, committedIds?: string[]) => {
    if (focusId && captured.owner.alive && identity.current === captured && latest.current.enabled && !document.hidden && document.hasFocus()) {
      focusRequest.current = { id: focusId, context: captured.context,
        commit: committedIds ? { data: captured.data, group: captured.owner.session!.group, ids: committedIds } : undefined }
    }
    queueMicrotask(() => {
      if (!mounted.current || !captured.owner.alive || identity.current !== captured || latest.current.context !== captured.context) return
      setGeneration(value => value + 1)
    })
  }
  const cancel = () => {
    const captured = identity.current!
    if (captured.owner.session) captured.owner.session.valid = false
    focusRequest.current = null
    captured.owner.manager?.actions.stop({ canceled: true })
    requestReset(captured)
  }
  useInsertionEffect(() => () => {
    const active = identity.current?.owner
    if (active) {
      active.alive = false
      if (active.session) active.session.valid = false
    }
  }, [])
  useLayoutEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])
  useEffect(() => {
    const onBlur = () => cancel()
    const onVisibility = () => { if (document.hidden) cancel() }
    window.addEventListener('blur', onBlur)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])
  useLayoutEffect(() => {
    const focus = focusRequest.current
    if (!focus) return
    if (focus.context !== props.context || !props.enabled || document.hidden || !document.hasFocus()) {
      focusRequest.current = null
      return
    }
    // A reset generation may render before the parent transition commits data.
    if (focus.commit && focus.commit.data === props.dataVersion) return
    focusRequest.current = null
    if (focus.commit && !sameIds(props.groups.find(group => group.id === focus.commit!.group)?.notes.map(note => note.id) ?? [], focus.commit.ids)) return
    const handle = [...(root.current?.querySelectorAll<HTMLButtonElement>('[data-note-handle]') ?? [])].find(element => element.dataset.noteHandle === focus.id)
    handle?.focus({ preventScroll: true })
  }, [current.serial, props.context, props.enabled])

  const capture = (event: DragStartEvent) => {
    if (!owner.alive || identity.current !== current || !latest.current.enabled || document.hidden) return
    focusRequest.current = null
    const source = event.operation.source
    if (!isSortable(source)) return
    const group = latest.current.groups.find(group => group.id === source.group)
    if (!group || group.notes[source.initialIndex]?.id !== source.id) return
    owner.session = { valid: true, id: String(source.id), group: group.id,
      ids: group.notes.map(note => note.id), from: source.initialIndex,
      keyboard: event.operation.activatorEvent?.type.startsWith('key') ?? false }
  }
  const finish = (event: DragEndEvent) => {
    const session = owner.session
    if (!owner.alive || identity.current !== current || !session?.valid) return
    session.valid = false
    const reset = (committedIds?: string[]) => requestReset(current, session.keyboard ? session.id : undefined, committedIds)
    if (event.canceled) { reset(); return }
    const source = event.operation.source
    const group = latest.current.groups.find(group => group.id === session.group)
    if (!latest.current.enabled || document.hidden || latest.current.dataVersion !== current.data || !isSortable(source) || !group ||
        String(source.id) !== session.id || source.initialGroup !== session.group || source.group !== session.group || source.initialIndex !== session.from ||
        !sameIds(group.notes.map(note => note.id), session.ids)) { reset(); return }
    const ordered = movedIds(session.ids, source.initialIndex, source.index)
    if (!ordered) { reset(); return }
    const end = event.nativeEvent
    const pointer = end instanceof PointerEvent ? end : undefined
    const element = groupElements.current.get(session.group)
    if (!validDropPosition(session.keyboard, pointer, element?.getBoundingClientRect(), window.innerWidth, window.innerHeight)) { reset(); return }
    // Preserve the keyboard focus request before commit replaces this owner.
    reset(ordered)
    latest.current.onReorder(ordered, session.ids)
  }
  return <div ref={root} className="sortable-notes">
    <SortLifetime key={current.serial} owner={owner}>
    <DragDropProvider sensors={sensors}
      plugins={defaults => [...defaults, chineseAccessibility, Feedback.configure({ keyboardTransition: { duration: props.motionAllowed ? 180 : 0 } })]}
      onBeforeDragStart={event => { if (!latest.current.enabled || document.hidden) event.preventDefault() }}
      onDragStart={capture} onDragEnd={finish}>
      <ManagerBinding owner={owner}/>
      {props.groups.map(group => <section className={`note-order-group${group.id === 'pinned' ? ' pinned-records' : ''}`} key={group.id}>
        {group.id === 'pinned' ? <header className="note-section-heading"><span>置顶记录</span><small>{group.notes.length} 条</small></header>
          : group.date ? <header className="date-group-heading"><h2>{group.date === '未指定日期' ? group.date : `${group.date.slice(0,4)}年 ${dateLabel(group.date)}`}</h2><span>已显示 {group.notes.length} 条</span></header> : null}
        <div ref={element => { if (element) groupElements.current.set(group.id, element); else groupElements.current.delete(group.id) }}
          className={`note-grid${props.layout !== 'grid' ? ' reading-layout' : ''}`}>
          {group.notes.map((note, index) => <SortableCard key={note.id} note={note} index={index} group={group.id}
            enabled={props.enabled} motionAllowed={props.motionAllowed} render={props.renderCard}/>)}
        </div>
      </section>)}
      <DragOverlay className="note-sort-overlay" dropAnimation={props.motionAllowed ? { duration: 160, easing: 'ease-out' } : null}>
        {source => {
          const note = props.groups.flatMap(group => group.notes).find(note => note.id === source.id)
          return note ? props.renderOverlay(note) : null
        }}
      </DragOverlay>
    </DragDropProvider>
    </SortLifetime>
  </div>
}
