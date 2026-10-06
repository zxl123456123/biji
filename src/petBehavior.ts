export const PET_VISIBLE_KEY = 'luma-pet-visible'
export type PetMood = 'idle' | 'happy' | 'resting' | 'dragging'
export type PetState = { mood: PetMood; resting: boolean }
export type PetEvent = 'tap' | 'rest' | 'wake' | 'drag-start' | 'drag-end' | 'cancel' | 'settle'
export type PetPoint = { x: number; y: number }
export type PetViewport = { width: number; height: number; left?: number; top?: number }
export type PetGesture = { pointerId: number; start: PetPoint; current: PetPoint; origin: PetPoint; dragged: boolean }

export function reducePetMood(state: PetState, event: PetEvent): PetState {
  switch (event) {
    case 'rest': return { mood: 'resting', resting: true }
    case 'wake': return { mood: 'idle', resting: false }
    case 'tap': return { mood: 'happy', resting: false }
    case 'drag-start': return { ...state, mood: 'dragging' }
    case 'drag-end':
    case 'cancel': return { mood: state.resting ? 'resting' : 'idle', resting: state.resting }
    case 'settle': return state.mood === 'happy' ? { mood: 'idle', resting: false } : state
  }
}

export function clampPetPosition(position: PetPoint, size: { width: number; height: number }, viewport: PetViewport): PetPoint {
  const left = (viewport.left ?? 0) + 8, top = (viewport.top ?? 0) + 8
  return {
    x: Math.min(Math.max(left, position.x), Math.max(left, (viewport.left ?? 0) + viewport.width - size.width - 8)),
    y: Math.min(Math.max(top, position.y), Math.max(top, (viewport.top ?? 0) + viewport.height - size.height - 8)),
  }
}

export function movePetGesture(gesture: PetGesture, pointerId: number, point: PetPoint): PetGesture {
  if (pointerId !== gesture.pointerId) return gesture
  return { ...gesture, current: point, dragged: gesture.dragged || Math.hypot(point.x - gesture.start.x, point.y - gesture.start.y) >= 6 }
}

export function isPetTap(gesture: PetGesture | null, pointerId: number): boolean {
  return gesture !== null && gesture.pointerId === pointerId && !gesture.dragged
}

export function petPolicy({ visible, businessEnabled, focused, shown = true, hidden = false, motionAllowed, mood }: {
  visible: boolean; businessEnabled: boolean; focused: boolean; shown?: boolean; hidden?: boolean; motionAllowed: boolean; mood: PetMood
}) {
  const present = visible && businessEnabled && shown && !hidden
  const interactive = present && focused
  return { present, interactive, animate: interactive && motionAllowed && mood !== 'resting' && mood !== 'dragging' }
}
