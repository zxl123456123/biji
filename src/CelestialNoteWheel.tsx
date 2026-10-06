import { useEffect, useMemo, useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { Note } from './types'
import type { GraphState } from './useNoteGraph'
import { plainNoteText } from './noteText'
import { tagsFor } from './recordTools'
import { buildCelestialWheelModel } from './celestialWheelModel'
import { createCelestialWheelScene } from './celestialWheelScene'
import type { WheelScene, WheelPolicy } from './celestialWheelScene'
import './celestial-wheel.css'

const previewSegments = new Intl.Segmenter('zh-CN', { granularity: 'grapheme' })
const notePreview = (content: string) => Array.from(previewSegments.segment(plainNoteText(content)), part => part.segment).slice(0, 70).join('') || '仅标签记录'

export default function CelestialNoteWheel({ entryId, notes, graph, theme, motionAllowed, visible, businessEnabled, onClose, onOpenNote }:
  { entryId: string; notes: readonly Note[]; graph: GraphState; theme: 'light' | 'dark'; motionAllowed: boolean; visible: boolean;
    businessEnabled: boolean; onClose: () => void; onOpenNote: (id: string) => void }) {
  const model = useMemo(() => buildCelestialWheelModel(entryId, notes, graph), [entryId, notes, graph])
  const [selectedDate, setSelectedDate] = useState('')
  const [paused, setPaused] = useState(false), [expanded, setExpanded] = useState(false)
  const [sceneError, setSceneError] = useState<string | null>(null), [attempt, setAttempt] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null), sceneRef = useRef<WheelScene | null>(null)
  const ready = model.kind === 'ready' ? model : null
  const selected = ready?.daysByKey.has(selectedDate) ? selectedDate : ready?.centerDate ?? ''
  const selectedDay = ready?.daysByKey.get(selected)
  const selectedMonth = ready?.months[Number(selected.slice(5, 7)) - 1]
  const policy: WheelPolicy = { visible, focused: typeof document !== 'undefined' && document.hasFocus(), businessEnabled,
    motionAllowed, paused }
  useEffect(() => {
    if (!ready || sceneError || !canvasRef.current) return
    let owner: WheelScene
    try {
      owner = createCelestialWheelScene(canvasRef.current, { model: ready, selectedDate: selected, theme, policy,
        onSelectDate: setSelectedDate, onFailure: reason => setSceneError(reason) })
      sceneRef.current = owner
    } catch (error) { setSceneError(error instanceof Error ? error.message : '画布初始化失败'); return }
    return () => { owner.dispose(); if (sceneRef.current === owner) sceneRef.current = null }
  }, [entryId, attempt, sceneError, ready?.year])
  useEffect(() => { if (ready) sceneRef.current?.setModel(ready) }, [ready])
  useEffect(() => sceneRef.current?.select(selected), [selected])
  useEffect(() => sceneRef.current?.setTheme(theme), [theme])
  useEffect(() => sceneRef.current?.setPolicy(policy), [visible, businessEnabled, motionAllowed, paused])
  const selectMonth = (month: number) => { const first = ready?.months[month - 1].days[0]; if (first) setSelectedDate(first.key) }
  const retry = () => { setSceneError(null); setAttempt(value => value + 1) }
  return <section className="celestial-wheel" aria-label="十二个月记录年轮">
    <header className="celestial-wheel-head"><div><p>本地记录 · 十二个月</p><h2>记录年轮</h2></div><button className="soft-button" aria-label="关闭记录年轮" onClick={onClose}><X size={18}/>返回记录</button></header>
    {model.kind === 'missing' ? <p role="status">这条记录已不可用。</p> : model.kind === 'undated' ? <div className="celestial-wheel-undated"><p>这条记录的创建时间无法解析，无法生成记录年轮。</p><button className="soft-button" onClick={() => onOpenNote(model.center.id)}>打开原记录</button></div> : <>
      <p className="celestial-wheel-summary">入口记录创建于 {ready!.year} 年 · 全年全部未删除记录共 {ready!.months.reduce((total, month) => total + month.count, 0)} 条。年轮按创建日归位；卡片若设置了记录日期，卡片显示的日期可能不同。强调的记录才是本地关联图中的直接关联。</p>
      <p className="celestial-wheel-center"><span>中心记录</span><strong>{notePreview(ready!.center.content)}</strong></p>
      <div className="celestial-wheel-layout">
        <div className="celestial-wheel-visual">
          {!sceneError && <canvas key={attempt} ref={canvasRef} aria-label="十二个月日期环，点击日期可在右侧查看"/>}
          {sceneError && <div className="celestial-wheel-fallback" role="status">三维画面暂不可用，仍可通过右侧月份和日期打开记录。<small>原因：{sceneError}</small><button className="soft-button" onClick={retry}>重试画面</button></div>}
          <div className="celestial-wheel-visual-controls"><button className="soft-button" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? '继续动态' : '暂停动态'}</button><button className="soft-button" onClick={() => { setExpanded(value => !value); setPaused(true); sceneRef.current?.setExpanded(!expanded) }}>{expanded ? '收合年轮' : '展开年轮'}</button></div>
        </div>
        <div className="celestial-wheel-navigation"><h3>{ready!.year} 年</h3><p>{graph.status === 'ready' ? '亮色标记为入口记录的直接关联。' : graph.status === 'error' ? '关联暂不可用，日期与记录仍可查看。' : '正在整理关联，暂不显示关联标记。'}</p>
          <div className="celestial-wheel-months" aria-label="月份">{ready!.months.map(month => <button key={month.key} className={selectedMonth?.key === month.key ? 'active' : ''} aria-pressed={selectedMonth?.key === month.key} onClick={() => selectMonth(month.month)}>{month.month} 月 <small>{month.count}</small></button>)}</div>
          <h3>{selectedMonth?.month} 月 · 选择日期</h3><div className="celestial-wheel-days" aria-label="有效日期">{selectedMonth?.days.map(day => <button key={day.key} className={day.key === selected ? 'active' : ''} aria-pressed={day.key === selected} aria-label={`${selectedMonth.month}月${day.day}日，${day.count}条记录${day.relatedIds.length ? `，${day.relatedIds.length}条直接关联` : ''}`} onClick={() => setSelectedDate(day.key)}>{day.day}<small>{day.count || '·'}</small>{day.relatedIds.length > 0 && <b aria-hidden="true">✦</b>}</button>)}</div>
          <h3>{selected.slice(5).replace('-', ' 月 ')} 日 · {selectedDay?.count ?? 0} 条记录</h3>{selectedDay?.count ? <ul className="celestial-wheel-records">{selectedDay.noteIds.map(id => { const note = notes.find(item => item.id === id && !item.deletedAt); if (!note) return null; const related = selectedDay.relatedIds.includes(id); return <li key={id}><button onClick={() => onOpenNote(id)}><strong>{notePreview(note.content)}{id === entryId && <em>中心记录</em>}</strong><span>{tagsFor(note.content).map(tag => `#${tag}`).join(' ')}{related ? ' · 与入口直接关联' : ''}</span></button></li> })}</ul> : <p className="celestial-wheel-empty">当天无记录。</p>}
        </div>
      </div>
    </>}
  </section>
}
