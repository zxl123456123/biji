import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import {
  buildRecordGardenModel, dayLabel, localDateKey, monthCells, monthDays,
  shiftMonth, validDateKey,
} from '../src/recordGardenModel.ts'

const note = (id, fields = {}) => ({
  id, content: id, status: 'none', createdAt: '2026-10-03T12:00:00', done: false,
  ...fields,
})
const emptyModel = () => buildRecordGardenModel([], 'created')
const modelUrl = new URL('../src/recordGardenModel.ts', import.meta.url).href

function inTimeZone(zone, body) {
  const child = spawnSync(process.execPath, [
    '--experimental-strip-types', '--input-type=module', '-e',
    `import { buildRecordGardenModel, localDateKey, monthDays, monthCells, dayLabel } from ${JSON.stringify(modelUrl)};
    ${body}`,
  ], { encoding: 'utf8', env: { ...process.env, TZ: zone } })
  assert.equal(child.status, 0, child.stderr || child.error?.message)
  return JSON.parse(child.stdout)
}

test('date keys reject rolled dates and preserve four-digit years', () => {
  for (const value of ['2024-02-29', '2000-02-29', '0000-02-29', '0099-12-31', '2026-10-03']) {
    assert.equal(validDateKey(value), true, value)
  }
  for (const value of ['2025-02-29', '1900-02-29', '2026-04-31', '2026-13-01', '2026-00-01', '2026-01-00', '2026-1-03', '2026-10-03T00:00:00Z', '']) {
    assert.equal(validDateKey(value), false, value)
  }
  assert.equal(localDateKey(new Date('invalid')), '')
})

test('creation and record dates differ without counting updates', () => {
  const notes = [note('placed', { scheduledDate: '2026-10-05', updatedAt: '2027-01-01T00:00:00Z' }), note('fallback')]
  const created = buildRecordGardenModel(notes, 'created')
  const record = buildRecordGardenModel(notes, 'record')
  assert.deepEqual(created.days.get('2026-10-03').map(item => item.id), ['placed', 'fallback'])
  assert.deepEqual(record.days.get('2026-10-05').map(item => item.id), ['placed'])
  assert.deepEqual(record.days.get('2026-10-03').map(item => item.id), ['fallback'])
  assert.equal(created.days.has('2027-01-01'), false)
  assert.deepEqual(created.undated, [])
})

test('invalid explicit record dates remain undated while missing dates fall back', () => {
  const notes = [
    note('invalid-record', { scheduledDate: '2026-04-31' }),
    note('missing-record'), note('empty-record', { scheduledDate: '' }),
    note('invalid-created', { createdAt: 'invalid' }),
    note('scheduled-only', { createdAt: 'invalid', scheduledDate: '2024-02-29' }),
  ]
  const created = buildRecordGardenModel(notes, 'created')
  const record = buildRecordGardenModel(notes, 'record')
  assert.deepEqual(created.undated.map(item => item.id), ['invalid-created', 'scheduled-only'])
  assert.deepEqual(record.undated.map(item => item.id), ['invalid-record', 'invalid-created'])
  assert.deepEqual(record.days.get('2026-10-03').map(item => item.id), ['missing-record', 'empty-record'])
  assert.equal(record.days.get('2024-02-29')[0].id, 'scheduled-only')
})

test('rolled ISO creation dates stay undated without changing valid timezone offsets', () => {
  const invalid = ['2026-04-31T12:00:00Z', '2025-02-29T12:00:00+08:00', '2026-02-30', '2026-02-30 12:00:00']
    .map((createdAt, index) => note(`rolled-${index}`, { createdAt }))
  for (const basis of ['created', 'record']) {
    const model = buildRecordGardenModel(invalid, basis)
    assert.equal(model.days.size, 0)
    assert.deepEqual(model.undated, invalid)
  }
  const assigned = buildRecordGardenModel([{ ...invalid[0], scheduledDate: '2026-10-09' }], 'record')
  assert.equal(assigned.days.get('2026-10-09')[0].content, invalid[0].content)
  for (const [zone, expected] of [['Asia/Shanghai', '2024-03-01'], ['America/New_York', '2024-02-29']]) {
    const result = inTimeZone(zone, `
      const model = buildRecordGardenModel([{ id: 'valid', content: '', status: 'none', done: false, createdAt: '2024-02-29T23:30:00-05:00' }], 'created');
      console.log(JSON.stringify({ dates: [...model.days.keys()], undated: model.undated.length }));
    `)
    assert.deepEqual(result, { dates: [expected], undated: 0 }, zone)
  }
})

test('lowercase RFC3339 separators do not bypass calendar validation', () => {
  const invalid = [note('lower-april', { createdAt: '2026-04-31t12:00:00z' }),
    note('lower-february', { createdAt: '2026-02-30t12:00:00+08:00' })]
  for (const basis of ['created', 'record']) {
    const model = buildRecordGardenModel(invalid, basis)
    assert.equal(model.days.size, 0)
    assert.deepEqual(model.undated, invalid)
  }
  for (const [zone, expected] of [['Asia/Shanghai', '2024-03-01'], ['America/New_York', '2024-02-29']]) {
    const result = inTimeZone(zone, `
      const model = buildRecordGardenModel([{ id: 'lower-valid', content: '', status: 'none', done: false, createdAt: '2024-02-29t23:30:00-05:00' }], 'created');
      console.log(JSON.stringify([...model.days.keys()]));
    `)
    assert.deepEqual(result, [expected], zone)
  }
})

