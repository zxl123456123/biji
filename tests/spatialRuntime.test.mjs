import test from 'node:test'
import assert from 'node:assert/strict'
import { createSpatialScheduler, spatialPolicy, spatialPixelRatio } from '../src/spatialRuntime.ts'

function fixture() {
  let id = 0
  const frames = new Map(), archived = new Map(), draws = [], cancelled = []
  const scheduler = createSpatialScheduler({ request: callback => { frames.set(++id, callback); archived.set(id, callback); return id },
    cancel: frame => { cancelled.push(frame); frames.delete(frame) }, draw: (time, dt) => draws.push({ time, dt }) })
  return { scheduler, frames, archived, draws, cancelled, run: time => { const [key, fn] = frames.entries().next().value; frames.delete(key); fn(time) } }
}

test('static changes coalesce into one frame and do not keep scheduling', () => {
  const f = fixture()
  for (let i = 0; i < 20; i++) f.scheduler.invalidate()
  assert.equal(f.frames.size, 1)
  f.run(0)
  assert.equal(f.draws.length, 1)
  assert.equal(f.frames.size, 0)
})

test('continuous drawings stay within 30fps and long frame deltas are clamped', () => {
  const f = fixture(); f.scheduler.setContinuous(true)
  for (const time of [0, 16, 32, 48, 64, 80, 96, 2000]) f.run(time)
  assert.deepEqual(f.draws.map(draw => draw.time), [0, 48, 96, 2000])
  assert.equal(f.draws.at(-1).dt, .05)
  f.scheduler.setContinuous(false)
  assert.equal(f.frames.size, 0)
  f.scheduler.invalidate(); f.run(2001)
  assert.equal(f.draws.at(-1).dt, 0)
  assert.equal(f.frames.size, 0)
})

test('inactive and disposed generations reject captured late frames and reset the time origin', () => {
  const f = fixture(); f.scheduler.setContinuous(true)
  const late = [...f.archived.values()][0]
  f.scheduler.setActive(false); late(500)
  assert.equal(f.draws.length, 0); assert.equal(f.frames.size, 0)
  f.scheduler.invalidate(); assert.equal(f.frames.size, 0)
  f.scheduler.setActive(true); f.run(5000)
  assert.equal(f.draws[0].dt, 0)
  const old = [...f.frames.values()][0]
  f.scheduler.dispose(); old(6000); f.scheduler.invalidate(); f.scheduler.setActive(true); f.scheduler.setContinuous(true)
  assert.equal(f.draws.length, 1); assert.equal(f.frames.size, 0)
})

test('an invalidation from draw cannot recursively draw or create duplicate frames', () => {
  let pending = [], drawings = 0, scheduler
  scheduler = createSpatialScheduler({ request: callback => { pending.push(callback); return pending.length }, cancel: () => {},
    draw: () => { drawings++; if (drawings === 1) { scheduler.invalidate(); scheduler.invalidate() } } })
  scheduler.invalidate(); pending.shift()(0)
  assert.equal(drawings, 1); assert.equal(pending.length, 1)
  pending.shift()(1); assert.equal(drawings, 2); assert.equal(pending.length, 0)
})

test('motion permission is independent of business interaction and all owner gates are effective', () => {
  const base = { visible: true, focused: true, businessEnabled: true, motionAllowed: true, paused: false }
  for (const change of [{ motionAllowed: false }, { paused: true }]) assert.deepEqual(spatialPolicy({ ...base, ...change }), { active: true, interactive: true, continuous: false })
  assert.deepEqual(spatialPolicy({ ...base, businessEnabled: false }), { active: true, interactive: false, continuous: false })
  assert.deepEqual(spatialPolicy({ ...base, visible: false }), { active: false, interactive: false, continuous: false })
  assert.deepEqual(spatialPolicy({ ...base, focused: false }), { active: true, interactive: false, continuous: false })
})

test('pixel ratio respects DPR and the total drawing buffer budget', () => {
  for (const [width, height, device] of [[390, 340, 3], [1280, 780, 2], [4000, 3000, 2], [0, 0, 0]]) {
    const ratio = spatialPixelRatio(width, height, device)
    assert.ok(ratio <= 1.5)
    assert.ok(width * height * ratio ** 2 <= 2_500_000 + 1)
  }
})
