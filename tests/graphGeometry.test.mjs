import test from 'node:test'
import assert from 'node:assert/strict'
import { select } from 'd3-selection'
import { dragDisable } from 'd3-drag'
import { zoom, zoomIdentity } from 'd3-zoom'
import { toScreen, toWorld, simulationCopies, captureMouseGesture, cancelOwnedMouseGesture, capturePanGesture, cancelOwnedPanGesture, moveDraggedNode } from '../src/graphGeometry.ts'
test('canvas-local subject and drag use a single origin independent of DPR and page offset',()=>{
  const camera={k:2,x:30,y:-20},world={x:10,y:15},rect={left:120,top:80}
  for(const dpr of [1,1.5]){
    const local=toScreen(world,camera)
    assert.deepEqual(local,{x:50,y:10})
    const client={x:local.x+rect.left,y:local.y+rect.top}
    assert.deepEqual(client,{x:170,y:90})
    assert.deepEqual(toWorld({x:client.x-rect.left,y:client.y-rect.top},camera),world)
    assert.deepEqual(toWorld({x:70,y:0},camera),{x:20,y:10})
    assert.equal(Number.isFinite(local.x*dpr),true)
  }
})
test('simulation copies frozen models and link tag arrays; static seeds do not collapse',()=>{
  const edge=Object.freeze({source:'a',target:'b',sharedTags:Object.freeze(['tag'])})
  const model=Object.freeze({nodes:Object.freeze([Object.freeze({id:'a',group:'tag:x'}),Object.freeze({id:'b',group:'tag:x'})]),edges:Object.freeze([edge])})
  const copies=simulationCopies(model,new Map([['a',{x:5,y:8}]]))
  assert.equal(copies.nodes[0].x,5)
  assert.notDeepEqual({x:copies.nodes[1].x,y:copies.nodes[1].y},{x:0,y:0})
  copies.links[0].sharedTags.push('new');copies.nodes[0].x=999
  assert.deepEqual(edge.sharedTags,['tag'])
  assert.equal(model.nodes[0].x,undefined)
})
function controlledWindow(){
  const target=new EventTarget(),log=[]
  target.document={documentElement:{onselectstart:null}}
  const remove=target.removeEventListener.bind(target)
  target.removeEventListener=(name,listener,options)=>{
    log.push(name)
    // Node's EventTarget needs an explicit capture dictionary for browser parity.
    remove(name,listener,typeof options === 'boolean' ? {capture:options} : options)
  }
  return {target,log}
}
test('owned mid-drag cancellation removes move/up then restores native selection only',()=>{
  const {target,log}=controlledWindow(),s=select(target)
  const move=()=>{},up=()=>{},other=()=>{}
  s.on('mousemove.drag',move).on('mouseup.drag',up).on('mousemove.other',other)
  dragDisable(target)
  let gesture=captureMouseGesture(target)
  let disposed=false
  const node={x:10,y:15},camera={k:2,x:30,y:-20}
  const invert=([x,y])=>[(x-camera.x)/camera.k,(y-camera.y)/camera.k]
  disposed=true;cancelOwnedMouseGesture(gesture);gesture=null
  assert.equal(moveDraggedNode(node,[70,0],invert,disposed),false)
  assert.equal(s.on('mousemove.drag'),undefined)
  assert.equal(s.on('mouseup.drag'),undefined)
  assert.equal(s.on('dragstart.drag'),undefined)
  assert.equal(s.on('selectstart.drag'),undefined)
  assert.equal(s.on('mousemove.other'),other)
  assert.equal(gesture,null);assert.deepEqual(node,{x:10,y:15})
  assert.ok(log.indexOf('mousemove')<log.indexOf('dragstart'))
  assert.ok(log.indexOf('mouseup')<log.indexOf('selectstart'))
})
test('absent, normally released, or replaced gesture never clears another owner',()=>{
  const {target,log}=controlledWindow(),s=select(target)
  cancelOwnedMouseGesture(null);assert.equal(log.length,0)
  const move=()=>{},up=()=>{},replacement=()=>{}
  s.on('mousemove.drag',move).on('mouseup.drag',up)
  const old=captureMouseGesture(target)
  s.on('mousemove.drag',replacement);dragDisable(target)
  const length=log.length
  cancelOwnedMouseGesture(old)
  assert.equal(log.length,length)
  assert.equal(s.on('mousemove.drag'),replacement)
  assert.ok(s.on('selectstart.drag'))
  old.active=false;cancelOwnedMouseGesture(old)
  assert.equal(log.length,length)
})

