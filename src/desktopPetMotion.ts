import type { PetGeometry, Point } from './desktopPetProtocol'
import { petStepPoint, planPetWalk, type PetFacing, type PetWalk } from './petPerformance.ts'

export { planPetWalk }
export type { PetFacing, PetWalk }

export function clampPetPoint(point: Point, geometry: Pick<PetGeometry, 'workArea' | 'outerSize'>): Point {
  const { workArea: area, outerSize: size } = geometry
  const left = area.x + 8, top = area.y + 8
  return {
    x: Math.round(Math.max(left, Math.min(point.x, Math.max(left, area.x + area.width - size.width - 8)))),
    y: Math.round(Math.max(top, Math.min(point.y, Math.max(top, area.y + area.height - size.height - 8)))),
  }
}

// One timer and one command can be in flight. Cancellation never catches up missed steps.
export function createPetMovement(step: (id: number, point: Point) => Promise<void>, cancel: (id: number) => Promise<void>) {
  let active: number | null = null, timer: ReturnType<typeof setTimeout> | undefined, release: (() => void) | undefined
  const stop = () => {
    const previous = active; active = null
    clearTimeout(timer); release?.(); release = undefined
    if (previous !== null) void cancel(previous).catch(() => {})
  }
  return {
    stop,
    get activeId() { return active },
    async run(id: number, geometry: PetGeometry, walk: PetWalk) {
      stop(); active = id
      try {
        for (let index = 1; index <= walk.steps && active === id; index++) {
          await new Promise<void>(resolve => { release = resolve; timer = setTimeout(resolve, 100) })
          release = undefined
          if (active !== id) return
          const raw = petStepPoint(geometry.position, walk.target, index, walk.steps)
          await step(id, clampPetPoint(raw, geometry))
        }
      } finally { if (active === id) stop() }
    },
  }
}
