import { invoke } from '@tauri-apps/api/core'
import type { AppData } from './types'

export const isDesktop = () => '__TAURI_INTERNALS__' in window

export async function loadDesktopData() { return invoke<AppData>('load_data') }
export async function saveDesktopData(data: AppData) { return invoke<void>('save_data', { data }) }
export async function prepareAi() {
  if (!isDesktop()) return false
  const configured = await invoke<boolean>('ai_configured')
  return configured || await invoke<boolean>('import_deepseek_config')
}
export async function askAi(prompt: string, context: string) {
  return invoke<{ content: string; model: string }>('ask_deepseek', { request: { prompt, context } })
}