function controlledPan() {
  const { target: view, log } = controlledWindow()
  const canvas = new EventTarget()
  canvas.clientLeft = canvas.clientTop = 0
  canvas.getBoundingClientRect = () => ({left:120, top:80})
  let gesture = null, disposed = false, cameraWrites = 0
  const behavior = zoom().extent([[0,0],[500,400]]).touchable(false)
    .on('start.owner', event => {
      if (!disposed && event.sourceEvent?.type === 'mousedown' && event.sourceEvent.view) {
        gesture = capturePanGesture(event.sourceEvent.view)
      }
    })
    .on('end.owner', event => {
      if (event.sourceEvent?.type === 'mouseup') gesture = null
    })
    .on('zoom.camera', () => { if (!disposed) cameraWrites++ })
  const selection = select(canvas)
  selection.call(behavior).on('dblclick.zoom',null)
  const mouse = (type, x=180, y=120) => {
    const event = new Event(type, {cancelable:true})
    Object.defineProperties(event, {view:{value:view}, clientX:{value:x}, clientY:{value:y}, button:{value:0}})
    return event
  }
  return {
    view, canvas, log, selection, behavior, mouse,
    gesture:()=>gesture, cameraWrites:()=>cameraWrites,
    dispose:()=>{
      disposed = true
      cancelOwnedPanGesture(gesture)
      gesture = null
      selection.on('.zoom',null)
    },
  }
}
test('actual D3 mouse pan cancellation restores native selection and rejects late mousemove', () => {
  const f = controlledPan(), target = select(f.view), other = () => {}
  target.on('mousemove.other',other)
  f.canvas.dispatchEvent(f.mouse('mousedown'))
  assert.ok(f.gesture())
  assert.ok(target.on('mousemove.zoom'))
  assert.ok(target.on('mouseup.zoom'))
  assert.ok(target.on('selectstart.drag'))
  f.dispose()
  assert.equal(f.gesture(),null)
  for (const name of ['mousemove.zoom','mouseup.zoom','dragstart.drag','selectstart.drag']) assert.equal(target.on(name),undefined,name)
  assert.equal(target.on('mousemove.other'),other)
  assert.ok(f.log.indexOf('mousemove') < f.log.indexOf('dragstart'))
  assert.ok(f.log.indexOf('mouseup') < f.log.indexOf('selectstart'))
  const writes = f.cameraWrites(), camera = f.canvas.__zoom, late = f.mouse('mousemove',200,140)
  f.view.dispatchEvent(late)
  assert.equal(late.defaultPrevented,false)
  assert.equal(f.cameraWrites(),writes)
  assert.equal(f.canvas.__zoom,camera)
})
test('actual D3 normal pan end clears ownership and cancellation does not restore twice', () => {
  const f = controlledPan()
  f.canvas.dispatchEvent(f.mouse('mousedown'))
  f.view.dispatchEvent(f.mouse('mouseup'))
  assert.equal(f.gesture(),null)
  const count = f.log.length
  f.dispose()
  assert.equal(f.log.length,count)
})
test('pan cancellation does not sweep a replaced owner or nonmouse transform', () => {
  const f = controlledPan(), target = select(f.view), replacement = () => {}
  f.canvas.dispatchEvent(f.mouse('mousedown'))
  const own = f.gesture()
  for (const type of ['wheel','touchstart']) {
    f.behavior.on('start.owner')({sourceEvent:{type,view:f.view}})
    f.behavior.on('end.owner')({sourceEvent:{type,view:f.view}})
    assert.equal(f.gesture(),own)
  }
  target.on('mousemove.zoom',replacement)
  const count = f.log.length
  f.dispose()
  assert.equal(f.log.length,count)
  assert.equal(target.on('mousemove.zoom'),replacement)
  assert.ok(target.on('selectstart.drag'))
  // Release the controlled fixture through D3's real mouseup path.
  f.view.dispatchEvent(f.mouse('mouseup'))
  const nonmouse = controlledPan()
  assert.equal(capturePanGesture(nonmouse.view),null)
  nonmouse.selection.call(nonmouse.behavior.transform,zoomIdentity.scale(1.2))
  for (const type of ['wheel','touchstart']) {
    const start = nonmouse.behavior.on('start.owner'), end = nonmouse.behavior.on('end.owner')
    start({sourceEvent:{type,view:nonmouse.view}})
    end({sourceEvent:{type,view:nonmouse.view}})
    assert.equal(nonmouse.gesture(),null)
  }
  const removals = nonmouse.log.length
  nonmouse.dispose()
  assert.equal(nonmouse.log.length,removals)
})
