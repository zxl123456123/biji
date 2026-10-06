import { useEffect, useMemo, useRef, useState } from 'react'
import { buildNoteGraph, semanticKey, semanticSnapshot } from './noteGraphModel.ts'
import type { GraphInput, GraphModel } from './noteGraphModel.ts'

export type GraphState = { status: 'idle' | 'updating' | 'ready' | 'error'; model: GraphModel | null; key: string | null }
type Reply = { version: number; model?: GraphModel; error?: string }
type Transport = {
  postMessage: (request: { version: number; input: GraphInput[] }) => void
  terminate: () => void
  onmessage: ((event: MessageEvent<Reply>) => unknown) | null
  onerror: ((event: ErrorEvent) => unknown) | null
  onmessageerror: ((event: MessageEvent) => unknown) | null
}
type RequestOptions = {
  workerFactory: () => Transport
  onState: (state: GraphState) => void
  setTimer?: (callback: () => void) => ReturnType<typeof setTimeout>
  clearTimer?: (timer: ReturnType<typeof setTimeout>) => void
}

// A dedicated request boundary shared by the hook and its contract tests.
export function createGraphRequests(options: RequestOptions) {
  let version = 0, epoch = 0, worker: Transport | null = null, busy = false, cancelled = false
  let pending: { version: number; input: GraphInput[]; key: string } | null = null
  let current: GraphInput[] = [], key: string | null = null
  let timer: ReturnType<typeof setTimeout> | null = null
  const clearTimer = () => {
    if (timer !== null) (options.clearTimer ?? clearTimeout)(timer)
    timer = null
  }
  const terminate = () => {
    clearTimer()
    if (worker) {
      worker.onmessage = null
      worker.onerror = null
      worker.onmessageerror = null
      worker.terminate()
    }
    worker = null
    busy = false
  }
  const fail = () => {
    if (cancelled) return
    terminate()
    pending = null
    options.onState({ status: 'error', model: null, key })
  }
  function dispatchLatest() {
    if (cancelled || busy || !pending) return
    const request = pending
    pending = null
    busy = true
    const large = request.input.length >= 24 || request.input.reduce((sum, note) => sum + note.content.length, 0) >= 8_000
    if (!large) {
      try {
        const model = buildNoteGraph(request.input)
        busy = false
        if (request.version === version && !cancelled) options.onState({ status: 'ready', model, key: request.key })
      } catch { fail() }
      return
    }
    try {
      if (!worker) {
        worker = options.workerFactory()
        const ownWorker = worker
        worker.onmessage = event => {
          if (cancelled || worker !== ownWorker) return
          clearTimer()
          busy = false
          if (event.data.error) { fail(); return }
          if (event.data.version === version) {
            if (!event.data.model) { fail(); return }
            options.onState({ status: 'ready', model: event.data.model, key })
          }
          dispatchLatest()
        }
        worker.onerror = () => { if (worker === ownWorker) fail() }
        worker.onmessageerror = () => { if (worker === ownWorker) fail() }
      }
      const requestEpoch = epoch
      timer = (options.setTimer ?? (callback => setTimeout(callback, 10_000)))(() => {
        if (requestEpoch === epoch) fail()
      })
      worker.postMessage({ version: request.version, input: request.input })
    } catch { fail() }
  }
  const submit = (input: GraphInput[]) => {
    cancelled = false
    current = input
    key = semanticKey(input)
    version++
    pending = { version, input, key }
    options.onState({ status: 'updating', model: null, key })
    dispatchLatest()
  }
  return {
    submit,
    retry: () => submit(current),
    cancel: () => {
      cancelled = true
      epoch++
      version++
      terminate()
      pending = null
    },
  }
}

export function useNoteGraph(notes: readonly (GraphInput & { deletedAt?: string })[], enabled: boolean) {
  const input = semanticSnapshot(notes), key = semanticKey(input)
  const [state, setState] = useState<GraphState>({ status: 'idle', model: null, key: null })
  const latest = useRef(input)
  latest.current = input
  const requests = useMemo(() => createGraphRequests({
    workerFactory: () => new Worker(new URL('./noteGraph.worker.ts', import.meta.url), { type: 'module' }),
    onState: setState,
  }), [])
  useEffect(() => {
    return () => requests.cancel()
  }, [enabled, requests])
  useEffect(() => {
    if (enabled) requests.submit(latest.current)
  }, [enabled, key, requests])
  // A semantic edit cannot expose yesterday's relationships for one render.
  const currentState = state.key === key ? state : { status: enabled ? 'updating' as const : 'idle' as const, model: null, key }
  return { ...currentState, retry: requests.retry }
}
