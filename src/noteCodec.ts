export type Inline =
  | { kind: 'text'; value: string }
  | { kind: 'code'; value: string }
  | { kind: 'bold'; children: Inline[] }
  | { kind: 'italic'; children: Inline[] }
  | { kind: 'color'; value: string; children: Inline[] }
  | { kind: 'size'; value: string; children: Inline[] }
export type NoteBlock =
  | { kind: 'pet'; id: 'xiaotuan' }
  | { kind: 'paragraph' | 'heading'; children: Inline[]; level?: 2 | 3 }
  | { kind: 'blank' }
  | { kind: 'list'; ordered: boolean; start: number; items: Inline[][] }
  | { kind: 'quote'; lines: Inline[][] }
  | { kind: 'code'; value: string; language: string; closed: boolean }

export const colors = ['red', 'orange', 'green', 'blue', 'purple']
export const sizes = ['sm', 'lg', 'xl']
export const PET_DIRECTIVE = '[[pet:xiaotuan]]'
export const PET_HOST_HTML = '<div data-note-pet="xiaotuan" contenteditable="false" class="embedded-pet-editor" aria-label="晴小团"><span data-note-pet-mount="true">晴小团</span></div>'
export const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
export const escapeLiteral = (value: string) => value.replace(/[\\*_`\[]/g, '\\$&')
const escaped = (text: string, at: number) => {
  let count = 0
  while (at > 0 && text[--at] === '\\') count++
  return count % 2 === 1
}
const tickRun = (text: string, at: number) => {
  let end = at
  while (text[end] === '`') end++
  return end - at
}
function codeSpan(text: string, at: number) {
  if (text[at] !== '`' || escaped(text, at)) return null
  const length = tickRun(text, at)
  let cursor = at + length
  while (cursor < text.length) {
    if (text[cursor] !== '`') { cursor++; continue }
    const run = tickRun(text, cursor)
    // Backslashes inside code are literal; only the opening run can be escaped.
    if (run === length) {
      const raw = text.slice(at + length, cursor)
      const value = length > 1 && raw.startsWith(' ') && raw.endsWith(' ') && /[^ ]/.test(raw) ? raw.slice(1, -1) : raw
      return { end: cursor + run, value }
    }
    cursor += run
  }
  return null
}
const fenceOpening = (line: string) => line.match(/^ {0,3}(`{3,})([^`]*)$/)
const fenceClosing = (line: string, length: number) => new RegExp(`^ {0,3}\\x60{${length}}[ \\t]*$`).test(line)

