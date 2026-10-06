type ResetValue = { stop: () => void; jump: (value: number) => void }
type Stoppable = { stop: () => void }

// Cancellation must reset values even when the gesture skips its end callback.
export function cancelSoftMotion(cancelGesture: () => void, values: readonly [ResetValue, number][], animations: Stoppable[]) {
  cancelGesture()
  while (animations.length) animations.pop()!.stop()
  for (const [value, origin] of values) { value.stop(); value.jump(origin) }
}
