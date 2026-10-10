import { useEffect, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, Plus, Trash2, X } from 'lucide-react'
import type { Transaction } from './types'
import { dateKey, money, monthTotals, selectMonth, today } from './recordTools'
import { defaultLedgerDate, ledgerDays, ledgerYear, monthDate, shiftLedgerMonth, transactionDate } from './ledgerTools'
import type { TransactionDraft } from './ledgerTools'
import { Modal } from './Modal'
import './ledger.css'

export function LedgerView({ items, month, revealMonth, browserPetVisible, onMonth, onAdd, onEdit, onDelete }: {
  items: Transaction[]; month: string; revealMonth: number; browserPetVisible: boolean; onMonth: (month: string) => void; onAdd: (date: string) => void
  onEdit: (item: Transaction) => void; onDelete: (id: string) => void
}) {
  const [annual, setAnnual] = useState(false)
  useEffect(() => { setAnnual(false) }, [revealMonth])
  const year = Number(month.slice(0, 4)), monthly = selectMonth(items, monthDate(month))
  const months = ledgerYear(items, year)
  const totals = annual ? months.reduce((sum, item) => ({ income: sum.income + item.income, expense: sum.expense + item.expense }), { income: 0, expense: 0 }) : monthTotals(monthly)
  const categories = Object.entries(monthly.filter(item => item.kind === 'expense').reduce<Record<string, number>>((sum, item) => {
    sum[item.category] = (sum[item.category] ?? 0) + item.amount; return sum
  }, {})).sort((a, b) => b[1] - a[1])
  const move = (delta: number) => onMonth(shiftLedgerMonth(month, annual ? delta * 12 : delta))
  return <div className={`content ledger ledger-history${browserPetVisible ? ' ledger-with-pet' : ''}`}>
    <div className="heading"><div><p className="eyebrow">生活账本</p><h1>{annual ? `${year} 年回顾` : `${year} 年 ${Number(month.slice(5))} 月`}</h1><p className="subtle">看见收支的来去，留住生活的细节。</p></div><button className="soft-button" onClick={() => onAdd(defaultLedgerDate(month))}><Plus size={16}/>记一笔</button></div>
    <div className="ledger-toolbar">
      <div className="filter-tabs" aria-label="账本查看方式"><button aria-pressed={!annual} className={!annual ? 'selected' : ''} onClick={() => setAnnual(false)}>月度明细</button><button aria-pressed={annual} className={annual ? 'selected' : ''} onClick={() => setAnnual(true)}>年度回顾</button></div>
      <div className="ledger-period"><button aria-label={annual ? '上一年' : '上一月'} disabled={annual ? year <= 1 : month === '0001-01'} onClick={() => move(-1)}><ChevronLeft size={16}/></button>
        <label><span className="ledger-sr-only">选择年月</span><input aria-label="选择年月" type="month" min="0001-01" max="9999-12" value={month} onChange={event => { if (/^\d{4}-\d{2}$/.test(event.target.value) && Number(event.target.value.slice(0, 4)) >= 1) onMonth(event.target.value) }}/></label>
        <button aria-label={annual ? '下一年' : '下一月'} disabled={annual ? year >= 9999 : month === '9999-12'} onClick={() => move(1)}><ChevronRight size={16}/></button><button className="ledger-current" onClick={() => { onMonth(today().slice(0, 7)); setAnnual(false) }}>回到本月</button>
      </div>
    </div>
    <div className="stat-grid"><Stat label={annual ? '全年结余' : '月度结余'} value={totals.income - totals.expense} tone="purple"/><Stat label="收入" value={totals.income} tone="green"/><Stat label="支出" value={totals.expense} tone="orange"/></div>
    <p className="ledger-balance-hint">结余为所选期间收入减支出。</p>
    {annual ? <section className="ledger-year"><div className="ledger-title"><h2>十二个月</h2><span>点击月份查看明细</span></div><div className="ledger-months">{months.map(item => <button key={item.month} className="ledger-month-card" onClick={() => { onMonth(item.month); setAnnual(false) }}><div><b>{Number(item.month.slice(5))} 月</b><small>{item.count} 笔</small></div><dl><div><dt>收入</dt><dd className="income">{money(item.income)}</dd></div><div><dt>支出</dt><dd className="expense">{money(item.expense)}</dd></div><div><dt>结余</dt><dd>{money(item.income - item.expense)}</dd></div></dl></button>)}</div></section>
      : <div className="ledger-detail"><section className="spending"><div className="ledger-title"><h2>支出分布</h2><span>{categories.length} 类</span></div>{categories.length ? categories.map(([name, amount]) => <div className="bar-row" key={name}><span>{name}</span><i><b style={{ width: `${amount / totals.expense * 100}%` }}/></i><strong>{money(amount)}</strong><small>{Math.round(amount / totals.expense * 100)}%</small></div>) : <p className="ledger-no-spending">这个月还没有支出。</p>}</section>
        <section className="ledger-list"><div className="ledger-title"><h2>月度流水</h2><span>{monthly.length} 笔</span></div>{monthly.length ? ledgerDays(monthly).map(group => <section className="ledger-day" key={group.day}><header><h3>{new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date(`${group.day}T12:00:00`))}</h3><span>收入 {money(group.income)} · 支出 {money(group.expense)}</span></header>{group.entries.map(item => <article className="transaction" key={item.id}><button aria-label={`编辑${item.category}账目`} className={item.kind === 'income' ? 'txn-icon income' : 'txn-icon'} onClick={() => onEdit(item)}>{item.kind === 'income' ? <ArrowDownLeft size={18}/> : <ArrowUpRight size={18}/>}</button><button className="transaction-main" onClick={() => onEdit(item)}><b>{item.category}</b><p>{item.note || '未添加备注'}</p></button><strong className={item.kind}>{item.kind === 'income' ? '+' : '-'}{money(item.amount)}</strong><button aria-label={`删除${item.category}账目`} className="delete-transaction" onClick={() => onDelete(item.id)}><Trash2 size={15}/></button></article>)}</section>) : <div className="ledger-empty">这个月还没有记录，可以补记以前的收支。<button onClick={() => onAdd(defaultLedgerDate(month))}>为这个月记一笔</button></div>}</section>
      </div>}
  </div>
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return <article className={`stat ${tone}`}><span>{label}</span><b>{money(value)}</b></article>
}

