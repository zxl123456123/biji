export function spatialPolicy(input: { visible: boolean; focused: boolean; businessEnabled: boolean; motionAllowed: boolean; paused: boolean }) {
  const active = input.visible, interactive = active && input.focused && input.businessEnabled
  return { active, interactive, continuous: interactive && input.motionAllowed && !input.paused }
}

export function spatialPixelRatio(width: number, height: number, deviceRatio: number) {
  return Math.min(deviceRatio || 1, 1.5, Math.sqrt(2_500_000 / Math.max(1, width * height)))
}

// One owned RAF supports both event-driven static frames and bounded animation.
export function createSpatialScheduler(options: {
  request: (callback: (time: number) => void) => number
  cancel: (frame: number) => void
  draw: (time: number, dt: number) => void
}) {
  let frame: number | null = null, active = true, continuous = false, dirty = false, disposed = false
  let last: number | null = null, epoch = 0
  const stop = () => { epoch++; if (frame !== null) options.cancel(frame); frame = null; last = null }
  const schedule = () => {
    if (disposed || !active || frame !== null || (!dirty && !continuous)) return
    const ownEpoch = epoch
    frame = options.request(time => {
      if (disposed || ownEpoch !== epoch || !active) return
      frame = null
      if (!continuous || last === null || time - last >= 1000 / 30) {
        const dt = last === null ? 0 : Math.min(50, Math.max(0, time - last)) / 1000
        last = time; dirty = false
        options.draw(time, dt)
      }
      schedule()
    })
  }
  return {
    invalidate: () => { if (!disposed) { dirty = true; schedule() } },
    setContinuous: (value: boolean) => {
      if (disposed || continuous === value) return
      continuous = value; stop(); schedule()
    },
    setActive: (value: boolean) => {
      if (disposed || active === value) return
      active = value; stop(); if (active) { dirty = true; schedule() }
    },
    dispose: () => { if (!disposed) { disposed = true; continuous = false; dirty = false; stop() } },
  }
}