test('deleted, restored and permanently removed notes produce consistent counts', () => {
  const notes = [note('active'), note('done', { done: true }), note('trash', { deletedAt: '2026-10-04T01:00:00Z', done: true })]
  for (const basis of ['created', 'record']) {
    const original = buildRecordGardenModel(notes, basis)
    assert.equal(monthDays('2026-10', original)[2].count, 2)
    assert.equal(monthDays('2026-10', original)[2].doneCount, 1)
    const restored = notes.map(item => item.id === 'trash' ? { ...item, deletedAt: undefined } : item)
    assert.equal(monthDays('2026-10', buildRecordGardenModel(restored, basis))[2].count, 3)
    assert.equal(monthDays('2026-10', buildRecordGardenModel(restored.filter(item => item.id !== 'trash'), basis))[2].count, 2)
  }
  assert.equal(notes[2].deletedAt, '2026-10-04T01:00:00Z')
})

test('frozen sources retain order and all 65 notes are counted', () => {
  const notes = Object.freeze(Array.from({ length: 65 }, (_, index) => Object.freeze(note(String(index), { done: index % 2 === 0 }))))
  const model = buildRecordGardenModel(notes, 'created')
  assert.deepEqual(model.days.get('2026-10-03'), notes)
  assert.notEqual(model.days.get('2026-10-03'), notes)
  assert.equal(model.days.get('2026-10-03')[0], notes[0])
  assert.deepEqual(monthDays('2026-10', model)[2], { date: '2026-10-03', day: 3, count: 65, doneCount: 33 })
})

test('month days and Monday-first cells handle leap years, empty months and six rows', () => {
  assert.equal(monthDays('2024-02', emptyModel()).length, 29)
  assert.equal(monthDays('2025-02', emptyModel()).length, 28)
  const monday = monthCells('2021-02', emptyModel())
  assert.equal(monday.length, 28)
  assert.equal(monday[0].date, '2021-02-01')
  const sunday = monthCells('2026-03', emptyModel())
  assert.equal(sunday.length, 42)
  assert.deepEqual(sunday.slice(0, 6), Array(6).fill(null))
  assert.equal(sunday[6].date, '2026-03-01')
  assert.equal(sunday[36].date, '2026-03-31')
  assert.deepEqual(sunday.slice(37), Array(5).fill(null))
  assert.equal(sunday.filter(Boolean).every(day => day.count === 0 && day.doneCount === 0), true)
})

test('month navigation crosses years and labels are complete Chinese dates', () => {
  assert.equal(shiftMonth('2026-12', 1), '2027-01')
  assert.equal(shiftMonth('2027-01', -1), '2026-12')
  assert.equal(shiftMonth('2026-10', -13), '2025-09')
  assert.equal(shiftMonth('0099-12', 1), '0100-01')
  assert.equal(dayLabel('2026-10-03'), '2026年10月3日星期六')
  assert.equal(dayLabel('2026-04-31'), '未指定日期')
  assert.throws(() => monthDays('2026-13', emptyModel()), RangeError)
  assert.throws(() => shiftMonth('2026-1', 1), RangeError)
})

test('Shanghai and New York project creation timestamps locally while record dates stay stable', () => {
  for (const [zone, expected] of [['Asia/Shanghai', '2026-10-03'], ['America/New_York', '2026-10-02']]) {
    const result = inTimeZone(zone, `
      const date = new Date('2026-10-02T16:30:00Z');
      const notes = [{ id: 'one', content: '', status: 'none', createdAt: date.toISOString(), scheduledDate: '2026-10-05', done: false }];
      console.log(JSON.stringify({ local: localDateKey(date), created: [...buildRecordGardenModel(notes, 'created').days.keys()], record: [...buildRecordGardenModel(notes, 'record').days.keys()], label: dayLabel('2026-10-03') }));
    `)
    assert.deepEqual(result, { local: expected, created: [expected], record: ['2026-10-05'], label: '2026年10月3日星期六' }, zone)
  }
})

test('New York DST boundaries keep local days and calendar days distinct', () => {
  const result = inTimeZone('America/New_York', `
    const times = ['2026-03-08T04:30:00Z', '2026-03-08T06:30:00Z', '2026-03-08T07:30:00Z', '2026-11-01T05:30:00Z', '2026-11-01T06:30:00Z'];
    const notes = times.map((createdAt, index) => ({ id: String(index), content: '', status: 'none', createdAt, done: false }));
    const model = buildRecordGardenModel(notes, 'created');
    console.log(JSON.stringify({ local: times.map(value => localDateKey(new Date(value))), counts: [...model.days].map(([date, rows]) => [date, rows.length]), march: monthDays('2026-03', model).map(day => day.date), november: monthDays('2026-11', model).map(day => day.date), cells: monthCells('2026-03', model).length }));
  `)
  assert.deepEqual(result.local, ['2026-03-07', '2026-03-08', '2026-03-08', '2026-11-01', '2026-11-01'])
  assert.deepEqual(result.counts, [['2026-03-07', 1], ['2026-03-08', 2], ['2026-11-01', 2]])
  assert.equal(new Set(result.march).size, 31)
  assert.equal(result.march.at(-1), '2026-03-31')
  assert.equal(new Set(result.november).size, 30)
  assert.equal(result.november.at(-1), '2026-11-30')
  assert.equal(result.cells, 42)
})
