import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import { reminderQualified } from '../src/desktopPetProtocol.ts'

const source = await readFile(new URL('../src/useMainPetBridge.ts', import.meta.url), 'utf8')
const flush = async () => { for (let i = 0; i < 8; i++) await new Promise(resolve => setImmediate(resolve)) }
const deferred = () => { let resolve, reject; const promise = new Promise((done, fail) => { resolve = done; reject = fail }); return { promise, resolve, reject } }
let generation = 0
async function harness({ begin, load, listenerFail = false, publish, show = () => true, hide = () => true, blocked = false, recallFail = false, recall }) {
  const calls = [], commits = [], reports = [], sessions = [], readyModes = []
  const stored = new Map(), writes = [], listeners = []
  const summary = { appearance: { character: 'xiaotuan', palette: 'cloud', head: 'none', accessory: 'none' }, theme: 'light', shown: true, motionEnabled: true, localDay: '2026-10-07', dueCount: 1, dueTitles: ['test'] }
  let active, owner = 0, released = 0, ready = 0
  const fixture = {
    useRef: value => { const index = active.cursor++; return active.refs[index] ??= { current: value } },
    useState: value => { const session = active, index = session.cursor++; if (!(index in session.states)) session.states[index] = value; return [session.states[index], next => { session.states[index] = typeof next === 'function' ? next(session.states[index]) : next }] },
    useEffect: effect => active.effects.push(effect),
    isDesktop: () => true,
    loadDesktopData: load,
    invoke: async (command, data) => { calls.push({ command, data }); if (command === 'pet_recall') { if (recallFail) throw Error('recall failed'); await recall?.() } if (command === 'pet_begin_owner') { if (begin) await begin(); return { owner: ++owner } } if (command === 'pet_publish') return publish?.(data.publish) },
    getCurrentWindow: () => ({ listen: async (_, handler) => { if (listenerFail) throw Error('listen'); const item = { handler, active: true }; listeners.push(item); return () => { released++; item.active = false } } }),
    PET_ACTION_EVENT: 'qingjian:pet-action', reminderQualified,
    localStorage: { getItem: key => stored.get(key) ?? null, setItem: (key, value) => { writes.push({ key, value }); stored.set(key, value) } },
  }
  globalThis.__desktopPetHookTest = fixture
  const body = stripTypeScriptTypes(source.replace(/^import .*$/gm, ''), { mode: 'strip' })
  const module = await import('data:text/javascript;base64,' + Buffer.from(`const {useRef,useState,useEffect,invoke,getCurrentWindow,isDesktop,loadDesktopData,PET_ACTION_EVENT,reminderQualified,localStorage}=globalThis.__desktopPetHookTest;\n${body}\n// ${++generation}`).toString('base64'))
  delete globalThis.__desktopPetHookTest
  const mount = (replay = false) => {
    active = replay ? sessions.at(-1) : { cursor: 0, refs: [], states: [], effects: [] }
    active.cursor = 0; active.effects = []; if (!replay) sessions.push(active)
    module.useMainPetBridge({ summary, blocked, show, hide, commitData: value => commits.push(value), businessReady: sqliteOK => { ready++; readyModes.push(sqliteOK) }, report: value => reports.push(value) })
    const cleanups = active.effects.map(effect => effect())
    return () => cleanups.forEach(cleanup => cleanup?.())
  }
  const rerender = change => {
    Object.assign(summary, change); active = sessions.at(-1); active.cursor = 0; active.effects = []
    module.useMainPetBridge({ summary: { ...summary }, blocked, show, hide, commitData: value => commits.push(value), businessReady: sqliteOK => { ready++; readyModes.push(sqliteOK) }, report: value => reports.push(value) })
    // Initialization has [] deps; only its existing summary/owner publication effect reruns.
    active.effects.at(-1)()
  }
  return { mount, rerender, emit: action => listeners.findLast(item => item.active)?.handler({ payload: action }), calls, commits, reports, sessions, stored, writes, readyModes, get ready() { return ready }, get released() { return released } }
}
test('StrictMode cancelled begin finishes cleanup before the next owner and only the active owner loads data', async () => {
  const first = deferred(); let begins = 0, loads = 0
  const h = await harness({ begin: () => ++begins === 1 ? first.promise : undefined, load: async () => { loads++; return { marker: 'active' } } })
  const off1 = h.mount(); await flush(); off1(); const off2 = h.mount(true)
  await flush(); assert.equal(begins, 1); first.resolve(); await flush()
  assert.equal(begins, 2); assert.equal(loads, 1); assert.deepEqual(h.commits, [{ marker: 'active' }])
  const begin2 = h.calls.findIndex((call, index) => call.command === 'pet_begin_owner' && index > 0)
  const end1 = h.calls.findIndex(call => call.command === 'pet_end_owner' && call.data.owner === 1)
  assert.ok(end1 >= 0 && end1 < begin2); off2(); await flush()
})
test('cancelled SQLite response never commits its old arrays or marks the new owner ready', async () => {
  const first = deferred(); let loads = 0
  const h = await harness({ load: () => ++loads === 1 ? first.promise : Promise.resolve({ marker: 'new' }) })
  const off1 = h.mount(); await flush(); off1(); const off2 = h.mount(true); first.resolve({ marker: 'old' }); await flush()
  assert.deepEqual(h.commits, [{ marker: 'new' }]); assert.equal(h.ready, 1); assert.ok(h.released >= 1); off2(); await flush()
})
test('listener failure still loads business data but cannot make the pet protocol ready', async () => {
  const h = await harness({ listenerFail: true, load: async () => ({ marker: 'business' }) })
  const off = h.mount(); await flush()
  assert.deepEqual(h.readyModes, [true]); assert.equal(h.ready, 1); assert.deepEqual(h.commits, [{ marker: 'business' }]); assert.equal(h.sessions[0].states[3], null)
  assert.equal(h.calls.some(call => call.command === 'pet_publish'), false); assert.ok(h.reports.includes('桌面伙伴暂不可用')); off(); await flush()
})
test('SQLite failure keeps browser fallback ready and leaves the pet protocol unavailable', async () => {
  const h = await harness({ load: async () => { throw Error('database') } })
  const off = h.mount(); await flush()
  assert.deepEqual(h.readyModes, [false]); assert.equal(h.ready, 1); assert.deepEqual(h.commits, []); assert.equal(h.calls.some(call => call.command === 'pet_publish'), false)
  assert.ok(h.reports.includes('本地数据库暂不可用，已使用浏览器存储')); off(); await flush()
})

