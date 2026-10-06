import test from 'node:test'
import assert from 'node:assert/strict'
import { reorderInCurrentView, reorderVisible, toggleNotePin, movedIds, insideVisibleGroup, validDropPosition } from '../src/noteOrder.ts'
import { presentedGroups, presentedNotes } from '../src/notePresentation.ts'
import { exportData, parseBackup, saveNotes, loadNotes } from '../src/store.ts'
import { semanticKey, semanticSnapshot } from '../src/noteGraphModel.ts'

const note = (id, extra = {}) => Object.freeze({ id, content: `正文 ${id}`, status: 'none', createdAt: '2026-10-04T12:00:00Z', updatedAt: '2026-10-04T12:01:00Z', scheduledDate: '2026-10-04', done: false, ...extra })
test('reordering both ways replaces only visible slots and preserves original records', () => {
  const full = Object.freeze([note('a'), note('hidden'), note('b'), note('trash', { deletedAt: 'now' }), note('c'), note('unloaded')])
  const reversed = reorderVisible(full, ['a', 'b', 'c'], ['c', 'a', 'b'])
  assert.deepEqual(reversed.map(n => n.id), ['c', 'hidden', 'a', 'trash', 'b', 'unloaded'])
  for (const n of full) assert.equal(reversed.find(item => item.id === n.id), n)
  assert.deepEqual(reorderVisible(reversed, ['c', 'a', 'b'], ['a', 'b', 'c']), full)
  assert.equal(reorderVisible(full, ['a', 'b'], ['a', 'b']), full)
})
test('empty, duplicate, unknown, stale, trash and mixed pin requests are rejected', () => {
  const full = [note('a'), note('b'), note('p', { pinned: true }), note('trash', { deletedAt: 'now' })]
  for (const [before, after] of [[[], []], [['a', 'a'], ['a', 'a']], [['a','b'], ['b','b']], [['a','x'], ['x','a']], [['b','a'], ['a','b']], [['a','trash'], ['trash','a']], [['a','p'], ['p','a']]]) {
    assert.equal(reorderVisible(full, before, after), full)
  }
})
test('pin changes only one field without moving canonical slots or graph semantics', () => {
  const full = [note('a'), note('b'), note('trash', { deletedAt: 'now' })]
  const key = semanticKey(semanticSnapshot(full))
  const pinned = toggleNotePin(full, 'b')
  assert.deepEqual(pinned.map(n => n.id), ['a','b','trash'])
  assert.deepEqual(pinned[1], { ...full[1], pinned: true })
  assert.equal(pinned[0], full[0]); assert.equal(pinned[2], full[2])
  assert.equal(semanticKey(semanticSnapshot(pinned)), key)
  assert.deepEqual(toggleNotePin(pinned, 'b')[1], { ...full[1], pinned: false })
  assert.equal(toggleNotePin(full, 'trash'), full)
  assert.equal(toggleNotePin(full, 'missing'), full)
})
test('production view boundary rejects cross-date, cross-pin and hidden IDs before slot merge', () => {
  const full = [note('a'),note('hidden'),note('b'),note('otherday',{scheduledDate:'2026-10-05'}),note('p',{pinned:true}),note('trash',{deletedAt:'now'})]
  const filtered = full.filter(n=>n.id!=='hidden'&&!n.deletedAt)
  assert.deepEqual(reorderInCurrentView(full,filtered,'date',['a','b'],['b','a']).map(n=>n.id),['b','hidden','a','otherday','p','trash'])
  for (const ids of [['a','otherday'],['a','p'],['a','hidden'],['a','trash'],['b','a']]) assert.equal(reorderInCurrentView(full,filtered,'date',ids,[...ids].reverse()),full)
  assert.equal(reorderInCurrentView(full,filtered,'grid',['b','otherday'],['otherday','b']),full)
})
test('one quota follows stable pins then ordinary date groups; trash ignores pin partition', () => {
  const full = [note('old', { scheduledDate:'2026-10-02' }), note('p1', { pinned:true }), note('new', { scheduledDate:'2026-10-05' }), note('p2', { pinned:true, scheduledDate:'2026-10-01' }), note('same', { scheduledDate:'2026-10-05' })]
  assert.deepEqual(presentedNotes(full, 'grid', 3).map(n=>n.id), ['p1','p2','old'])
  assert.deepEqual(presentedGroups(full, 'date', 4).map(g=>[g.id,g.notes.map(n=>n.id)]), [['pinned',['p1','p2']],['date:2026-10-05',['new','same']]])
  assert.deepEqual(presentedNotes(full, 'reading', 60, true), full)
  const many = Array.from({length:125}, (_,i)=>note(String(i),{pinned:i>=62&&i<65}))
  assert.equal(presentedNotes(many,'grid',60).length,60)
  assert.equal(presentedNotes(many,'grid',120).length,120)
  assert.deepEqual(presentedNotes(many,'grid',60).slice(0,3).map(n=>n.id),['62','63','64'])
})
test('old and new JSON backups and local persistence keep order and metadata', () => {
  const values = new Map()
  const previous = globalThis.localStorage
  globalThis.localStorage = { getItem:key=>values.get(key)??null, setItem:(key,value)=>values.set(key,value) }
  try {
    const old = parseBackup(JSON.parse(JSON.stringify(exportData([note('a'),note('b')],[]))))
    assert.equal(old.version,1); assert.equal(!!old.notes[0].pinned,false)
    const changed = reorderVisible(toggleNotePin(old.notes,'b'), ['b'], ['b'])
    const backup = parseBackup(JSON.parse(JSON.stringify(exportData(changed,[]))))
    saveNotes(backup.notes)
    assert.deepEqual(loadNotes(),backup.notes)
    assert.deepEqual(backup.notes.map(n=>n.id),['a','b']); assert.equal(backup.notes[1].pinned,true)
  } finally { globalThis.localStorage = previous }
})
test('actual move indices include both directions, noop and illegal indices', () => {
  assert.deepEqual(movedIds(['a','b','c'],0,2),['b','c','a'])
  assert.deepEqual(movedIds(['a','b','c'],2,0),['c','a','b'])
  for (const [from,to] of [[0,0],[-1,1],[0,3],[.5,1],[0,NaN]]) assert.equal(movedIds(['a','b','c'],from,to),null)
})
test('final pointer coordinates must be inside current group intersected with viewport', () => {
  const rect = { left:10, top:-50, right:300, bottom:500 }
  assert.equal(insideVisibleGroup(150,100,rect,250,200),true)
  assert.equal(insideVisibleGroup(10,0,rect,250,200),true)
  for (const [x,y] of [[9,100],[251,100],[100,201],[100,-1],[NaN,100]]) assert.equal(insideVisibleGroup(x,y,rect,250,200),false)
  assert.equal(insideVisibleGroup(20,20,{left:1,top:300,right:80,bottom:500},250,200),false)
})
test('actual drop gate uses final pointerup; keyboard ignores pointer geometry independently', () => {
  const rect = {left:0,top:0,right:200,bottom:200}
  assert.equal(validDropPosition(false,{type:'pointerup',clientX:100,clientY:100},rect,200,200),true)
  for (const event of [undefined,{type:'pointerdown',clientX:100,clientY:100},{type:'pointermove',clientX:100,clientY:100},{type:'pointerup',clientX:300,clientY:100},{type:'pointerup'}]) assert.equal(validDropPosition(false,event,rect,200,200),false)
  assert.equal(validDropPosition(true,undefined,undefined,0,0),true)
  assert.equal(validDropPosition(true,{type:'keydown'},rect,0,0),true)
})
