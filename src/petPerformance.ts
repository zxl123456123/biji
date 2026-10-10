import type { PetGeometry, Point } from './desktopPetProtocol'

export type PetFacing = 'left' | 'right'
export type PetClipName = 'idle' | 'happy' | 'rest' | 'walk' | 'look'
export const PET_CROSSFADE_SECONDS = 0.28
const MIN_WALK_DISTANCE = 24

export function clipForMood(mood: 'idle' | 'happy' | 'resting' | 'dragging', activity?: 'walk' | 'look'): PetClipName {
  if (mood === 'resting') return 'rest'
  if (mood === 'happy') return 'happy'
  return activity ?? 'idle'
}

export function resolveClip(preferred: PetClipName, available: readonly string[]): PetClipName {
  if (available.includes(preferred)) return preferred
  if (preferred !== 'idle' && available.includes('idle')) return 'idle'
  throw new Error('模型缺少 idle 动作')
}

export function clipLoops(name: PetClipName): boolean {
  return name !== 'rest'
}

export type PetWalk = { target: Point; facing: PetFacing; steps: number }

export function planPetWalk(geometry: PetGeometry, distance: number, clamp: (point: Point, geometry: PetGeometry) => Point): PetWalk | null {
  const target = clamp({ x: geometry.position.x + distance, y: geometry.position.y }, geometry)
  if (Math.hypot(target.x - geometry.position.x, target.y - geometry.position.y) < MIN_WALK_DISTANCE) return null
  return { target, facing: distance < 0 ? 'left' : 'right', steps: 15 }
}

export function petStepPoint(origin: Point, target: Point, index: number, steps: number): Point {
  return { x: origin.x + (target.x - origin.x) * index / steps, y: origin.y + (target.y - origin.y) * index / steps }
}