export function inlineLiteral(value: string): string {
  if (!value) return ''
  const longest = Math.max(0, ...(value.match(/`+/g) ?? []).map(run => run.length))
  const bothSpaces = value.startsWith(' ') && value.endsWith(' ') && /[^ ]/.test(value)
  const pad = value.startsWith('`') || value.endsWith('`') || bothSpaces
  const delimiter = '`'.repeat(Math.max(longest + 1, pad ? 2 : 1))
  return delimiter + (pad ? ' ' : '') + value + (pad ? ' ' : '') + delimiter
}
export function fenceLiteral(value: string, language = ''): string {
  const longest = Math.max(2, ...(value.match(/`+/g) ?? []).map(run => run.length))
  const delimiter = '`'.repeat(longest + 1)
  return `${delimiter}${language.replace(/`/g, '')}\n${value}\n${delimiter}`
}

function hasInlineBody(body: string, normalise: (text: string) => string): boolean {
  // Qualification uses the existing tag rule; code and escaped authored symbols stay visible.
  const normalized = splitProtectedCode(normalise(body)).map(part => part.code ? part.text : part.text.replace(/[*_]/g, (marker, at: number) => escaped(part.text, at) ? marker : '')).join('')
  return !!inlinePlain(parseInline(normalized, true)).trim()
}
export function headingLiteral(body: string, level: 2 | 3, normalise: (text: string) => string, extractTags: (text: string) => string[]): string {
  if (hasInlineBody(body, normalise)) return `${level === 2 ? '#' : '##'} ${body.trimEnd()}`
  return extractTags(body).map(tag => `#${tag}`).join(' ')
}

export function quoteLiteral(body: string, visibleText: string, normalise: (text: string) => string, extractTags: (text: string) => string[]): string {
  if (!visibleText.trim()) return ''
  let fenceLength = 0
  return body.split('\n').map(line => {
    // Existing fenced code stays a literal block when a complex quote is flattened.
    if (fenceLength) {
      if (fenceClosing(line, fenceLength)) fenceLength = 0
      return line
    }
    const opening = fenceOpening(line)
    if (opening) { fenceLength = opening[1].length; return line }
    if (hasInlineBody(line, normalise)) return `> ${line}`
    // Empty formatting must not leak, but exact tag names/order still belong to storage.
    return extractTags(line).map(tag => `#${tag}`).join(' ')
  }).join('\n')
}

// These exact source spans also protect code from the existing hashtag helpers.
export function splitProtectedCode(content: string): { text: string; code: boolean }[] {
  const fences: [number, number][] = []
  const lines = content.split('\n')
  let offset = 0
  for (let i = 0; i < lines.length; i++) {
    const opening = fenceOpening(lines[i])
    if (!opening) { offset += lines[i].length + 1; continue }
    const start = offset
    offset += lines[i].length + 1
    let closed = false
    while (++i < lines.length) {
      offset += lines[i].length + (i < lines.length - 1 ? 1 : 0)
      if (fenceClosing(lines[i], opening[1].length)) { closed = true; break }
    }
    fences.push([start, closed ? Math.min(offset - (i < lines.length - 1 ? 1 : 0), content.length) : content.length])
  }
  const spans: [number, number][] = []
  const scanInline = (start: number, end: number) => {
    for (let at = start; at < end;) {
      if (content[at] !== '`') { at++; continue }
      const found = codeSpan(content.slice(0, end), at)
      if (found) { spans.push([at, found.end]); at = found.end }
      else at += tickRun(content, at)
    }
  }
  let cursor = 0
  for (const [start, end] of fences) { scanInline(cursor, start); spans.push([start, end]); cursor = end }
  scanInline(cursor, content.length)
  const parts: { text: string; code: boolean }[] = []
  cursor = 0
  for (const [start, end] of spans) {
    if (start > cursor) parts.push({ text: content.slice(cursor, start), code: false })
    parts.push({ text: content.slice(start, end), code: true }); cursor = end
  }
  if (cursor < content.length || !parts.length) parts.push({ text: content.slice(cursor), code: false })
  return parts
}

function closingMarker(text: string, marker: string, start: number): number {
  let nested = 0
  for (let at = start; at < text.length;) {
    if (text[at] === '`') {
      const span = codeSpan(text, at)
      if (span) { at = span.end; continue }
      at += tickRun(text, at); continue
    }
    if (marker === ']]' && !escaped(text, at) && text.startsWith('[[', at)) { nested++; at += 2; continue }
    if (!escaped(text, at) && text.startsWith(marker, at)) {
      if (nested) { nested--; at += marker.length; continue }
      return at
    }
    at++
  }
  return -1
}
// Empty wrappers are consumed only for serialization qualification after ordinary-tag removal.
export function parseInline(text: string, emptyStyles = false): Inline[] {
  const result: Inline[] = []
  let literal = ''
  const flush = () => { if (literal) { result.push({ kind: 'text', value: literal }); literal = '' } }
  for (let at = 0; at < text.length;) {
    if (text[at] === '\\' && /[\\*_`\[#>\-\d]/.test(text[at + 1] ?? '')) { literal += text[at + 1]; at += 2; continue }
    if (text.startsWith('<kbd>', at) || text.startsWith('</kbd>', at)) { at += text[at + 1] === '/' ? 6 : 5; continue }
    if (text[at] === '`') {
      const span = codeSpan(text, at)
      if (span) { flush(); result.push({ kind: 'code', value: span.value }); at = span.end; continue }
      const run = tickRun(text, at); literal += text.slice(at, at + run); at += run; continue
    }
    const style = text.slice(at).match(/^\[\[(color|size):([a-z]+)\|/)
    const marker = text.startsWith('**', at) ? '**' : text[at] === '_' ? '_' : style ? ']]' : ''
    const allowedStyle = style && (style[1] === 'color' ? colors : sizes).includes(style[2])
    if (style && !allowedStyle) {
      const end = closingMarker(text, ']]', at + style[0].length)
      if (end >= 0) { literal += text.slice(at, end + 2); at = end + 2; continue }
    }
    if (marker && (!style || allowedStyle)) {
      const start = at + (style ? style[0].length : marker.length)
      const end = closingMarker(text, marker, start)
      if (end > start || (emptyStyles && end === start)) {
        flush()
        const children = parseInline(text.slice(start, end), emptyStyles)
        result.push(style ? { kind: style[1] as 'color' | 'size', value: style[2], children } : { kind: marker === '**' ? 'bold' : 'italic', children })
        at = end + marker.length; continue
      }
    }
    literal += text[at++]
  }
  flush()
  return result
}
export const inlinePlain = (nodes: Inline[]): string => nodes.map(node => 'children' in node ? inlinePlain(node.children) : node.value).join('')
export function inlineHtml(nodes: Inline[]): string {
  return nodes.map(node => {
    if (node.kind === 'text') return escapeHtml(node.value)
    if (node.kind === 'code') return `<code>${escapeHtml(node.value)}</code>`
    const body = inlineHtml(node.children)
    if (node.kind === 'bold') return `<strong>${body}</strong>`
    if (node.kind === 'italic') return `<em>${body}</em>`
    return `<span data-${node.kind}="${node.value}" class="text-${node.kind} ${node.value}">${body}</span>`
  }).join('')
}

export function parseNote(value: string): NoteBlock[] {
  if (!value) return []
  const lines = value.split('\n'), blocks: NoteBlock[] = []
  let petSeen = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i], opening = fenceOpening(line)
    if (opening) {
      const body: string[] = []
      let closed = false
      while (++i < lines.length) {
        if (fenceClosing(lines[i], opening[1].length)) { closed = true; break }
        body.push(lines[i])
      }
      blocks.push({ kind: 'code', value: body.join('\n'), language: opening[2].trim(), closed }); continue
    }
    if (line === PET_DIRECTIVE && !petSeen) { blocks.push({ kind: 'pet', id: 'xiaotuan' }); petSeen = true; continue }
    const list = line.match(/^(- |([1-9]\d*)\. )(.*)$/)
    if (list) {
      const ordered = !!list[2], items: Inline[][] = [], start = Number(list[2] ?? 1)
      do {
        const item = lines[i].match(/^(- |([1-9]\d*)\. )(.*)$/)!
        const children = parseInline(item[3])
        if (inlinePlain(children).trim()) items.push(children)
        const next = lines[i + 1]?.match(/^(- |([1-9]\d*)\. )(.*)$/)
        if (!next || !!next[2] !== ordered) break
        i++
      } while (i < lines.length)
      if (items.length) blocks.push({ kind: 'list', ordered, start, items })
      continue
    }
    if (line.startsWith('> ')) {
      const quote: Inline[][] = [parseInline(line.slice(2))]
      while (lines[i + 1]?.startsWith('> ')) quote.push(parseInline(lines[++i].slice(2)))
      blocks.push({ kind: 'quote', lines: quote }); continue
    }
    if (!line.trim()) { blocks.push({ kind: 'blank' }); continue }
    const heading = line.match(/^(#{1,2}) (.*)$/)
    blocks.push(heading ? { kind: 'heading', level: heading[1].length === 1 ? 2 : 3, children: parseInline(heading[2]) } : { kind: 'paragraph', children: parseInline(line) })
  }
  return blocks
}
export function noteHtml(blocks: NoteBlock[]): string {
  return blocks.map(block => {
    if (block.kind === 'pet') return PET_HOST_HTML
    if (block.kind === 'blank') return '<div><br></div>'
    if (block.kind === 'code') return `<pre><code${block.language ? ` data-language="${escapeHtml(block.language)}"` : ''}>${escapeHtml(block.value)}</code></pre>`
    if (block.kind === 'list') {
      const tag = block.ordered ? 'ol' : 'ul'
      return `<${tag}${block.ordered ? ` start="${block.start}"` : ''}>${block.items.map(item => `<li>${inlineHtml(item)}</li>`).join('')}</${tag}>`
    }
    if (block.kind === 'quote') return `<blockquote>${block.lines.map(line => `<div>${inlineHtml(line) || '<br>'}</div>`).join('')}</blockquote>`
    const tag = block.kind === 'heading' ? `h${block.level}` : 'div'
    return `<${tag}>${inlineHtml(block.children)}</${tag}>`
  }).join('')
}
export function notePlain(blocks: NoteBlock[]): string {
  return blocks.map(block => {
    if (block.kind === 'pet') return '晴小团'
    if (block.kind === 'blank') return ''
    if (block.kind === 'code') return `\n${block.value}${block.closed ? '\n' : ''}`
    if (block.kind === 'list') return block.items.map(inlinePlain).join('\n')
    if (block.kind === 'quote') return block.lines.map(inlinePlain).join('\n')
    return inlinePlain(block.children)
  }).join('\n')
}