export function LedgerComposer({ item, initialDate, onClose, onSave }: {
  item?: Transaction; initialDate?: string; onClose: () => void; onSave: (draft: TransactionDraft, id?: string) => void
}) {
  const [amount, setAmount] = useState(item ? String(item.amount) : ''), [category, setCategory] = useState(item?.category ?? '餐饮')
  const [note, setNote] = useState(item?.note ?? ''), [kind, setKind] = useState<Transaction['kind']>(item?.kind ?? 'expense')
  const [date, setDate] = useState(item ? dateKey(new Date(item.createdAt)) : initialDate ?? today())
  const createdAt = transactionDate(date, item), validAmount = Number.isFinite(Number(amount)) && Number(amount) > 0
  return <Modal title={item ? '编辑账目' : '记一笔'} onClose={onClose}><form className="composer ledger-composer" onSubmit={event => { event.preventDefault(); if (createdAt && validAmount) onSave({ amount: Number(amount), category, note, kind, createdAt }, item?.id) }}>
    <header><span>{item ? '编辑账目' : '记一笔'}</span><button type="button" aria-label="关闭" onClick={onClose}><X size={19}/></button></header>
    <div className="kind-toggle"><button type="button" aria-pressed={kind === 'expense'} className={kind === 'expense' ? 'selected' : ''} onClick={() => setKind('expense')}>支出</button><button type="button" aria-pressed={kind === 'income'} className={kind === 'income' ? 'selected income-choice' : ''} onClick={() => setKind('income')}>收入</button></div>
    <label className="amount-input"><span>¥</span><input autoFocus aria-label="金额" inputMode="decimal" value={amount} onChange={event => setAmount(event.target.value.replace(/[^0-9.]/g, ''))} placeholder="0.00"/></label>
    <div className="fields ledger-fields"><label>发生日期<input type="date" required min="0001-01-01" max="9999-12-31" value={date} onChange={event => setDate(event.target.value)}/></label><label>分类<select value={category} onChange={event => setCategory(event.target.value)}>{[...new Set(['餐饮', '交通', '购物', '生活', '娱乐', '学习', '工资', '奖金', '其他', category])].map(value => <option key={value}>{value}</option>)}</select></label><label className="ledger-note-field">备注<input value={note} onChange={event => setNote(event.target.value)} placeholder="例如：午餐"/></label></div>
    <footer><span>支持补记以前的收支</span><button type="submit" className="save" disabled={!createdAt || !validAmount}>保存账目</button></footer>
  </form></Modal>
}