const snapshot = (publish, revision = 1) => ({ ...publish, revision, protocolReady: true, reminder: { day: publish.localDay, token: `${publish.localDay}:1` } })
const confirmation = { owner: 1, requestId: 'pet:ack:1', intent: 'reminder-shown', reminder: { day: '2026-10-07', token: '2026-10-07:1' } }
test('a real shown acknowledgement before publish completion waits and writes the daily key only once', async () => {
  const pending = deferred(); let sent
  const h = await harness({ load: async () => ({}), publish: value => { sent = value; return pending.promise } })
  const off = h.mount(); await flush(); h.rerender({}); h.emit(confirmation); await flush()
  assert.equal(h.stored.get('luma-todo-reminded:2026-10-07'), undefined)
  assert.equal(h.calls.some(call => call.command === 'pet_action_result'), false)
  pending.resolve(snapshot(sent)); await flush()
  assert.equal(h.stored.get('luma-todo-reminded:2026-10-07'), '1')
  assert.equal(h.calls.findLast(call => call.command === 'pet_action_result').data.result.status, 'handled')
  h.emit({ ...confirmation, requestId: 'pet:ack:2' }); await flush()
  assert.equal(h.writes.length, 1); assert.equal(h.calls.findLast(call => call.command === 'pet_action_result').data.result.status, 'handled')
  off(); await flush()
})
for (const [name, change] of [['day', { localDay: '2026-10-08' }], ['shown', { shown: false }], ['due work', { dueCount: 0, dueTitles: [] }]]) {
  test(`ack waiting for publish rechecks latest ${name} and never consumes the old day`, async () => {
    const pending = deferred(); let first
    const h = await harness({ load: async () => ({}), publish: value => { first ??= value; return pending.promise.then(() => snapshot(value)) } })
    const off = h.mount(); await flush(); h.rerender({}); h.emit(confirmation); await flush(); h.rerender(change)
    pending.resolve(snapshot(first)); await flush()
    assert.equal(h.writes.length, 0)
    assert.equal(h.calls.findLast(call => call.command === 'pet_action_result').data.result.status, 'unavailable')
    off(); await flush()
  })
}
test('owner cancellation while publish is pending cannot consume its acknowledgement key', async () => {
  const pending = deferred(); let sent
  const h = await harness({ load: async () => ({}), publish: value => { sent = value; return pending.promise } })
  const off = h.mount(); await flush(); h.rerender({}); h.emit(confirmation); await flush(); off(); const off2 = h.mount(true); await flush()
  pending.resolve(snapshot(sent)); await flush()
  assert.equal(h.writes.length, 0)
  assert.equal(h.calls.some(call => call.command === 'pet_action_result'), false)
  off2(); await flush()
})
test('failed publish rejects a waiting shown acknowledgement without writing the daily key', async () => {
  const pending = deferred()
  const h = await harness({ load: async () => ({}), publish: () => pending.promise })
  const off = h.mount(); await flush(); h.rerender({}); h.emit(confirmation); await flush(); pending.reject(Error('publish failed')); await flush()
  assert.equal(h.writes.length, 0)
  assert.ok(h.reports.includes('publish failed'))
  assert.equal(h.calls.some(call => call.command === 'pet_action_result' && call.data.result.status === 'handled'), false)
  off(); await flush()
})

