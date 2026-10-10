import { useEffect, useRef } from 'react'
import type { PetAppearance } from './petAppearance'
import type { PetMood } from './petBehavior'
import type { PetActivity, PetDecoration } from './Pet3DScene'
import { Pet3DView } from './Pet3DView'
import { PetPortrait } from './PetPortrait'
import { resolvePetModel } from './petModels'

export function PetFigure({ appearance, mood, animate, activity, previewUrl, onError, onLoaded }: {
  appearance: PetAppearance; mood: PetMood; animate: boolean; activity?: PetActivity; previewUrl?: string
  onError?(message: string): void; onLoaded?(decorations: readonly PetDecoration[]): void
}) {
  const resolved = resolvePetModel(appearance.character)
  const modelUrl = import.meta.env.DEV && previewUrl ? previewUrl : resolved?.url
  const loaded = useRef(onLoaded); loaded.current = onLoaded
  useEffect(() => { if (!modelUrl) loaded.current?.(['Beret', 'Halo', 'Scarf', 'Bow']) }, [modelUrl, appearance.character])
  const fallback = <PetPortrait appearance={appearance} mood={mood} animate={animate}/>
  return modelUrl ? <Pet3DView key={`${modelUrl}:${appearance.character}`} appearance={appearance} mood={mood}
    animate={animate} activity={activity} modelUrl={modelUrl} original={appearance.character === 'xiaotuan'}
    fallback={fallback} onError={onError} onLoaded={onLoaded}/> : fallback
}
