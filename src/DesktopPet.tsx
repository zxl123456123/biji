import { useEffect, useRef, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { PetFigure } from './PetFigure'
import { acceptSnapshot, PET_NATIVE_EVENT, PET_RESULT_EVENT, PET_SNAPSHOT_EVENT, PET_VISIBILITY_EVENT } from './desktopPetProtocol'
import type { PetAction, PetActionResult, PetGeometry, PetIntent, PetNativeEvent, PetSnapshot } from './desktopPetProtocol'
import { clampPetPoint, createPetMovement, planPetWalk, type PetFacing } from './desktopPetMotion'
import './desktop-pet.css'

export default function DesktopPet() {
  const [snapshot, setSnapshot] = useState<PetSnapshot | null>(null), [visible, setVisible] = useState(false)
  const [menu, setMenu] = useState(false), [hovered, setHovered] = useState(false), [rest, setRest] = useState(false), [autoRest, setAutoRest] = useState(false)
  const [happy, setHappy] = useState(false), [moving, setMoving] = useState(false), [looking, setLooking] = useState(false), [dragging, setDragging] = useState(false), [busy, setBusy] = useState(false)
  const [facing, setFacing] = useState<PetFacing>('right')
  const [notice, setNotice] = useState(false), [error, setError] = useState(''), [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [decision, setDecision] = useState(0)
  const snapshotRef = useRef(snapshot); snapshotRef.current = snapshot
  const nonce = useRef(`${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`), sequence = useRef(0)
  const inflight = useRef<{ owner: number; requestId: string; timer: ReturnType<typeof setTimeout> } | null>(null)
  const ack = useRef<string | null>(null), pointer = useRef<{ x: number; y: number; id: number; started: boolean } | null>(null)
  const dragId = useRef<number | null>(null), exitedId = useRef(0), dragTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const dragWatch = useRef<ReturnType<typeof setTimeout> | undefined>(undefined), moreButton = useRef<HTMLButtonElement>(null)
  const newestDrag = useRef(0)
  const mounted = useRef(false), movement = useRef(createPetMovement((id, p) => invoke('pet_move_step', { movementId: id, x: p.x, y: p.y }), id => invoke('pet_move_cancel', { movementId: id })))
  const present = !!snapshot?.protocolReady && snapshot.shown && visible
  const animate = present && !!snapshot?.motionEnabled && !reduced && !rest && !autoRest && !dragging
  const stop = () => { movement.current.stop(); setMoving(false) }
  const finishDrag = (id: number) => {
    clearTimeout(dragWatch.current)
    clearTimeout(dragTimer.current)
    let previous: PetGeometry | undefined
    const observe = async () => {
      if (!mounted.current || dragId.current !== id) return
      try {
        const geometry = await invoke<PetGeometry>('pet_geometry')
        if (!mounted.current || dragId.current !== id) return
        if (geometry.activeDragId !== null || geometry.lastExitedDragId !== id) return
        if (previous && previous.position.x === geometry.position.x && previous.position.y === geometry.position.y) {
          await invoke('pet_drag_finish', { dragId: id })
          if (mounted.current && dragId.current === id) { dragId.current = null; pointer.current = null; setDragging(false); setHovered(false) }
          return
        }
        previous = geometry; dragTimer.current = setTimeout(() => { void observe() }, 300)
      } catch { if (mounted.current) setError('拖动暂未确认，请再轻触伙伴') }
    }
    void observe()
  }
  const inspectDrag = async () => {
    if (dragId.current === null && !dragging) return
    try {
      const geometry = await invoke<PetGeometry>('pet_geometry')
      if (!mounted.current) return
      if (geometry.activeDragId === null && geometry.lastExitedDragId !== null
        && (dragId.current === null || geometry.lastExitedDragId === dragId.current)) {
        dragId.current = geometry.lastExitedDragId; finishDrag(geometry.lastExitedDragId)
      } else setError('正在等待原生拖动结束')
    } catch { if (mounted.current) setError('拖动暂未确认，请查看晴笺') }
  }
  useEffect(() => {
    mounted.current = true
    let cancelled = false
    const off: (() => void)[] = []
    const receiveSnapshot = (next: PetSnapshot) => {
      const accepted = acceptSnapshot(snapshotRef.current, next)
      snapshotRef.current = accepted; setSnapshot(accepted)
    }
    const register = async <T,>(name: string, handler: (payload: T) => void) => {
      const release = await getCurrentWindow().listen<T>(name, event => { if (!cancelled) handler(event.payload) })
      if (cancelled) release(); else off.push(release)
    }
    void (async () => {
      try {
        const registrations = await Promise.allSettled([
          register<PetSnapshot>(PET_SNAPSHOT_EVENT, receiveSnapshot),
          register<{ visible: boolean }>(PET_VISIBILITY_EVENT, next => setVisible(next.visible)),
          register<PetActionResult>(PET_RESULT_EVENT, result => {
            if (result.requestId === inflight.current?.requestId && result.owner === inflight.current.owner) {
              clearTimeout(inflight.current.timer); inflight.current = null; setBusy(false); setMenu(false)
              setError(result.status === 'handled' ? '' : result.reason ?? '桌面伙伴暂不可用')
            }
          }),
          register<PetNativeEvent>(PET_NATIVE_EVENT, event => {
            if (event.kind === 'drag-enter') { if (event.dragId < newestDrag.current) return; newestDrag.current = event.dragId; dragId.current = event.dragId; stop(); setDragging(true) }
            else if (event.kind === 'drag-exit') {
              if (event.dragId < newestDrag.current) return
              newestDrag.current = event.dragId
              exitedId.current = Math.max(exitedId.current, event.dragId)
              if (dragId.current === event.dragId || dragId.current === null) { dragId.current = event.dragId; finishDrag(event.dragId) }
            } else if (event.kind === 'move-external' && event.cancelledMovementId === movement.current.activeId && event.cancelledMovementId !== null) stop()
          }),
          register('tauri://scale-change', () => stop()),
        ])
        if (registrations.some(result => result.status === 'rejected')) throw new Error('listener unavailable')
        const initial = await invoke<{ snapshot: PetSnapshot; visible: boolean }>('pet_read')
        if (cancelled) return
        if (!snapshotRef.current || initial.snapshot.revision >= snapshotRef.current.revision) {
          receiveSnapshot(initial.snapshot); setVisible(initial.visible)
        }
      } catch { if (!cancelled) { off.splice(0).forEach(release => release()); setSnapshot(null); setVisible(false); setError('桌面伙伴暂不可用') } }
    })()
    return () => {
      cancelled = true; mounted.current = false; off.splice(0).forEach(release => release()); movement.current.stop()
      clearTimeout(inflight.current?.timer); clearTimeout(dragTimer.current)
      clearTimeout(dragWatch.current)
    }
  }, [])
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)'), update = () => setReduced(media.matches)
    media.addEventListener('change', update); return () => media.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    const blur = () => { setMenu(false); setHovered(false) }
    window.addEventListener('blur', blur); return () => window.removeEventListener('blur', blur)
  }, [])
  useEffect(() => { document.documentElement.dataset.theme = snapshot?.theme ?? 'light' }, [snapshot?.theme])
  useEffect(() => {
    stop(); clearTimeout(inflight.current?.timer); inflight.current = null; setBusy(false); setMenu(false); setNotice(false); ack.current = null
    clearTimeout(dragTimer.current); clearTimeout(dragWatch.current)
  }, [snapshot?.owner, snapshot?.protocolReady])
  useEffect(() => {
    if (!happy) return
    const timer = setTimeout(() => setHappy(false), 1400); return () => clearTimeout(timer)
  }, [happy])
  useEffect(() => {
    if (!looking) return
    const timer = setTimeout(() => setLooking(false), 2400)
    return () => clearTimeout(timer)
  }, [looking])
  useEffect(() => {
    if (!autoRest) return
    const timer = setTimeout(() => setAutoRest(false), 12_000 + Math.random() * 8_000)
    return () => clearTimeout(timer)
  }, [autoRest])
  useEffect(() => {
    if (!animate || hovered || menu || happy || moving || looking) return
    let cancelled = false
    const timer = setTimeout(() => {
      const random = Math.random()
      if (random < .45) { setDecision(value => value + 1); return }
      if (random < .7) { setLooking(true); return }
      if (random >= .9) { setAutoRest(true); return }
      void (async () => {
        try {
          const segment = await invoke<{ movementId: number; geometry: PetGeometry }>('pet_move_begin')
          if (cancelled) { await invoke('pet_move_cancel', { movementId: segment.movementId }); return }
          setMoving(true)
          const distance = (60 + Math.random() * 30) * segment.geometry.scaleFactor * (Math.random() < .5 ? -1 : 1)
          const walk = planPetWalk(segment.geometry, distance, clampPetPoint)
          if (!walk) { await invoke('pet_move_cancel', { movementId: segment.movementId }); return }
          setFacing(walk.facing)
          await movement.current.run(segment.movementId, segment.geometry, walk)
        } catch { if (!cancelled) setError('当前暂不能活动') }
        finally { if (mounted.current) { setMoving(false); setDecision(value => value + 1) } }
      })()
    }, 30_000 + Math.random() * 20_000)
    return () => { cancelled = true; clearTimeout(timer); movement.current.stop() }
  }, [animate, hovered, menu, happy, looking, decision])
  useEffect(() => {
    if (!animate || hovered || menu) stop()
    if (!present) { setMenu(false); setNotice(false); setAutoRest(false) }
  }, [animate, hovered, menu, present])
  useEffect(() => {
    const reminder = snapshot?.reminder
    if (!present || rest || autoRest) { setNotice(false); return }
    if (!reminder) return
    let alreadyShown = false
    try { alreadyShown = sessionStorage.getItem('qingjian-pet-last-shown-token') === reminder.token } catch { setError('提醒记录暂不可用'); return }
    if (alreadyShown) {
      if (ack.current !== `${snapshot.owner}:${reminder.token}`) sendAck()
      return
    }
    setNotice(true)
  }, [present, rest, autoRest, snapshot?.reminder?.token, snapshot?.owner])
  function sendAck() {
    const current = snapshotRef.current
    if (!current?.reminder) return
    ack.current = `${current.owner}:${current.reminder.token}`
    const action: PetAction = { owner: current.owner, requestId: `${nonce.current}:ack:${++sequence.current}`, intent: 'reminder-shown', reminder: current.reminder }
    void invoke('pet_action', { action }).catch(() => { ack.current = null })
  }
  useEffect(() => {
    if (!notice || !present || rest || autoRest || !snapshot?.reminder) return
    try { sessionStorage.setItem('qingjian-pet-last-shown-token', snapshot.reminder.token); sendAck() } catch { setError('提醒记录暂不可用') }
  }, [notice, present, rest, autoRest, snapshot?.reminder?.token])
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(false), 8000); return () => clearTimeout(timer) }, [notice])
  const action = (intent: PetIntent) => {
    if (!snapshot?.protocolReady || inflight.current) return
    stop(); setError('')
    const requestId = `${nonce.current}:${++sequence.current}`, owner = snapshot.owner
    const timer = setTimeout(() => { if (inflight.current?.requestId === requestId) { inflight.current = null; setBusy(false); setError('未确认，请查看晴笺') } }, 5000)
    inflight.current = { owner, requestId, timer }; setBusy(true)
    void invoke('pet_action', { action: { owner, requestId, intent } }).catch(() => {
      if (inflight.current?.requestId === requestId) { clearTimeout(timer); inflight.current = null; setBusy(false); setError('桌面伙伴暂不可用') }
    })
  }
  return <div className="desktop-pet" data-pet-ready={present} onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}
    onKeyDown={event => { if (event.key === 'Escape' && menu) { setMenu(false); moreButton.current?.focus() } }}>
    {present && <>
      <div className="desktop-pet-figure" role="button" aria-label="轻触伙伴，拖动可移动" tabIndex={0}
        onContextMenu={event => { event.preventDefault(); stop(); setMenu(value => !value) }}
        onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { setRest(false); setAutoRest(false); setHappy(true) } if (event.key === 'Escape') setMenu(false) }}
        onPointerDown={event => { if (event.button !== 0) return; stop(); pointer.current = { x: event.clientX, y: event.clientY, id: event.pointerId, started: false }; event.currentTarget.setPointerCapture(event.pointerId) }}
        onPointerMove={event => {
          const p = pointer.current
          if (!p || p.started || p.id !== event.pointerId || Math.hypot(event.clientX - p.x, event.clientY - p.y) < 6) return
          p.started = true; setDragging(true)
          void invoke<number>('pet_drag').then(id => {
            if (!mounted.current || id < newestDrag.current) return
            newestDrag.current = id
            if (id > exitedId.current) {
              dragId.current = id; clearTimeout(dragWatch.current)
              dragWatch.current = setTimeout(() => { if (mounted.current && dragId.current === id) setError('正在等待原生拖动结束') }, 10_000)
            } else { dragId.current = id; finishDrag(id) }
          }).catch(() => { pointer.current = null; setDragging(false); setError('伙伴暂不能拖动') })
        }}
        onPointerUp={event => {
          const p = pointer.current
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
          if (p && !p.started) { setRest(false); setAutoRest(false); setHappy(true); setError(''); void inspectDrag() }
          pointer.current = null
        }}>
        <PetFigure appearance={snapshot.appearance} mood={dragging ? 'dragging' : rest || autoRest ? 'resting' : happy ? 'happy' : 'idle'} animate={animate} activity={moving ? 'walk' : looking ? 'look' : undefined} facing={facing} onError={() => setError('三维暂不可用，已显示静态伙伴')}/>
      </div>
      <button ref={moreButton} className="desktop-pet-more" aria-label="伙伴更多操作" aria-expanded={menu} onClick={() => { stop(); setMenu(value => !value); void inspectDrag() }}>···</button>
      {menu && <div className="desktop-pet-menu" aria-label="伙伴操作"><button disabled={busy} onClick={() => action('quick-note')}>快记</button><button disabled={busy} onClick={() => action('open-todos')}>待办</button><button onClick={() => { stop(); setAutoRest(false); setRest(value => !value); setMenu(false) }}>{rest ? '唤醒' : '休息'}</button><button disabled={busy} onClick={() => action('hide')}>收起</button></div>}
      {notice && <div className="desktop-pet-notice" role="status"><b>今天有 {snapshot.dueCount} 项待办</b><ul>{snapshot.dueTitles.map((title, index) => <li key={index}>{title}</li>)}</ul><button disabled={busy} onClick={() => action('open-todos')}>查看待办</button></div>}
    </>}
    {error && <p className="desktop-pet-feedback" role="status">{error}</p>}
  </div>
}
