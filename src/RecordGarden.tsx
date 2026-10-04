import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Cuboid, Grid2X2, Pause, Play, Plus } from 'lucide-react'
import type { Note } from './types'
import { buildRecordGardenModel, dayLabel, localDateKey, monthCells, monthDays, shiftMonth } from './recordGardenModel'
import type { RecordDateBasis } from './recordGardenModel'
import RecordDayViews from './RecordDayViews'
import type { RecordDayView } from './RecordDayViews'
import { RecordCompanion } from './RecordCompanion'
import './record-garden.css'

type Props = {
  notes: readonly Note[]
  renderNote: (note: Note) => ReactNode
  onOpenNote: (id: string) => void
  onCreate: () => void
  animate?: boolean
}

function useGardenEnvironment() {
  const [today, setToday] = useState(() => localDateKey())
  const [timeZone, setTimeZone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [visible, setVisible] = useState(() => !document.hidden)
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    let midnightTimer: ReturnType<typeof setTimeout>
    const refresh = () => {
      clearTimeout(midnightTimer)
      setToday(localDateKey())
      setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
      setVisible(!document.hidden)
      const next = new Date()
      next.setHours(24, 0, 0, 0)
      midnightTimer = setTimeout(refresh, Math.max(1, next.getTime() - Date.now()))
    }
    const motion = () => setReduced(media.matches)
    refresh()
    media.addEventListener('change', motion)
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      clearTimeout(midnightTimer)
      media.removeEventListener('change', motion)
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [])
  return { today, timeZone, visible, reduced }
}

