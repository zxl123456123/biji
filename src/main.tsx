import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { getCurrentWindow } from '@tauri-apps/api/window'

type BootstrapResult = { status: 'ready' | 'failed'; code?: string }
type MigrationOutcome = { configured: boolean; outcomeCode: string }
type BootstrapFailure = { code: string }

function showSafeError(root: HTMLElement, code = 'startup_failed') {
  document.body.dataset.bootstrap = 'failed'
  root.textContent = `晴笺启动未完成（${code}）。请关闭窗口后重试。`
}

async function startWeb(root: HTMLElement) {
  const [{ StrictMode, createElement }, { createRoot }, { default: App }, { registerSW }] = await Promise.all([
    import('react'), import('react-dom/client'), import('./App'), import('virtual:pwa-register'), import('./styles.css')
  ])
  registerSW({ immediate: true })
  createRoot(root).render(createElement(StrictMode, null, createElement(App)))
}

async function startNative(root: HTMLElement) {
  const label = getCurrentWindow().label
  document.body.dataset.bootstrap = 'pending'
  let unlisten: (() => void) | undefined
  try {
    unlisten = await listen<BootstrapFailure>('native-bootstrap-failed', event => showSafeError(root, event.payload.code))
    const result = await invoke<BootstrapResult>('bootstrap_entry_ready')
    unlisten()
    if (result.status !== 'ready') { showSafeError(root, result.code); return }

    const [{ StrictMode, createElement }, { createRoot }] = await Promise.all([import('react'), import('react-dom/client')])
    if (label === 'main') {
      let migration: MigrationOutcome
      try { migration = await invoke<MigrationOutcome>('startup_ai_migration') }
      catch { migration = { configured: false, outcomeCode: 'worker_failed' } }
      if (migration.outcomeCode !== 'configured') console.info('AI migration:', migration.outcomeCode)
      const [{ default: App }] = await Promise.all([import('./App'), import('./styles.css')])
      createRoot(root).render(createElement(StrictMode, null, createElement(App)))
    } else if (label === 'pet') {
      const [{ default: DesktopPet }] = await Promise.all([import('./DesktopPet'), import('./desktop-pet.css')])
      createRoot(root).render(createElement(StrictMode, null, createElement(DesktopPet)))
    } else {
      showSafeError(root, 'unexpected_window')
      return
    }
    document.body.dataset.bootstrap = 'ready'
  } catch {
    unlisten?.()
    showSafeError(root)
  }
}

async function start() {
  const root = document.getElementById('root')
  if (!root) return
  if (!('__TAURI_INTERNALS__' in window)) {
    try { await startWeb(root) } catch { showSafeError(root) }
    return
  }
  await startNative(root)
}

void start()
