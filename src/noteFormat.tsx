import type { Inline } from './noteCodec'
import { colors, escapeLiteral, fenceLiteral, headingLiteral, inlineLiteral, noteHtml, parseNote, PET_DIRECTIVE, quoteLiteral, sizes } from './noteCodec'
import { tagsFor, withoutTags } from './recordTools'

function renderInline(nodes: Inline[]): React.ReactNode[] {
  return nodes.map((node, key) => {
    if (node.kind === 'text') return node.value
    if (node.kind === 'code') return <code key={key}>{node.value}</code>
    const body = renderInline(node.children)
    if (node.kind === 'bold') return <strong key={key}>{body}</strong>
    if (node.kind === 'italic') return <em key={key}>{body}</em>
    return <span key={key} className={`text-${node.kind} ${node.value}`}>{body}</span>
  })
}
export function renderMarkdown(value: string) {
  return parseNote(value).map((block, key) => {
    if (block.kind === 'pet') return <p key={key}>晴小团</p>
    if (block.kind === 'blank') return null
    if (block.kind === 'code') return <pre key={key}><code>{block.value}</code></pre>
    if (block.kind === 'list') {
      const items = block.items.map((item, index) => <li key={index}>{renderInline(item)}</li>)
      return block.ordered ? <ol key={key} start={block.start}>{items}</ol> : <ul key={key}>{items}</ul>
    }
    if (block.kind === 'quote') return <blockquote key={key}>{block.lines.map((line, index) => <p key={index}>{renderInline(line)}</p>)}</blockquote>
    const body = renderInline(block.children)
    if (block.kind === 'heading') return block.level === 2 ? <h2 key={key}>{body}</h2> : <h3 key={key}>{body}</h3>
    return <p key={key}>{body}</p>
  })
}
export const markdownToEditorHtml = (value: string) => noteHtml(parseNote(value))

const escapeBlockStart = (body: string) => body.replace(/^(?=#{1,2} |(?:- |[1-9]\d*\. )|> )/gm, '\\')
export function editorHtmlToMarkdown(root: HTMLElement): string {
  let petSerialized = false
  const isPet = (node: HTMLElement) => node.parentElement === root && node.tagName === 'DIV' && node.getAttribute('data-note-pet') === 'xiaotuan' && node.getAttribute('contenteditable') === 'false'
  const joinChildren = (nodes: Node[], visit: (node: Node) => string): string => {
    let result = ''
    for (const node of nodes) {
      const body = visit(node)
      if (body && node instanceof HTMLElement && /^(DIV|P|H2|H3|UL|OL|LI|PRE|BLOCKQUOTE)$/.test(node.tagName) && result && !result.endsWith('\n')) result += '\n'
      result += body
    }
    return result
  }
  const inline = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return escapeLiteral(node.textContent ?? '')
    if (!(node instanceof HTMLElement)) return ''
    const tag = node.tagName.toLowerCase()
    if (tag === 'br') return '\n'
    if (tag === 'code') return inlineLiteral(node.textContent ?? '')
    if (tag === 'pre') return fenceLiteral(node.textContent ?? '', node.querySelector('code')?.dataset.language ?? '')
    let body = joinChildren(Array.from(node.childNodes), inline)
    if (!body) return ''
    if (tag === 'strong' || tag === 'b' || Number(node.style.fontWeight) >= 600 || node.style.fontWeight === 'bold') body = `**${body}**`
    if (tag === 'em' || tag === 'i' || node.style.fontStyle === 'italic') body = `_${body}_`
    if (node.dataset.color && colors.includes(node.dataset.color)) body = `[[color:${node.dataset.color}|${body}]]`
    if (node.dataset.size && sizes.includes(node.dataset.size)) body = `[[size:${node.dataset.size}|${body}]]`
    else if (tag === 'font' && node.hasAttribute('size')) body = `[[size:lg|${body}]]`
    if (tag === 'div' || tag === 'p') return `${body}\n`
    return body
  }
  const list = (element: HTMLElement): string => {
    const ordered = element.tagName.toLowerCase() === 'ol'
    let number = Math.max(1, Number(element.getAttribute('start')) || 1)
    const output: string[] = []
    for (const child of Array.from(element.children)) {
      if (!(child instanceof HTMLElement)) continue
      if (child.tagName.toLowerCase() !== 'li') { output.push(block(child)); continue }
      const parts = Array.from(child.childNodes)
      const direct = parts.filter(node => !(node instanceof HTMLElement && /^(UL|OL)$/.test(node.tagName)))
      const body = joinChildren(direct, inline).trimEnd()
      const visible = direct.map(node => node.textContent ?? '').join('')
      if (visible.trim()) output.push(`${ordered ? `${number++}.` : '-'} ${body.replace(/\n/g, ' ')}\n`)
      for (const node of parts) if (node instanceof HTMLElement && /^(UL|OL)$/.test(node.tagName)) output.push(list(node))
    }
    return output.join('')
  }
  const block = (node: Node): string => {
    if (!(node instanceof HTMLElement)) return inline(node)
    if (isPet(node)) {
      if (!petSerialized) { petSerialized = true; return `${PET_DIRECTIVE}\n` }
      return `${escapeLiteral(PET_DIRECTIVE)}\n`
    }
    const tag = node.tagName.toLowerCase()
    if (tag === 'pre') return `${fenceLiteral(node.textContent ?? '', node.querySelector('code')?.dataset.language ?? '')}\n`
    if (tag === 'ul' || tag === 'ol') return list(node)
    if (tag === 'blockquote') {
      const body = joinChildren(Array.from(node.childNodes), inline).replace(/\n$/, '')
      const quoted = quoteLiteral(body, node.textContent ?? '', withoutTags, tagsFor)
      return quoted ? quoted + '\n' : ''
    }
    if (tag === 'h2' || tag === 'h3') {
      const heading = headingLiteral(Array.from(node.childNodes).map(inline).join(''), tag === 'h2' ? 2 : 3, withoutTags, tagsFor)
      return heading ? heading + '\n' : ''
    }
    if (node.querySelector('ul,ol,pre,blockquote,h2,h3')) return joinChildren(Array.from(node.childNodes), block)
    if (tag === 'div' || tag === 'p' || tag === 'li') {
      const body = joinChildren(Array.from(node.childNodes), inline).replace(/\n$/, '')
      return `${node.classList.contains('visual-list') ? '- ' + body.replace(/^•\s*/, '') : escapeBlockStart(body)}\n`
    }
    return inline(node)
  }
  return joinChildren(Array.from(root.childNodes), block).trimEnd()
}
