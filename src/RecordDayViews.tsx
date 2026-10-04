import { useId } from 'react'
import type { KeyboardEvent } from 'react'
import type { RecordDay } from './recordGardenModel'
import './record-day-views.css'

type Props = {
  cells: (RecordDay | null)[]
  selectedDate: string | null
  today: string
  animate: boolean
  onSelect: (date: string) => void
}

const weekdays = ['一', '二', '三', '四', '五', '六', '日']

export default function RecordDayViews({ cells, selectedDate, today, animate, onSelect }: Props) {
  const keyboardHintId = useId()
  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || event.nativeEvent.isComposing) return
    let nextIndex = index
    switch (event.key) {
      case 'ArrowLeft': nextIndex -= 1; break
      case 'ArrowRight': nextIndex += 1; break
      case 'ArrowUp': nextIndex -= 7; break
      case 'ArrowDown': nextIndex += 7; break
      case 'Home':
        nextIndex = Math.floor(index / 7) * 7
        while (!cells[nextIndex]) nextIndex += 1
        break
      case 'End':
        nextIndex = Math.floor(index / 7) * 7 + 6
        while (!cells[nextIndex]) nextIndex -= 1
        break
      default: return
    }
    event.preventDefault()
    if (!cells[nextIndex]) return
    const nextButton = event.currentTarget.parentElement?.children.item(nextIndex)
    if (nextButton instanceof HTMLButtonElement) nextButton.focus()
  }

  return <div className="rg-day-view" data-animate={animate}>
    <div className="rg-day-weekdays" aria-hidden="true">
      {weekdays.map(day => <span key={day}>{day}</span>)}
    </div>
    <div className="rg-day-cells">
      {cells.map((day, index) => {
        if (!day) return <span className="rg-day-blank" key={`blank-${index}`} aria-hidden="true" />
        const level = day.count === 0 ? 0 : day.count === 1 ? 1 : day.count <= 3 ? 2 : day.count <= 6 ? 3 : 4
        const [year, month, date] = day.date.split('-')
        const isToday = day.date === today
        const label = `${year}年${Number(month)}月${Number(date)}日，星期${weekdays[index % 7]}，${day.count}条记录${isToday ? '，今天' : ''}`
        return <button type="button" key={day.date}
          className={`rg-day-cell rg-day-level-${level}`}
          aria-label={label} aria-pressed={day.date === selectedDate} aria-current={isToday ? 'date' : undefined}
          aria-describedby={keyboardHintId}
          onClick={() => onSelect(day.date)} onKeyDown={event => moveFocus(event, index)}>
          <span className="rg-day-date">{Number(date)}{isToday && <small className="rg-day-today">今</small>}</span>
          <span className="rg-day-mark" aria-hidden="true" />
          <span className="rg-day-count">{day.count} 条</span>
        </button>
      })}
    </div>
    <p className="rg-day-keyboard-hint" id={keyboardHintId}>方向键在本月移动，Home / End 到本周首尾；Enter 或空格查看记录。</p>
  </div>
}