export default function RecordGarden({ notes, renderNote, onOpenNote, onCreate, animate = true }: Props) {
  const { today, timeZone, visible, reduced } = useGardenEnvironment()
  const [month, setMonth] = useState(() => today.slice(0, 7))
  const [selectedDate, setSelectedDate] = useState<string | null>(today)
  const [basis, setBasis] = useState<RecordDateBasis>('created')
  const [view, setView] = useState<RecordDayView>('calendar')
  const [angle, setAngle] = useState<'front' | 'side'>('front')
  const [motionEnabled, setMotionEnabled] = useState(true)
  const [limit, setLimit] = useState(30)
  const recordsRef = useRef<HTMLElement>(null)
  const revealFrom = useRef<number | null>(null)
  const model = useMemo(() => buildRecordGardenModel(notes, basis), [notes, basis, timeZone])
  const days = useMemo(() => monthDays(month, model), [month, model])
  const cells = useMemo(() => monthCells(month, model), [month, model])
  const records = selectedDate === null ? model.undated : model.days.get(selectedDate) ?? []
  const shownCount = Math.min(limit, records.length)
  const remaining = records.length - shownCount
  const count = days.reduce((total, day) => total + day.count, 0)
  const recordedDays = days.filter(day => day.count > 0).length
  const label = selectedDate === null ? '未指定日期' : dayLabel(selectedDate)
  const basisLabel = basis === 'created' ? '创建日期' : '记录日期'
  const motionAllowed = animate && motionEnabled && visible && !reduced
  const monthLabel = `${Number(month.slice(0, 4))}年${Number(month.slice(5))}月`
  useLayoutEffect(() => {
    if (revealFrom.current === null) return
    recordsRef.current?.querySelectorAll<HTMLButtonElement>('.rg-record-status button')[revealFrom.current]?.focus()
    revealFrom.current = null
  }, [limit])

  const selectDay = (date: string | null) => {
    revealFrom.current = null
    setSelectedDate(date)
    setLimit(30)
  }
  const changeBasis = (next: RecordDateBasis) => {
    revealFrom.current = null
    setBasis(next)
    setLimit(30)
  }
  const loadMore = () => {
    if (remaining <= 30) revealFrom.current = limit
    setLimit(value => value + 30)
  }
  const moveMonth = (delta: number) => {
    const next = shiftMonth(month, delta)
    const nextDays = monthDays(next, model)
    const day = Math.min(Number(selectedDate?.slice(8) ?? 1), nextDays.length)
    setMonth(next)
    selectDay(`${next}-${String(day).padStart(2, '0')}`)
  }
  const goToday = () => { setMonth(today.slice(0, 7)); selectDay(today) }

  return <section className="rg-page" aria-label="记录时光" data-motion={motionAllowed ? 'on' : 'off'}>
    <header className="rg-heading">
      <div><p className="rg-eyebrow">把日子慢慢收好</p><h1>记录时光</h1><p>点开一天，看看留下的片段。</p></div>
      <button className="rg-button rg-primary" onClick={onCreate}><Plus size={17}/>写一条记录</button>
    </header>
    <div className="rg-toolbar">
      <div className="rg-tabs" role="group" aria-label="日期统计口径">
        <button aria-pressed={basis === 'created'} onClick={() => changeBasis('created')}>创建日期</button>
        <button aria-pressed={basis === 'record'} onClick={() => changeBasis('record')}>记录日期</button>
      </div>
      <div className="rg-tabs" role="group" aria-label="时光展示形式">
        <button aria-pressed={view === 'calendar'} onClick={() => setView('calendar')}><CalendarDays size={15}/>月历</button>
        <button aria-pressed={view === 'heatmap'} onClick={() => setView('heatmap')}><Grid2X2 size={15}/>热力格</button>
        <button aria-pressed={view === 'spatial'} onClick={() => setView('spatial')}><Cuboid size={15}/>立体</button>
      </div>
    </div>
    <p className="rg-basis-note">{basis === 'created'
      ? '按本机日期统计新建记录；修改记录不会增加次数。'
      : '按你为记录选择的日期整理；没有指定日期时使用创建日期。'}</p>
    <div className="rg-layout">
      <section className="rg-calendar-panel" aria-label={`${monthLabel}记录分布`}>
        <div className="rg-month-nav">
          <div><h2>{monthLabel}</h2><p><strong>{count}</strong> 条记录 · <strong>{recordedDays}</strong> 天留下片段</p></div>
          <div><button className="rg-icon" aria-label="上个月" disabled={month === '0001-01'} onClick={() => moveMonth(-1)}><ChevronLeft size={18}/></button><button className="rg-button" onClick={goToday}>今天</button><button className="rg-icon" aria-label="下个月" disabled={month === '9999-12'} onClick={() => moveMonth(1)}><ChevronRight size={18}/></button></div>
        </div>
        {view === 'spatial' && <div className="rg-spatial-controls">
          <div className="rg-tabs" role="group" aria-label="立体视角"><button aria-pressed={angle === 'front'} onClick={() => setAngle('front')}>正看</button><button aria-pressed={angle === 'side'} onClick={() => setAngle('side')}>侧看</button></div>
          <span>柱高按数量分档，具体条数写在日期下方。</span>
        </div>}
        <RecordDayViews cells={cells} selectedDate={selectedDate} today={today} view={view} angle={angle} animate={motionAllowed} onSelect={selectDay}/>
        <div className="rg-calendar-footer">
          <button className="rg-motion-toggle" onClick={() => setMotionEnabled(value => !value)}>{motionEnabled ? <Pause size={14}/> : <Play size={14}/>}<span>{motionEnabled ? '暂停动态' : '开启动效'}</span></button>
          {reduced && <span>已跟随系统减少动态效果</span>}
          {model.undated.length > 0 && <button className="rg-undated" aria-pressed={selectedDate === null} onClick={() => selectDay(null)}>未指定日期 · {model.undated.length} 条</button>}
        </div>
      </section>
      <aside className="rg-detail-panel">
        <RecordCompanion selectedDate={selectedDate} dateLabel={label} count={records.length} unfinishedCount={records.filter(note => !note.done).length} basisLabel={basisLabel} animate={motionAllowed} onCreate={onCreate} onToday={goToday}/>
        <section ref={recordsRef} className="rg-records" aria-label="所选日期记录">
          <header><div><p>{selectedDate === today ? '今天的片段' : '这一天的片段'}</p><h2>{label}</h2></div><span>{records.length} 条</span></header>
          <p className="rg-list-status" role="status" aria-atomic="true">{label} · {basisLabel} · 已显示 {shownCount} / 共 {records.length} 条</p>
          {records.length ? <>
            {records.slice(0, limit).map((note, index) => <article className="rg-record" key={note.id}>
              <div className="rg-record-status"><span>{note.done ? '已完成' : '未完成'}</span><button onClick={() => onOpenNote(note.id)} aria-label={`打开第${index + 1}条记录`}>打开记录</button></div>
              <div className="rg-record-body">{renderNote(note)}</div>
            </article>)}
            {remaining > 0 && <button className="rg-button rg-more" onClick={loadMore}>再看{Math.min(30, remaining)}条 · 还有{remaining}条</button>}
          </> : <div className="rg-empty"><CalendarDays size={28}/><p>这一天还没有记录</p><span>{basis === 'created' ? '愿意的话，记下此刻的一点想法。' : '也可以切到创建日期，回看当时写下的内容。'}</span><button className="rg-button" onClick={onCreate}>写一条记录</button></div>}
        </section>
      </aside>
    </div>
  </section>
}
