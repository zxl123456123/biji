export type PetCharacter = 'xiaotuan' | 'nailong' | 'chiikawa' | 'hachiware' | 'usagi'
export type PetAppearance = {
  character: PetCharacter; palette: 'cloud' | 'mint' | 'peach'
  head: 'none' | 'beret' | 'halo'; accessory: 'none' | 'scarf' | 'bow'
}

export const PET_APPEARANCE_KEY = 'luma-pet-appearance'
export const DEFAULT_PET_APPEARANCE: PetAppearance = { character: 'xiaotuan', palette: 'cloud', head: 'none', accessory: 'none' }
export const PET_CHARACTER_NAMES: Record<PetCharacter, string> = {
  xiaotuan: '晴小团', nailong: '奶龙', chiikawa: '吉伊', hachiware: '小八', usagi: '乌萨奇',
}

export function parsePetAppearance(value: unknown): PetAppearance {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ...DEFAULT_PET_APPEARANCE }
  const item = value as Record<string, unknown>, keys = Object.keys(item)
  if (keys.length !== 4 || !keys.every(key => ['character', 'palette', 'head', 'accessory'].includes(key))
    || !['xiaotuan', 'nailong', 'chiikawa', 'hachiware', 'usagi'].includes(item.character as string)
    || !['cloud', 'mint', 'peach'].includes(item.palette as string)
    || !['none', 'beret', 'halo'].includes(item.head as string)
    || !['none', 'scarf', 'bow'].includes(item.accessory as string)) return { ...DEFAULT_PET_APPEARANCE }
  return { character: item.character, palette: item.palette, head: item.head, accessory: item.accessory } as PetAppearance
}

export function readPetAppearance(storage?: Pick<Storage, 'getItem'>): PetAppearance {
  try {
    const value = (storage ?? localStorage).getItem(PET_APPEARANCE_KEY)
    return value === null ? { ...DEFAULT_PET_APPEARANCE } : parsePetAppearance(JSON.parse(value))
  } catch { return { ...DEFAULT_PET_APPEARANCE } }
}

export function writePetAppearance(next: PetAppearance, storage?: Pick<Storage, 'setItem'>): boolean {
  try {
    ;(storage ?? localStorage).setItem(PET_APPEARANCE_KEY, JSON.stringify(parsePetAppearance(next)))
    return true
  } catch { return false }
}