test('tray summon restores a hidden pet even with an editor open and publishes visibility', async () => {
  let shown = 0
  const h = await harness({ load: async () => ({}), blocked: true, show: () => { shown++; return true }, publish: value => ({ ...value, revision: 1 }) })
  const off = h.mount(); await flush(); h.rerender({ shown: false }); await flush()
  h.emit({ owner: 1, requestId: 'tray-show', intent: 'show' }); await flush()
  assert.equal(shown, 1)
  assert.ok(h.calls.some(call => call.command === 'pet_recall'))
  assert.equal(h.calls.findLast(call => call.command === 'pet_publish').data.publish.shown, true)
  assert.equal(h.calls.findLast(call => call.command === 'pet_action_result').data.result.status, 'handled')
  off(); await flush()
})

test('failed recall or preference persistence cannot acknowledge a successful summon', async () => {
  for (const recallFail of [true, false]) {
    const h = await harness({ load: async () => ({}), recallFail, show: () => false })
    const off = h.mount(); await flush()
    h.emit({ owner: 1, requestId: 'tray-failed', intent: 'show' }); await flush()
    assert.equal(h.calls.findLast(call => call.command === 'pet_action_result').data.result.status, 'unavailable')
    assert.equal(h.calls.some(call => call.command === 'pet_publish'), false)
    off(); await flush()
  }
})

test('pending summon preserves newer summary and a following hide remains the final visibility', async () => {
  const pending = deferred(), order = []
  const h = await harness({ load: async () => ({}), recall: () => pending.promise, show: () => { order.push('show'); return true }, hide: () => { order.push('hide'); return true }, publish: value => ({ ...value, revision: 1 }) })
  const off = h.mount(); await flush(); h.rerender({ shown: false }); await flush()
  h.emit({ owner: 1, requestId: 'show-pending', intent: 'show' }); await flush()
  h.rerender({ theme: 'dark', dueCount: 2, dueTitles: ['new', 'todo'] }); await flush()
  h.emit({ owner: 1, requestId: 'hide-next', intent: 'hide' }); await flush()
  assert.deepEqual(order, [])
  pending.resolve(); await flush()
  assert.deepEqual(order, ['show', 'hide'])
  const last = h.calls.findLast(call => call.command === 'pet_publish').data.publish
  assert.equal(last.shown, false); assert.equal(last.theme, 'dark'); assert.deepEqual(last.dueTitles, ['new', 'todo'])
  off(); await flush()
})
