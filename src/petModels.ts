import type { PetCharacter } from './petAppearance'

const localModels = import.meta.glob('./local-pet-models/*.glb', { eager: true, query: '?url', import: 'default' })

export function resolvePetModel(character: PetCharacter) {
  const url = localModels[`./local-pet-models/${character}.glb`]
    ?? (character === 'xiaotuan' ? `${import.meta.env.BASE_URL}pets/xiaotuan.glb` : undefined)
  return url ? { url: String(url), original: character === 'xiaotuan' } : null
}
