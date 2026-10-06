import test from 'node:test'
import assert from 'node:assert/strict'
import { buildNoteGraph, projectGraph, semanticSnapshot, semanticKey, compare } from '../src/noteGraphModel.ts'
import { plainNoteText, normaliseBody } from '../src/noteText.ts'
import { presentedNotes, groupNotesByDate } from '../src/notePresentation.ts'
import { selectNotes } from '../src/recordTools.ts'
const input = (id, content) => Object.freeze({id, content})

test('display text shares inline and block rules, preserving unknown HTML and code', () => {
  const body = '# 标题\n## 小题\n- **正文** _斜体_ `内联` [[color:blue|颜色]] [[size:lg|大字]]\n```\n**literal** <script>\n```\n<kbd>快捷</kbd> [[unknown|keep]] #标签'
  assert.equal(plainNoteText(body), '标题\n小题\n正文 斜体 内联 颜色 大字\n\n**literal** <script>\n\n快捷 [[unknown|keep]]')
})
test('NFKC and Unicode codepoints preserve emoji and matching mixed-language bodies', () => {
  assert.ok(compare('Ａ', '𠀀') < 0)
  assert.equal(normaliseBody('ＡＢＣ 🚀 计划\n学习'), 'abc 🚀 计划 学习')
  const graph = buildNoteGraph([input('a','ＡＢＣ 🚀 计划'), input('b','abc 🚀 计划')])
  assert.equal(graph.edges[0].similarity,1)
})
test('empty and distinct single-character notes remain isolated', () => {
  const graph = buildNoteGraph([input('a',''),input('b','#标签'),input('c','甲'),input('d','乙')])
  assert.equal(graph.nodes.length,4)
  assert.equal(graph.edges.length,0)
})
test('identical nonempty single-character bodies receive duplicate edges', () => {
  assert.equal(buildNoteGraph([input('a','甲'),input('b','甲')]).edges[0].similarity,1)
})
test('label only channel reports real shared labels and record-level DF', () => {
  const graph = buildNoteGraph([input('a','#泛 #泛 #稀'),input('b','#泛'),input('c','#稀')])
  assert.equal(graph.nodes[0].group,'tag:泛') // same frequency: codepoint tie
  assert.deepEqual(graph.edges.find(e=>e.target==='b').sharedTags,['泛'])
  assert.equal(graph.edges.every(e=>e.similarity===undefined),true)
})
test('rare primary tags win without moving groups when filtered', () => {
  const graph=buildNoteGraph([input('a','工作计划 #生活 #工作'),input('b','散步 #生活'),input('c','晚饭 #生活')])
  assert.equal(graph.nodes[0].group,'tag:工作')
  assert.equal(projectGraph(graph,['a']).nodes[0].group,'tag:工作')
})
test('large common tag and duplicate body use sparse edges and retain every frozen node', () => {
  const notes=Object.freeze(Array.from({length:500},(_,i)=>input(String(i).padStart(4,'0'),'同一份重复内容 #共同 #共同')))
  const graph=buildNoteGraph(notes)
  assert.equal(graph.nodes.length,500)
  assert.ok(graph.edges.length<=4*notes.length)
  assert.ok(graph.edges.every(e=>e.source!==e.target&&e.sharedTags.length===1&&e.similarity===1))
  assert.deepEqual(buildNoteGraph([...notes].reverse()),graph)
})
test('mutual strong untagged choices form deterministic text groups, tags stay separate', () => {
  const graph=buildNoteGraph([input('a','旅行计划订机票'),input('b','旅行计划订机票'),input('c','旅行计划订机票 #旅行'),input('d','独立天文')])
  assert.equal(graph.nodes[0].group,'text:a')
  assert.equal(graph.nodes[1].group,'text:a')
  assert.equal(graph.nodes[2].group,'tag:旅行')
  assert.equal(graph.nodes[3].group,'single:d')
})
test('current IDs win while pending or projected, including isolated and new IDs', () => {
  const graph=buildNoteGraph([input('a','猫猫 #动物'),input('b','狗狗 #动物')])
  assert.deepEqual(projectGraph(graph,['b','new']).nodes.map(n=>n.id),['b','new'])
  assert.equal(projectGraph(graph,['b','new']).edges.length,0)
  assert.deepEqual(projectGraph(null,['b','new']).nodes,[{id:'b',group:'pending'},{id:'new',group:'pending'}])
})
test('semantic key excludes deleted records and ignores done, dates, source order', () => {
  const a=[{id:'b',content:'乙',done:false},{id:'a',content:'甲'},{id:'c',content:'删',deletedAt:'now'}]
  const b=[{id:'a',content:'甲',updatedAt:'later'},{id:'b',content:'乙',done:true}]
  assert.equal(semanticKey(semanticSnapshot(a)),semanticKey(semanticSnapshot(b)))
})
test('full search precedes card batching, date mode sorts before global allowance', () => {
  const notes=Array.from({length:1000},(_,i)=>({id:String(i),content:i===900?'唯一目标':'正文',createdAt:`2026-10-${String(i%3+1).padStart(2,'0')}T12:00:00`,done:false}))
  const filtered=selectNotes(notes,{query:'唯一目标',tag:null,unfinished:false,trash:false})
  assert.equal(presentedNotes(filtered,'grid',60)[0].id,'900')
  assert.equal(presentedNotes(notes,'grid',60).length,60)
  const dated=presentedNotes(notes,'date',60)
  assert.equal(dated.length,60)
  assert.ok(groupNotesByDate(dated)[0][0]==='2026-10-03')
})
