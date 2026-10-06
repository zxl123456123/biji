import { buildNoteGraph } from './noteGraphModel'
import type { GraphInput } from './noteGraphModel'

self.onmessage = (event: MessageEvent<{ version: number; input: GraphInput[] }>) => {
  const { version, input } = event.data
  try {
    self.postMessage({ version, model: buildNoteGraph(input) })
  } catch {
    self.postMessage({ version, error: '本地正文分析失败' })
  }
}
