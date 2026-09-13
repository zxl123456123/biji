import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: { port: 1420, strictPort: true },
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    manifest: {
      name: '晴笺 · 轻笔记与账本',
      short_name: '晴笺',
      description: '本地优先的轻量笔记与生活账本',
      theme_color: '#f6f5f1',
      background_color: '#f6f5f1',
      display: 'standalone',
      lang: 'zh-CN'
    }
  })]
})
