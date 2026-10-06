import test from 'node:test'
import assert from 'node:assert/strict'
import { createGraphRequests } from '../src/useNoteGraph.ts'
const corpus = text => Array.from({length:80},(_,i)=>({id:String(i),content:text}))
function fixture(createFails=false) {
  const states=[], transports=[], timers=new Map()
  let token=0
  const requests=createGraphRequests({
    onState: state=>states.push(state),
    setTimer: callback=>{timers.set(++token,callback);return token},
    clearTimer: token=>timers.delete(token),
    workerFactory:()=>{
      if(createFails)throw Error('create fail')
      const transport={sent:[],terminated:false,onmessage:null,onerror:null,onmessageerror:null,
        postMessage(request){this.sent.push(request)},terminate(){this.terminated=true}}
      transports.push(transport)
      return transport
    },
  })
  return {requests,states,transports,timers}
}
test('one in flight and one replaceable latest pending; stale response never accepted',()=>{
  const f=fixture();f.requests.submit(corpus('a'));f.requests.submit(corpus('b'));f.requests.submit(corpus('c'))
  const t=f.transports[0]
  assert.equal(t.sent.length,1)
  t.onmessage({data:{version:t.sent[0].version,model:{nodes:[],edges:[]}}})
  assert.equal(t.sent.length,2)
  assert.equal(t.sent[1].input[0].content,'c')
  assert.equal(f.states.filter(s=>s.status==='ready').length,0)
  t.onmessage({data:{version:t.sent[1].version,model:{nodes:[],edges:[]}}})
  assert.equal(f.states.at(-1).status,'ready')
  assert.equal(f.timers.size,0)
})
for(const failure of ['timeout','error','messageerror','reply-error','create'])test(`${failure} clears relations and reaches visible error; retry is bounded`,()=>{
  const f=fixture(failure==='create');f.requests.submit(corpus('a'))
  const t=f.transports[0]
  if(failure==='timeout')[...f.timers.values()][0]()
  if(failure==='error')t.onerror({})
  if(failure==='messageerror')t.onmessageerror({})
  if(failure==='reply-error')t.onmessage({data:{version:t.sent[0].version,error:'failed'}})
  assert.equal(f.states.at(-1).status,'error')
  assert.equal(f.states.at(-1).model,null)
  assert.equal(f.timers.size,0)
  if(t)assert.equal(t.terminated,true)
  f.requests.retry()
  assert.equal(f.transports.length,failure==='create'?0:2)
})
test('cancel blocks captured late callbacks and clears timer; a new session can submit',()=>{
  const f=fixture();f.requests.submit(corpus('a'))
  const t=f.transports[0], late=t.onmessage, lateError=t.onerror, lateMessageError=t.onmessageerror, timeout=[...f.timers.values()][0]
  f.requests.cancel();const count=f.states.length
  late({data:{version:t.sent[0].version,model:{nodes:[],edges:[]}}});timeout()
  assert.equal(f.states.length,count)
  assert.equal(t.terminated,true)
  assert.equal(f.timers.size,0)
  f.requests.submit(corpus('b'))
  assert.equal(f.transports.length,2)
  const newCount=f.states.length
  timeout();lateError({});lateMessageError({});late({data:{version:t.sent[0].version,model:{nodes:[],edges:[]}}})
  assert.equal(f.states.length,newCount)
  assert.equal(f.transports[1].terminated,false)
})
test('large content threshold uses Worker; tiny snapshot runs same pure model',()=>{
  const f=fixture();f.requests.submit([{id:'a',content:'x'.repeat(40000)}])
  assert.equal(f.transports.length,1)
  f.requests.cancel();f.requests.submit([{id:'b',content:'短句'}])
  assert.equal(f.states.at(-1).status,'ready')
  assert.equal(f.states.at(-1).model.nodes[0].id,'b')
})
test('revised OR boundary keeps 23 notes / 7999 UTF16 synchronous and equal boundaries asynchronous', () => {
  const notes = (count, total) => Array.from({length:count}, (_, index) => ({
    id: String(index), content: '甲'.repeat(Math.floor(total / count) + (index < total % count ? 1 : 0)),
  }))
  for (const [count, total, expectedWorkers] of [[23,7999,0],[24,24,1],[1,8000,1],[76,39166,1]]) {
    const f = fixture(), input = notes(count,total)
    assert.equal(input.reduce((sum,note)=>sum+note.content.length,0), total)
    f.requests.submit(input)
    assert.equal(f.transports.length, expectedWorkers, `${count}/${total}`)
    assert.equal(f.states.at(-1).status, expectedWorkers ? 'updating' : 'ready')
    f.requests.cancel()
  }
})
