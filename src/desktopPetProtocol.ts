import type { PetAppearance } from './petAppearance'

export const PET_SNAPSHOT_EVENT = 'qingjian:pet-snapshot'
export const PET_ACTION_EVENT = 'qingjian:pet-action'
export const PET_RESULT_EVENT = 'qingjian:pet-result'
export const PET_VISIBILITY_EVENT = 'qingjian:pet-visibility'
export const PET_NATIVE_EVENT = 'qingjian:pet-native'
export type Reminder = { day: string; token: string }
export type PetSnapshot = {
  owner: number; revision: number; protocolReady: boolean; appearance: PetAppearance
  theme: 'light' | 'dark'; shown: boolean; motionEnabled: boolean
  localDay: string; dueCount: number; dueTitles: string[]; reminder: Reminder | null
}
export type MainPetPublish = Omit<PetSnapshot, 'revision' | 'protocolReady' | 'reminder'> & { reminderEligible: boolean }
export type PetIntent = 'quick-note' | 'open-todos' | 'show' | 'hide' | 'reminder-shown'
export type PetAction = { owner: number; requestId: string; intent: PetIntent; reminder?: Reminder }
export type PetActionResult = { owner: number; requestId: string; status: 'handled' | 'blocked' | 'unavailable'; reason?: string }
export type Point = { x: number; y: number }
export type PetGeometry = {
  visible: boolean; position: Point; outerSize: { width: number; height: number }
  workArea: { x: number; y: number; width: number; height: number }; scaleFactor: number
  activeDragId: number | null; lastExitedDragId: number | null
}
export type PetNativeEvent =
  | { kind: 'drag-enter' | 'drag-exit'; dragId: number }
  | { kind: 'move-owned'; movementId: number; position: Point }
  | { kind: 'move-external'; cancelledMovementId: number | null; position: Point }

export function acceptSnapshot(current: PetSnapshot | null, next: PetSnapshot): PetSnapshot {
  return current && current.revision >= next.revision ? current : next
}
export function reminderQualified(snapshot: PetSnapshot | null, action: PetAction, day: string, shown: boolean, dueCount: number) {
  return !!snapshot?.protocolReady && action.owner === snapshot.owner && !!action.reminder && shown && dueCount > 0
    && action.reminder.day === day && snapshot.reminder?.day === day && snapshot.reminder.token === action.reminder.token
}
