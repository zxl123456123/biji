import test from 'node:test'
import assert from 'node:assert/strict'
import { motionValue } from 'motion/react'
import { cancelSoftMotion } from '../src/softMotion.ts'

test('owned cancellation resets actual MotionValues even when no gesture end callback fires', () => {
  const x = motionValue(12), y = motionValue(-10), scale = motionValue(.97)
  let cancelled = 0, stopped = 0
  const animations = [{ stop: () => stopped++ }, { stop: () => stopped++ }]
  const cancel = () => cancelled++
  cancelSoftMotion(cancel, [[x, 0], [y, 0], [scale, 1]], animations)
  assert.deepEqual([x.get(), y.get(), scale.get()], [0, 0, 1])
  assert.equal(animations.length, 0); assert.equal(stopped, 2); assert.equal(cancelled, 1)
  assert.equal(x.getVelocity(), 0)
  cancelSoftMotion(cancel, [[x, 0], [y, 0], [scale, 1]], animations)
  assert.equal(stopped, 2); assert.equal(cancelled, 2)
  assert.deepEqual([x.get(), y.get(), scale.get()], [0, 0, 1])
})
