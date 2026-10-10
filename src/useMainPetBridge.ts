import { useEffect, useRef, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { isDesktop, loadDesktopData } from './desktop'
import { PET_ACTION_EVENT, reminderQualified } from './desktopPetProtocol'
import type { MainPetPublish, PetAction, PetActionResult, PetSnapshot } from './desktopPetProtocol'
import type { AppData } from './types'

let mainPetInitTail: Promise<void> = Promise.resolve()
type Options = {
  summary: Omit<MainPetPublish, 'owner' | 'reminderEligible'>
  blocked: boolean; commitData: (data: AppData) => void; businessReady: (sqliteOK: boolean) => void
  quickNote: () => void; openTodos: () => void; show: () => boolean; hide: () => boolean; report: (message: string) => void
}
export function useMainPetBridge(options: Options) {
  const current = useRef(options); current.current = options
  const accepted = useRef<PetSnapshot | null>(null)
  const ownerRef = useRef<number | null>(null)
  const [owner, setOwner] = useState<number | null>(null), [reminderChange, setReminderChange] = useState(0)
  const publisher = useRef<{ pending: MainPetPublish | null; running: Promise<void> | null; inflight: { owner: number; completion: Promise<PetSnapshot> } | null }>({ pending: null, running: null, inflight: null })
  const publish = async (data: MainPetPublish) => {
    const completion = invoke<PetSnapshot>('pet_publish', { publish: data }).then(result => {
      if (ownerRef.current === result.owner && (!accepted.current || result.revision > accepted.current.revision)) accepted.current = result
      return result
    })
    publisher.current.inflight = { owner: data.owner, completion }
    try { return await completion } finally {
      if (publisher.current.inflight?.completion === completion) publisher.current.inflight = null
    }
  }
  const payload = (id: number): MainPetPublish => {
    const summary = current.current.summary
    return { ...summary, owner: id, reminderEligible: summary.shown && summary.dueCount > 0 && !localStorage.getItem(`luma-todo-reminded:${summary.localDay}`) }
  }
  const queuePublish = (next: MainPetPublish): Promise<void> => {
    const queue = publisher.current
    queue.pending = next
    if (queue.running) return queue.running
    queue.running = (async () => {
      try {
        while (queue.pending && ownerRef.current === next.owner) {
          const value = queue.pending; queue.pending = null; await publish(value)
        }
      } catch (error) {
        queue.pending = null
        if (ownerRef.current === next.owner) {
          ownerRef.current = null; setOwner(null)
          await invoke('pet_end_owner', { owner: next.owner }).catch(() => {})
          current.current.report('桌面伙伴暂不可用')
        }
        throw error
      } finally { queue.running = null }
    })()
    return queue.running
  }
  useEffect(() => {
    if (!isDesktop()) return
    let cancelled = false, id: number | undefined, off: (() => void) | undefined
    let actionTail: Promise<void> = Promise.resolve()
    let recent: { requestId: string; result?: PetActionResult } | undefined
    const handle = async (action: PetAction) => {
      if (cancelled || action.owner !== id || ownerRef.current !== id) return
      const result: PetActionResult = { owner: action.owner, requestId: action.requestId, status: 'handled' }
      const send = (value: PetActionResult) => invoke<void>('pet_action_result', { result: value }).catch(() => {})
      if (action.intent !== 'reminder-shown') {
        if (recent?.requestId === action.requestId) { if (recent.result) await send(recent.result); return }
        recent = { requestId: action.requestId }
      }
      try {
        const now = current.current, summary = now.summary
        if (action.intent === 'reminder-shown') {
          // The pet can confirm the emitted snapshot before this main invoke returns.
          // Wait once for that owner's current publication, then re-read all qualification.
          const inflight = publisher.current.inflight
          if (inflight?.owner === action.owner) await inflight.completion
          if (cancelled || ownerRef.current !== action.owner) throw new Error('伙伴所有者已过期')
          const latest = current.current.summary
          if (!reminderQualified(accepted.current, action, latest.localDay, latest.shown, latest.dueCount)) throw new Error('提醒已过期')
          const key = `luma-todo-reminded:${latest.localDay}`
          if (!localStorage.getItem(key)) localStorage.setItem(key, '1')
          setReminderChange(value => value + 1)
        } else if (action.intent === 'show') {
          await invoke('pet_recall')
          if (cancelled || ownerRef.current !== action.owner) return
          const latest = current.current
          if (!latest.show()) throw new Error('伙伴偏好保存失败')
          current.current = { ...latest, summary: { ...latest.summary, shown: true } }
          await queuePublish({ ...payload(action.owner), shown: true })
        } else if (now.blocked) { result.status = 'blocked'; result.reason = '请先处理当前界面' }
        else if (action.intent === 'quick-note') now.quickNote()
        else if (action.intent === 'open-todos') now.openTodos()
        else if (action.intent === 'hide') {
          if (!now.hide()) throw new Error('伙伴偏好保存失败')
          current.current = { ...now, summary: { ...summary, shown: false } }
          // The main window remains the only preference owner. Confirm actual native hide.
          await queuePublish({ ...payload(action.owner), shown: false, reminderEligible: false })
        }
      } catch (error) { result.status = 'unavailable'; result.reason = error instanceof Error ? error.message : '桌面伙伴暂不可用'; current.current.report(result.reason) }
      if (cancelled || ownerRef.current !== action.owner) return
      if (action.intent !== 'reminder-shown' && recent?.requestId === action.requestId) recent.result = result
      await send(result)
    }
    const init = async () => {
      let listenerOK = false, sqliteOK = false
      try {
        id = (await invoke<PetSnapshot>('pet_begin_owner')).owner
        if (cancelled) return
        off = await getCurrentWindow().listen<PetAction>(PET_ACTION_EVENT, event => {
          if (event.payload.intent === 'reminder-shown') { void handle(event.payload); return }
          actionTail = actionTail.catch(() => {}).then(() => handle(event.payload))
        })
        if (cancelled) { off(); off = undefined; return }
        listenerOK = true
      } catch { if (!cancelled) current.current.report('桌面伙伴暂不可用') }
      if (cancelled) return
      try {
        const data = await loadDesktopData()
        if (cancelled) return
        current.current.commitData(data); sqliteOK = true; current.current.businessReady(true)
      } catch { if (!cancelled) { current.current.businessReady(false); current.current.report('本地数据库暂不可用，已使用浏览器存储') } }
      if (!cancelled && id !== undefined && listenerOK && sqliteOK) { ownerRef.current = id; setOwner(id) }
    }
    mainPetInitTail = mainPetInitTail.catch(() => {}).then(init).finally(async () => {
      if (cancelled) { off?.(); off = undefined; if (id !== undefined) await invoke('pet_end_owner', { owner: id }).catch(() => {}) }
    })
    return () => {
      cancelled = true; off?.(); off = undefined; publisher.current.pending = null
      if (ownerRef.current === id) ownerRef.current = null
      if (id !== undefined) void invoke('pet_end_owner', { owner: id }).catch(() => {})
    }
  }, [])
  const summaryKey = JSON.stringify(options.summary)
  useEffect(() => {
    if (owner === null || ownerRef.current !== owner) return
    void queuePublish(payload(owner)).catch(() => {})
  }, [owner, summaryKey, reminderChange])
  return { protocolReady: owner !== null }
}
