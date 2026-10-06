import { withoutTags } from './recordTools.ts'

import { notePlain, parseNote } from './noteCodec.ts'

export function plainNoteText(content: string): string {
  return notePlain(parseNote(withoutTags(content)))
}

export const normaliseBody = (content: string) => plainNoteText(content).normalize('NFKC').toLowerCase().replace(/\s+/gu, ' ').trim()
