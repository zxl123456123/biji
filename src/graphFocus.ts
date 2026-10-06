export type LocateRequest = { id: string; token: number; local?: boolean }
export type LocateResult = { token: number; ok: boolean; reason?: 'missing' }
export type LocateOutcome = 'located' | 'waiting' | 'missing'

// The canvas owner stays alive while its request, model and callback change.
export function createGraphLocator(options: {
  latest: () => { request: LocateRequest | null; status: 'idle' | 'updating' | 'ready' | 'error'; finish: (result: LocateResult) => void }
  locate: (id: string) => LocateOutcome
}) {
  let disposed = false, consumed = -1
  return {
    retry: () => {
      if (disposed) return
      const current = options.latest(), request = current.request
      if (!request || request.token === consumed || current.status === 'idle' || current.status === 'updating') return
      const outcome = options.locate(request.id)
      if (outcome === 'waiting') return
      const latest = options.latest()
      if (disposed || latest.request?.token !== request.token || consumed === request.token) return
      consumed = request.token
      latest.finish({ token: request.token, ok: outcome === 'located', ...(outcome === 'missing' ? { reason: 'missing' as const } : {}) })
    },
    dispose: () => { disposed = true },
  }
}
