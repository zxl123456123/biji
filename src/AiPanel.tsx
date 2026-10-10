import { useEffect, useState } from 'react'
import { ArrowDownToLine, Sparkles, X } from 'lucide-react'
import { askAi, isDesktop, prepareAi } from './desktop'
import type { Note, Transaction } from './types'

export function AiPanel({ notes, transactions, onClose, onToast }: { notes: Note[]; transactions: Transaction[]; onClose(): void; onToast(message: string): void }) {
  const [prompt, setPrompt] = useState(''), [answer, setAnswer] = useState(''), [busy, setBusy] = useState(false), [configured, setConfigured] = useState<boolean | null>(null)
  useEffect(() => { prepareAi().then(setConfigured).catch(() => setConfigured(false)) }, [])
  const context = () => JSON.stringify({ notes: notes.slice(0, 50).map(n => ({ content: n.content, date: n.scheduledDate, done: n.done })), transactions: transactions.slice(0, 80).map(t => ({ amount: t.amount, category: t.category, kind: t.kind, note: t.note, date: t.createdAt })) })
  async function ask(value = prompt) { if (!value.trim()) return; if (!isDesktop()) { setAnswer('AI 功能需要在原生桌面版中运行，这样 API 密钥才不会暴露在浏览器。请运行 npm run desktop。'); return } if (!configured) { onToast('未能从本机配置导入 DeepSeek 密钥'); return } setBusy(true); setAnswer(''); try { const reply = await askAi(value, context()); setAnswer(reply.content) } catch { setAnswer('这次请求没有完成。请检查网络和 DeepSeek 账户余额后重试。') } finally { setBusy(false) } }
  return <div className="ai-drawer"><header><div><span className="ai-orb"><Sparkles size={16} /></span><div><b>晴笺 AI</b><p>{configured === null ? '检测本机 AI 配置…' : configured ? 'DeepSeek V4.1-Flash 已就绪' : '桌面端 AI 未配置'}</p></div></div><button aria-label="关闭" onClick={onClose}><X size={19} /></button></header><div className="ai-content">{answer ? <div className="ai-answer">{answer}</div> : <div className="ai-intro"><span>✦</span><h2>想从哪里开始？</h2><p>我可以只基于你的本地记录，帮你整理与回顾。</p><button onClick={() => ask('请总结我近期的记录，并给出 3 条简短的行动建议。')}>总结记录</button><button onClick={() => ask('请从我的笔记中提取待办，并按日期与标签整理。')}>整理待办</button><button onClick={() => ask('请分析本月账目，指出最主要的支出方向和一个可实行的小建议。')}>分析账本</button></div>}</div><footer><textarea aria-label="向晴笺 AI 提问" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="问问你的笔记与账本…"/><button aria-label="发送提问" disabled={busy || !prompt.trim()} onClick={() => ask()}>{busy ? '思考中…' : <ArrowDownToLine size={18} />}</button></footer></div>
}
