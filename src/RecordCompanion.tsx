import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import './record-companion.css'

type RecordCompanionProps = {
  selectedDate: string | null
  dateLabel: string
  count: number
  unfinishedCount: number
  basisLabel: string
  animate: boolean
  onCreate: () => void
  onToday: () => void
  renderCompanionFigure?: (animate: boolean) => ReactNode
  companionName?: string
}

export function RecordCompanion({ selectedDate, dateLabel, count, unfinishedCount, basisLabel, animate, onCreate, onToday, renderCompanionFigure, companionName }: RecordCompanionProps) {
  const [hidden, setHidden] = useState(false)
  const bodyId = useId()
  const name = companionName ?? '小伙伴'

  return <section className="rg-companion-card" data-animate={animate && !hidden} aria-label={companionName ? `${companionName} · 记录小伙伴` : '记录小伙伴'}>
    <div className="rg-companion-header">
      <span className="rg-companion-name">{name} · 一起回顾</span>
      <button type="button" className="rg-companion-toggle" aria-expanded={!hidden} aria-controls={bodyId} onClick={() => setHidden(value => !value)}>
        {hidden ? '显示小伙伴' : '隐藏小伙伴'}
      </button>
    </div>
    <div id={bodyId} className="rg-companion-body" hidden={hidden}>
      <div className="rg-companion-figure" data-shared={Boolean(renderCompanionFigure)} aria-hidden="true">
        {renderCompanionFigure ? renderCompanionFigure(animate && !hidden) : <svg className="rg-companion-robot" viewBox="0 0 32 36" focusable="false" shapeRendering="crispEdges">
          <rect className="rg-companion-metal" x="15" y="3" width="2" height="4"/>
          <rect className="rg-companion-light" x="14" y="1" width="4" height="3"/>
          <rect className="rg-companion-outline" x="8" y="7" width="16" height="2"/>
          <rect className="rg-companion-outline" x="6" y="9" width="20" height="14"/>
          <rect className="rg-companion-shell" x="8" y="9" width="16" height="12"/>
          <rect className="rg-companion-metal" x="4" y="12" width="2" height="6"/>
          <rect className="rg-companion-metal" x="26" y="12" width="2" height="6"/>
          <rect className="rg-companion-screen" x="9" y="11" width="14" height="7"/>
          <g className="rg-companion-eyes">
            <rect className="rg-companion-eye" x="11" y="13" width="3" height="2"/>
            <rect className="rg-companion-eye" x="18" y="13" width="3" height="2"/>
          </g>
          <rect className="rg-companion-cheek" x="9" y="19" width="3" height="1"/>
          <rect className="rg-companion-cheek" x="20" y="19" width="3" height="1"/>
          <rect className="rg-companion-metal" x="13" y="21" width="6" height="3"/>
          <rect className="rg-companion-outline" x="9" y="24" width="14" height="7"/>
          <rect className="rg-companion-shell" x="11" y="24" width="10" height="5"/>
          <rect className="rg-companion-light" x="14" y="25" width="4" height="3"/>
          <rect className="rg-companion-metal" x="6" y="24" width="3" height="5"/>
          <rect className="rg-companion-metal" x="23" y="24" width="3" height="5"/>
          <rect className="rg-companion-outline" x="9" y="31" width="5" height="3"/>
          <rect className="rg-companion-outline" x="18" y="31" width="5" height="3"/>
        </svg>}
      </div>
      <div className="rg-companion-copy">
        <h3 className="rg-companion-date">{selectedDate === null ? '未指定日期的记录' : dateLabel}</h3>
        <p className="rg-companion-summary">
          {selectedDate === null ? `未指定日期的记录有 ${count} 条` : `按${basisLabel}有 ${count} 条记录`}，当前未完成 {unfinishedCount} 条。
        </p>
        <p className="rg-companion-note">慢慢来，留一点晴朗给自己。</p>
      </div>
      <div className="rg-companion-actions">
        <button type="button" className="rg-companion-create" onClick={onCreate}>写一条记录</button>
        <button type="button" className="rg-companion-today" onClick={onToday}>回到今天</button>
      </div>
    </div>
  </section>
}
