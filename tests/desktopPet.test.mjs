import test from 'node:test'
import assert from 'node:assert/strict'
import { acceptSnapshot, reminderQualified } from '../src/desktopPetProtocol.ts'
import { clampPetPoint, createPetMovement } from '../src/desktopPetMotion.ts'

const geometry = { position: { x: -800, y: 250 }, outerSize: { width: 220, height: 260 }, workArea: { x: -1920, y: -120, width: 1920, height: 1080 }, scaleFactor: 1.5 }
test('late snapshot cannot roll back a newer owner or invalidate its current reminder', () => {
  const old = { owner: 1, revision: 8 }, current = { owner: 2, revision: 10 }
  assert.equal(acceptSnapshot(current, old), current)
  assert.equal(acceptSnapshot(current, { ...current, revision: 10, shown: false }), current)
  const next = { owner: 2, revision: 11 }
  assert.equal(acceptSnapshot(current, next), next)
})
test('reminder confirmation requires current owner, actual day token, due work and shown preference', () => {
  const snapshot = { owner: 3, protocolReady: true, reminder: { day: '2026-10-07', token: '2026-10-07:1' } }
  const action = { owner: 3, reminder: snapshot.reminder }
  assert.equal(reminderQualified(snapshot, action, '2026-10-07', true, 1), true)
  for (const invalid of [{ owner: 2 }, { reminder: { ...action.reminder, token: 'old' } }, { reminder: { ...action.reminder, day: '2026-10-06' } }]) {
    assert.equal(reminderQualified(snapshot, { ...action, ...invalid }, '2026-10-07', true, 1), false)
  }
  assert.equal(reminderQualified(snapshot, action, '2026-10-08', true, 1), false)
  assert.equal(reminderQualified(snapshot, action, '2026-10-07', false, 1), false)
  assert.equal(reminderQualified(snapshot, action, '2026-10-07', true, 0), false)
  assert.equal(reminderQualified({ ...snapshot, protocolReady: false }, action, '2026-10-07', true, 1), false)
})
test('physical clamping handles negative monitor origin and a window larger than the work area', () => {
  assert.deepEqual(clampPetPoint({ x: -9000, y: -9000 }, geometry), { x: -1912, y: -112 })
  assert.deepEqual(clampPetPoint({ x: 9000, y: 9000 }, geometry), { x: -228, y: 692 })
  assert.deepEqual(clampPetPoint({ x: 0, y: 0 }, { ...geometry, workArea: { x: -100, y: -50, width: 100, height: 100 } }), { x: -92, y: -42 })
})
test('cancel during an in-flight native step prevents all remaining positions from replaying', async () => {
  let resolveStep, firstStep
  const started = new Promise(resolve => { firstStep = resolve })
  const steps = [], cancelled = []
  const movement = createPetMovement(async (id, point) => { steps.push({ id, point }); firstStep(); await new Promise(resolve => { resolveStep = resolve }) }, async id => { cancelled.push(id) })
  const running = movement.run(7, geometry, { x: -700, y: 250 })
  await started
  movement.stop(); resolveStep(); await running
  assert.equal(steps.length, 1); assert.deepEqual(cancelled, [7]); assert.equal(movement.activeId, null)
})
