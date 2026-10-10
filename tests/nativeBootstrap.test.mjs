import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'

const source = await readFile(new URL('../src/main.tsx', import.meta.url), 'utf8')
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done }); return { promise, resolve } }
const flush = async () => { for (let i = 0; i < 8; i++) await new Promise(resolve => setImmediate(resolve)) }
let instance = 0

async function harness({ label = 'main', native = true, invoke, listen = async () => () => {}, migration }) {
  const calls = [], imports = [], renders = [], documentState = { dataset: {}, text: '' }, root = { set textContent(value) { documentState.text = value } }
  const runtime = {
    StrictMode: Symbol('StrictMode'), createElement: (...args) => args,
  }
  const modules = {
    react: runtime,
    'react-dom/client': { createRoot: element => ({ render: value => renders.push({ element, value }) }) },
    './App': { default: function App() {} },
    './DesktopPet': { default: function DesktopPet() {} },
    './styles.css': {}, './desktop-pet.css': {},
    'virtual:pwa-register': { registerSW: options => calls.push({ name: 'registerSW', options }) },
  }
  const transformed = stripTypeScriptTypes(source.replace(/^import .*$/gm, '').replace(/import\(([^)]+)\)/g, 'loadModule($1)').replace(/^void start\(\)\s*$/m, ''), { mode: 'strip' })
  const testId = ++instance
  globalThis.__nativeBootstrapHarness = {
    document: { body: { dataset: documentState.dataset }, getElementById: () => root },
    window: native ? { __TAURI_INTERNALS__: {} } : {},
    getCurrentWindow: () => ({ label }),
    listen: async (...args) => { calls.push({ name: 'listen', args }); return listen(...args) },
    invoke: async (...args) => { calls.push({ name: 'invoke', args }); if (invoke) return invoke(...args); if (args[0] === 'startup_ai_migration') return migration?.promise ?? { configured: false, outcomeCode: 'source_missing' }; return { status: 'ready' } },
    loadModule: async name => { imports.push(name); return modules[name] },
  }
  const body = `const {document,window,getCurrentWindow,listen,invoke,loadModule}=globalThis.__nativeBootstrapHarness;\n${transformed}\nexport { start };`
  const module = await import(`data:text/javascript;base64,${Buffer.from(`${body}\n// ${testId}`).toString('base64')}`)
  const pending = module.start()
  return { pending, calls, imports, renders, documentState, cleanup: () => { delete globalThis.__nativeBootstrapHarness } }
}

test('native main waits for both-window result, then awaits migration before App chunk', async () => {
  const ready = deferred()
  const migration = deferred()
  const h = await harness({ migration, invoke: async command => command === 'bootstrap_entry_ready' ? ready.promise : migration.promise })
  await flush()
  assert.deepEqual(h.calls.slice(0, 2).map(call => call.name), ['listen', 'invoke'])
  assert.deepEqual(h.imports, [])
  assert.equal(h.renders.length, 0)
  assert.equal(h.documentState.dataset.bootstrap, 'pending')
  ready.resolve({ status: 'ready' })
  for (let i = 0; i < 20 && !h.calls.some(call => call.args?.[0] === 'startup_ai_migration'); i++) await flush()
  assert.deepEqual(h.imports, ['react', 'react-dom/client'])
  assert.equal(h.renders.length, 0)
  migration.resolve({ configured: true, outcomeCode: 'configured' })
  await h.pending
  assert.deepEqual(h.imports, ['react', 'react-dom/client', './App', './styles.css'])
  assert.equal(h.renders.length, 1)
  h.cleanup()
})

test('native startup imports App only after migration outcome, including a safe failure result', async () => {
  const migration = deferred()
  const h = await harness({ migration, invoke: async command => command === 'startup_ai_migration' ? migration.promise : { status: 'ready' } })
  // wait until handshake, render runtime, and migration command have completed their call sites
  for (let i = 0; i < 20 && !h.calls.some(call => call.args?.[0] === 'startup_ai_migration'); i++) await flush()
  assert.deepEqual(h.imports, ['react', 'react-dom/client'])
  assert.equal(h.renders.length, 0)
  migration.resolve({ configured: false, outcomeCode: 'vault_unavailable' })
  await h.pending
  assert.deepEqual(h.imports, ['react', 'react-dom/client', './App', './styles.css'])
  assert.equal(h.calls.filter(call => call.args?.[0] === 'startup_ai_migration').length, 1)
  assert.equal(h.renders.length, 1)
  h.cleanup()
})

test('pet mounts after shared ready without waiting for the main migration', async () => {
  const h = await harness({ label: 'pet' })
  await h.pending
  assert.deepEqual(h.imports, ['react', 'react-dom/client', './DesktopPet', './desktop-pet.css'])
  assert.equal(h.renders.length, 1)
  assert.equal(h.calls.some(call => call.args?.[0] === 'startup_ai_migration'), false)
  h.cleanup()
})

test('failed handshake leaves the static shell and does not import business chunks', async () => {
  const h = await harness({ invoke: async () => ({ status: 'failed', code: 'pet_navigation_failed' }) })
  await h.pending
  assert.deepEqual(h.imports, [])
  assert.equal(h.renders.length, 0)
  assert.equal(h.documentState.dataset.bootstrap, 'failed')
  assert.match(h.documentState.text, /pet_navigation_failed/)
  h.cleanup()
})

test('failure listener must register before any native handshake or business import', async () => {
  const h = await harness({ listen: async () => { throw Error('listener unavailable') } })
  await h.pending
  assert.equal(h.calls.some(call => call.name === 'invoke'), false)
  assert.deepEqual(h.imports, [])
  assert.equal(h.renders.length, 0)
  assert.equal(h.documentState.dataset.bootstrap, 'failed')
  h.cleanup()
})

test('ordinary Web startup keeps explicit PWA registration', async () => {
  const h = await harness({ native: false })
  await h.pending
  assert.deepEqual(h.imports, ['react', 'react-dom/client', './App', 'virtual:pwa-register', './styles.css'])
  assert.ok(h.calls.some(call => call.name === 'registerSW'))
  assert.equal(h.renders.length, 1)
  h.cleanup()
})
