import test from 'node:test'
import assert from 'node:assert/strict'
import { PET_VISIBLE_KEY, clampPetPosition, isPetTap, movePetGesture, petPolicy, reducePetMood } from '../src/petBehavior.ts'

const idle = { mood: 'idle', resting: false }
const gesture = () => ({ pointerId: 7, start: { x: 10, y: 20 }, current: { x: 10, y: 20 }, origin: { x: 100, y: 200 }, dragged: false })

test('pet feedback settles, and resting is explicit and survives dragging or cancellation', () => {
  assert.equal(PET_VISIBLE_KEY, 'luma-pet-visible')
  const happy = reducePetMood(idle, 'tap')
  assert.deepEqual(happy, { mood: 'happy', resting: false })
  assert.deepEqual(reducePetMood(happy, 'settle'), idle)
  assert.deepEqual(reducePetMood(happy, 'cancel'), idle)
  const rest = reducePetMood(idle, 'rest')
  assert.deepEqual(rest, { mood: 'resting', resting: true })
  for (const end of ['cancel', 'drag-end']) assert.deepEqual(reducePetMood(reducePetMood(rest, 'drag-start'), end), rest)
  assert.equal(reducePetMood(rest, 'settle'), rest)
  assert.deepEqual(reducePetMood(rest, 'wake'), idle)
  assert.deepEqual(reducePetMood(rest, 'tap'), happy)
  assert.deepEqual(reducePetMood(reducePetMood(happy, 'drag-start'), 'cancel'), idle)
})

test('only the owned pointer can move or tap; 6px excursion is a drag even after returning', () => {
  const start = gesture()
  assert.equal(movePetGesture(start, 9, { x: 200, y: 500 }), start)
  assert.equal(isPetTap(start, 9), false)
  const small = movePetGesture(start, 7, { x: 13, y: 24 })
  assert.equal(isPetTap(small, 7), true)
  const moved = movePetGesture(start, 7, { x: 16, y: 20 })
  assert.equal(isPetTap(moved, 7), false)
  assert.equal(isPetTap(movePetGesture(moved, 7, start.start), 7), false)
  assert.equal(isPetTap(null, 7), false)
  assert.deepEqual(start, gesture())
})

test('pet position keeps the complete controls within the viewport and reclamps after resize', () => {
  const size = { width: 160, height: 204 }
  assert.deepEqual(clampPetPosition({ x: -20, y: -3 }, size, { width: 1200, height: 780 }), { x: 8, y: 8 })
  const wide = clampPetPosition({ x: 5000, y: 9000 }, size, { width: 1200, height: 780 })
  assert.deepEqual(wide, { x: 1032, y: 568 })
  assert.deepEqual(clampPetPosition(wide, size, { width: 390, height: 650 }), { x: 222, y: 438 })
  assert.deepEqual(clampPetPosition(wide, size, { left: 30, top: 70, width: 390, height: 650 }), { x: 252, y: 508 })
  assert.deepEqual(clampPetPosition(wide, size, { width: 100, height: 100 }), { x: 8, y: 8 })
})

test('pausing animation preserves static interaction, while hidden, modal and blur stop the owner', () => {
  const active = { visible: true, businessEnabled: true, focused: true, motionAllowed: true, mood: 'idle' }
  assert.deepEqual(petPolicy(active), { present: true, interactive: true, animate: true })
  for (const changed of [{ motionAllowed: false }, { mood: 'resting' }, { mood: 'dragging' }]) {
    assert.deepEqual(petPolicy({ ...active, ...changed }), { present: true, interactive: true, animate: false })
  }
  for (const changed of [{ visible: false }, { businessEnabled: false }, { shown: false }, { hidden: true }]) {
    assert.deepEqual(petPolicy({ ...active, ...changed }), { present: false, interactive: false, animate: false })
  }
  assert.deepEqual(petPolicy({ ...active, focused: false }), { present: true, interactive: false, animate: false })
})
