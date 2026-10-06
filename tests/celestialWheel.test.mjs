import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { buildCelestialWheelModel } from '../src/celestialWheelModel.ts'
import { wheelLabelDayIndices, wheelSlots } from '../src/celestialWheelScene.ts'
import { spatialPolicy } from '../src/spatialRuntime.ts'

const note = (id, createdAt = '2024-02-29T12:00:00', extra = {}) => ({ id, content: id, status: 'none', done: false, createdAt, ...extra })
const graph = (status, edges = []) => ({ status, model: status === 'ready' ? { nodes: [], edges } : null, key: null })

test('record wheel uses twelve real months, stable civil days and only active records', () => {
  const notes = [note('center'), note('neighbor'), note('outside', '2025-01-01'), note('deleted', '2024-02-29', { deletedAt: '2024-03-01' })]
  const model = buildCelestialWheelModel('center', notes, graph('ready'))
  assert.equal(model.kind, 'ready')
  assert.equal(model.year, '2024')
  assert.equal(model.months.length, 12)
  assert.equal([...model.daysByKey].length, 366)
  assert.equal(model.months[1].days.length, 29)
  assert.equal(model.daysByKey.get('2024-02-29').count, 2)
  assert.deepEqual(model.daysByKey.get('2024-02-29').noteIds, ['center', 'neighbor'])
  assert.equal(model.daysByKey.get('2024-02-28').count, 0)
  assert.equal(model.months.reduce((sum, month) => sum + month.count, 0), 2)
  assert.deepEqual(wheelSlots(model.months[1]).map(slot => slot.key), model.months[1].days.map(day => day.key))
})

test('1 and 15 ring labels point to actual first and fifteenth day in every month length', () => {
  for (const dayCount of [28, 29, 30, 31]) {
    const dates = Array.from({ length: dayCount }, (_, index) => index + 1)
    const [monthIndex, firstIndex, middleIndex, lastIndex] = wheelLabelDayIndices(dayCount)
    assert.equal(dates[monthIndex], 1)
    assert.equal(dates[firstIndex], 1)
    assert.equal(dates[middleIndex], 15)
    assert.equal(dates[lastIndex], dayCount)
  }
})

test('relationships only mark ready direct neighbors in either edge direction', () => {
  const notes = [note('center'), note('a'), note('b'), note('c')]
  const edges = [{ source: 'center', target: 'a' }, { source: 'b', target: 'center' }, { source: 'a', target: 'c' }]
  const ready = buildCelestialWheelModel('center', notes, graph('ready', edges))
  assert.deepEqual(ready.daysByKey.get('2024-02-29').relatedIds, ['a', 'b'])
  for (const status of ['idle', 'updating', 'error']) {
    const pending = buildCelestialWheelModel('center', notes, graph(status, edges))
    assert.deepEqual(pending.daysByKey.get('2024-02-29').relatedIds, [], status)
  }
})

test('invalid center and flat year keep honest fallback semantics', () => {
  assert.equal(buildCelestialWheelModel('missing', [note('center')], graph('idle')).kind, 'missing')
  assert.equal(buildCelestialWheelModel('center', [note('center', '2024-02-30')], graph('idle')).kind, 'undated')
  const flat = buildCelestialWheelModel('center', [note('center', '2025-02-28')], graph('idle'))
  assert.equal(flat.months[1].days.length, 28)
  assert.equal([...flat.daysByKey].length, 365)
})

test('creation date respects the same local timezone boundary as record garden', () => {
  const modelUrl = new URL('../src/celestialWheelModel.ts', import.meta.url).href
  for (const [zone, expected] of [['Asia/Shanghai', '2024-03-01'], ['America/New_York', '2024-02-29']]) {
    const child = spawnSync(process.execPath, ['--experimental-strip-types', '--input-type=module', '-e',
      `import { buildCelestialWheelModel } from ${JSON.stringify(modelUrl)};
       const note = { id:'center', content:'', status:'none', done:false, createdAt:'2024-02-29T23:30:00-05:00' };
       const model = buildCelestialWheelModel('center', [note], { status:'idle', model:null, key:null });
       const date = new Date(note.createdAt);
       const parts = new Intl.DateTimeFormat('en-CA', { year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(date);
       const shown = Object.fromEntries(parts.map(part => [part.type, part.value]));
       console.log(JSON.stringify({ wheel:[...model.daysByKey.values()].find(day => day.count)?.key,
         card:[shown.year, shown.month, shown.day].join('-') }));`],
    { encoding: 'utf8', env: { ...process.env, TZ: zone } })
    assert.equal(child.status, 0, child.stderr)
    assert.deepEqual(JSON.parse(child.stdout), { wheel: expected, card: expected })
  }
})

test('a card scheduled date may differ while the wheel continues to use creation date', () => {
  const center = note('center', '2024-02-29T12:00:00', { scheduledDate: '2024-03-14' })
  const model = buildCelestialWheelModel('center', [center], graph('idle'))
  assert.equal(model.centerDate, '2024-02-29')
  assert.equal(model.daysByKey.get(center.scheduledDate).count, 0)
  assert.equal(model.daysByKey.get(model.centerDate).count, 1)
})

test('animation policy stops continuous work when paused, hidden or unfocused', () => {
  const base = { visible: true, focused: true, businessEnabled: true, motionAllowed: true, paused: false }
  assert.equal(spatialPolicy(base).continuous, true)
  for (const field of ['visible', 'focused', 'businessEnabled', 'motionAllowed'])
    assert.equal(spatialPolicy({ ...base, [field]: false }).continuous, false, field)
  assert.equal(spatialPolicy({ ...base, paused: true }).continuous, false)
})
