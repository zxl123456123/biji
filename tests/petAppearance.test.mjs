import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_PET_APPEARANCE, PET_APPEARANCE_KEY, PET_CHARACTER_NAMES, parsePetAppearance, readPetAppearance, writePetAppearance } from '../src/petAppearance.ts'

const defaults = () => ({ ...DEFAULT_PET_APPEARANCE })

test('all five characters and every finite wardrobe combination parse as fresh values', () => {
  assert.deepEqual(PET_CHARACTER_NAMES, { xiaotuan: '晴小团', nailong: '奶龙', chiikawa: '吉伊', hachiware: '小八', usagi: '乌萨奇' })
  for (const character of Object.keys(PET_CHARACTER_NAMES)) for (const palette of ['cloud', 'mint', 'peach']) {
    for (const head of ['none', 'beret', 'halo']) for (const accessory of ['none', 'scarf', 'bow']) {
      const value = Object.freeze({ character, palette, head, accessory })
      assert.deepEqual(parsePetAppearance(value), value)
      assert.notEqual(parsePetAppearance(value), value)
    }
  }
})

test('invalid shapes, missing or extra fields, enums and types fall back to the complete original appearance', () => {
  const invalid = [null, undefined, 0, false, 'xiaotuan', [], {}, { ...defaults(), character: 'dragon' },
    { ...defaults(), palette: false }, { ...defaults(), head: 0 }, { ...defaults(), accessory: null },
    { ...defaults(), palette: 'var(--color)' }, { ...defaults(), head: '<svg>' },
    { character: 'nailong', head: 'beret', accessory: 'bow' }, { ...defaults(), url: 'https://example.test/pet.svg' }]
  for (const value of invalid) {
    const result = parsePetAppearance(value)
    assert.deepEqual(result, defaults())
    assert.notEqual(result, DEFAULT_PET_APPEARANCE)
  }
  const first = parsePetAppearance(null); first.character = 'usagi'
  assert.deepEqual(parsePetAppearance(null), defaults())
})

test('reading is confined to its key, never repairs storage, and handles missing, malformed and throwing reads', () => {
  const gets = [], writes = []
  const value = { character: 'hachiware', palette: 'mint', head: 'halo', accessory: 'scarf' }
  const storage = { getItem: key => { gets.push(key); return JSON.stringify(value) }, setItem: (...args) => writes.push(args) }
  assert.deepEqual(readPetAppearance(storage), value)
  assert.deepEqual(gets, [PET_APPEARANCE_KEY])
  assert.deepEqual(writes, [])
  for (const raw of [null, '', '{bad', '[]', 'false', '{"character":"usagi"}', JSON.stringify({ ...value, unknown: true })]) {
    assert.deepEqual(readPetAppearance({ getItem: () => raw }), defaults())
  }
  assert.deepEqual(readPetAppearance({ getItem: () => { throw new Error('Storage is unavailable') } }), defaults())
})

test('applying writes exactly one normalized pet key and leaves business and spatial preferences alone', () => {
  const values = new Map([['luma-spatial-appearance', 'spatial'], ['luma-notes-v1', 'notes'], ['luma-pet-visible', 'off']]), calls = []
  const storage = { setItem: (key, value) => { calls.push([key, value]); values.set(key, value) } }
  const next = { character: 'chiikawa', palette: 'peach', head: 'beret', accessory: 'bow' }
  assert.equal(writePetAppearance(next, storage), true)
  assert.deepEqual(calls, [[PET_APPEARANCE_KEY, JSON.stringify(next)]])
  assert.equal(values.get('luma-spatial-appearance'), 'spatial')
  assert.equal(values.get('luma-notes-v1'), 'notes')
  assert.equal(values.get('luma-pet-visible'), 'off')
  assert.equal(writePetAppearance({ ...next, extra: 'discard' }, storage), true)
  assert.deepEqual(JSON.parse(calls[1][1]), defaults())
  for (const name of ['QuotaExceededError', 'SecurityError']) {
    assert.equal(writePetAppearance(next, { setItem: () => { throw new DOMException('Denied', name) } }), false)
  }
})

test('obtaining the default localStorage object is inside the safe read and write boundary', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get: () => { throw new DOMException('Denied', 'SecurityError') } })
  try {
    assert.deepEqual(readPetAppearance(), defaults())
    assert.equal(writePetAppearance(defaults()), false)
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor)
    else delete globalThis.localStorage
  }
})
