export type SearchPart = { text: string; match: boolean }
const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })

export function searchPreview(text: string, query: string): SearchPart[] {
  if (!text) return []
  const needle = query.trim().toLowerCase(), hit = needle ? text.toLowerCase().indexOf(needle) : -1
  const segments = segmenter.segment(text), parts: SearchPart[] = []
  // Native prefix lengths map lowercase expansion without walking every grapheme.
  const originalAt = (position: number, end: boolean) => {
    let low = 0, high = text.length
    while (low < high) {
      const middle = Math.floor((low + high) / 2)
      if (text.slice(0, middle).toLowerCase().length < position) low = middle + 1
      else high = middle
    }
    return !end && text.slice(0, low).toLowerCase().length > position ? low - 1 : low
  }
  const first = hit < 0 ? null : segments.containing(originalAt(hit, false))!
  const last = hit < 0 ? null : segments.containing(originalAt(hit + needle.length, true) - 1)!
  let start = first?.index ?? 0
  for (let i = 0; first && i < 16 && start > 0; i++) start = segments.containing(start - 1)!.index
  let end = start
  for (let i = 0; i < 120 && end < text.length; i++) {
    const part = segments.containing(end)!
    end = part.index + part.segment.length
  }
  const matchEnd = last ? last.index + last.segment.length : 0
  end = Math.max(end, matchEnd)
  const add = (value: string, match = false) => { if (value) parts.push({ text: value, match }) }
  if (start) add('…')
  if (first) {
    add(text.slice(start, first.index))
    add(text.slice(first.index, matchEnd), true)
    add(text.slice(matchEnd, end))
  } else add(text.slice(start, end))
  if (end < text.length) add('…')
  return parts
}
