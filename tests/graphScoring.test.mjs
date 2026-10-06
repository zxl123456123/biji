import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { buildNoteGraph } from '../src/noteGraphModel.ts'

const fixture = (content, index) => Object.freeze({id:String(index).padStart(4,'0'), content})
test('scoring patch preserves full frozen r1 models and input-order determinism', () => {
  const {fixtures} = JSON.parse(readFileSync(new URL('./fixtures/graph-r1-models.json',import.meta.url),'utf8'))
  for (const {input: records, expected} of fixtures) {
    const input = Object.freeze(records.map(record=>Object.freeze(record)))
    assert.deepEqual(buildNoteGraph(input),expected)
    assert.deepEqual(buildNoteGraph([...input].reverse()),expected)
  }
})

test('actual scoring loop visits only the shorter set for 100/200 identical four-character bodies', async () => {
  const url = new URL('../src/noteGraphModel.ts',import.meta.url)
  const source = readFileSync(url,'utf8')
  const start = source.indexOf('    const scores = new Map'), end = source.indexOf('    const scored = ',start)
  assert.ok(start >= 0 && end > start)
  const section = source.slice(start,end).replace('const bucket = postings.get(gram)!','let __visitsForGram = 0; const bucket = postings.get(gram)!')
  let instruments = 0
  const scored = section.replace(/for \(const other of (bucket|candidates)\) \{/g, match => {
    instruments++
    return `${match}\n          globalThis.__graphScoringVisits++; if (++__visitsForGram > Math.min(bucket.length,candidates.size) || __visitsForGram > 64) throw Error('Scoring access bound exceeded')`
  })
  assert.equal(instruments,2)
  const instrumented = (source.slice(0,start)+scored+source.slice(end))
    .replace("'./noteText.ts'",JSON.stringify(new URL('../src/noteText.ts',import.meta.url).href))
    .replace("'./recordTools.ts'",JSON.stringify(new URL('../src/recordTools.ts',import.meta.url).href))
  const plain = stripTypeScriptTypes(instrumented,{mode:'strip'})
  const {buildNoteGraph: measured} = await import('data:text/javascript;base64,'+Buffer.from(plain).toString('base64'))
  try {
    const {fixtures} = JSON.parse(readFileSync(new URL('./fixtures/graph-r1-models.json',import.meta.url),'utf8'))
    globalThis.__graphScoringVisits = 0
    for (const {input,expected} of fixtures) assert.deepEqual(measured(input),expected)
    for (const count of [100,200]) {
      const input = Array.from({length:count},(_,index)=>fixture('甲乙丙丁',index))
      globalThis.__graphScoringVisits = 0
      const model = measured(input)
      assert.deepEqual(model,buildNoteGraph(input))
      assert.equal(globalThis.__graphScoringVisits,5*count*2)
      console.log(JSON.stringify({phase:'actual scoring loop',nodes:count,gramCount:5,candidates:2,visits:globalThis.__graphScoringVisits}))
    }
  } finally { delete globalThis.__graphScoringVisits }
})
