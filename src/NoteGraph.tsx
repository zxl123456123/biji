import { useEffect, useMemo, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'
import { forceSimulation, forceLink, forceManyBody, forceCollide, forceX, forceY } from 'd3-force'
import type { SimulationNodeDatum, SimulationLinkDatum } from 'd3-force'
import { select, pointer } from 'd3-selection'
import { drag } from 'd3-drag'
import type { D3DragEvent } from 'd3-drag'
import { zoom, zoomIdentity } from 'd3-zoom'
import type { ZoomTransform } from 'd3-zoom'
import { Plus, Pause, Play, Maximize, Minus, LocateFixed } from 'lucide-react'
import type { Note } from './types'
import type { PetAppearance } from './petAppearance'
import type { GraphModel } from './noteGraphModel'
import type { GraphState } from './useNoteGraph'
import { projectGraph } from './noteGraphModel'
import { projectGraphView } from './graphView'
import type { GraphScope, GraphEvidence } from './graphView'
import './graphView.css'
import { plainNoteText } from './noteText'
import { renderMarkdown } from './noteFormat'
import { tagsFor, withoutTags } from './recordTools'
import { NoteFilters } from './NoteFilters'
import type { NoteFiltersProps } from './NoteFilters'
import { simulationCopies, groupColor, palette, captureMouseGesture, cancelOwnedMouseGesture, capturePanGesture, cancelOwnedPanGesture, moveDraggedNode, centeredCamera } from './graphGeometry'
import { createGraphLocator } from './graphFocus'
import type { LocateRequest, LocateResult, LocateOutcome } from './graphFocus'
import type { GraphSession, OwnedMouseGesture } from './graphGeometry'

type SimNode = SimulationNodeDatum & { id: string; group: string; x: number; y: number; anchorX: number; anchorY: number }
type SimLink = SimulationLinkDatum<SimNode> & { sharedTags: string[]; similarity?: number }
type Subject = { node: SimNode; x: number; y: number }
type Controls = { zoom: (factor: number) => void; fit: () => void; refresh: () => void; select: () => void; locate: (id: string) => LocateOutcome; retryLocate: () => void }
type Props = {
  notes: Note[]; graph: GraphState & { retry: () => void }; session: MutableRefObject<GraphSession>
  theme: 'light' | 'dark'; animate: boolean; visible: boolean; enabled: boolean; appearance: PetAppearance
  onMotion: () => void; onCreate: () => void; onEdit: (id: string) => void; onDelete: (id: string) => void
  filters: NoteFiltersProps
  locateRequest: LocateRequest | null; onLocateResult: (result: LocateResult) => void; onLocate: (id: string) => void
}

export default function NoteGraph(props: Props) {
  const { notes, graph, session } = props
  const [selectedId, setSelectedId] = useState('')
  const [scope, setScope] = useState<GraphScope>('all')
  const [evidence, setEvidence] = useState<GraphEvidence>('all')
  const projected = useMemo(() => projectGraph(graph.model, notes.map(note => note.id)), [graph.model, notes])
  const selectedRecord = notes.find(note => note.id === selectedId)
  // A new request enters the projection before the old local center can hide it.
  const effectiveCenter = props.locateRequest?.id ?? selectedRecord?.id ?? ''
  const effectiveScope = !effectiveCenter ? 'all' : props.locateRequest?.local ? 'one-hop' : scope
  const shown = useMemo(() => projectGraphView(projected, { scope: effectiveScope, evidence, centerId: effectiveCenter }), [projected, effectiveScope, evidence, effectiveCenter])
  const canvasRef = useRef<HTMLCanvasElement>(null), controls = useRef<Controls | null>(null)
  const latest = useRef({ ...props, shown, selectedId })
  latest.current = { ...props, shown, selectedId }
  useEffect(() => { if (selectedId && !selectedRecord) setSelectedId('') }, [selectedId, selectedRecord])
  useEffect(() => { if (props.locateRequest?.local) setScope('one-hop') }, [props.locateRequest?.token])

  useEffect(() => {
    const canvas = canvasRef.current!
    const context = canvas.getContext('2d')
    if (!context) return
    let disposed = false, frame = 0, lastTime = 0, phase = 0, width = 0, height = 0, dpr = 1
    let gesture: OwnedMouseGesture | null = null
    let panGesture: OwnedMouseGesture | null = null
    let camera: ZoomTransform = session.current.camera
      ? zoomIdentity.translate(session.current.camera.x, session.current.camera.y).scale(session.current.camera.k) : zoomIdentity
    let nodes: SimNode[] = [], links: SimLink[] = []
    const simulation = forceSimulation<SimNode>([]).stop()
    const sprites = new Map<string, HTMLCanvasElement>()
    for (const color of palette) {
      const sprite = document.createElement('canvas')
      sprite.width = sprite.height = 64
      const ctx = sprite.getContext('2d')!
      const gradient = ctx.createRadialGradient(32, 32, 2, 32, 32, 32)
      gradient.addColorStop(0, `${color}bb`)
      gradient.addColorStop(.35, `${color}55`)
      gradient.addColorStop(1, `${color}00`)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 64, 64)
      sprites.set(color, sprite)
    }
    const cache = () => {
      nodes.forEach(node => session.current.positions.set(node.id, { x: node.x, y: node.y }))
      session.current.camera = { k: camera.k, x: camera.x, y: camera.y }
    }
    const canAnimate = () => !disposed && latest.current.animate && latest.current.visible
    const neighborIds = () => {
      const ids = new Set<string>([latest.current.selectedId])
      for (const link of links) {
        const a = link.source as SimNode, b = link.target as SimNode
        if (a.id === latest.current.selectedId) ids.add(b.id)
        if (b.id === latest.current.selectedId) ids.add(a.id)
      }
      return ids
    }
    function drawOnce() {
      if (disposed || !latest.current.visible || !width || !height) return
      context!.setTransform(dpr, 0, 0, dpr, 0, 0)
      context!.clearRect(0, 0, width, height)
      const related = neighborIds(), hasSelection = !!latest.current.selectedId
      context!.save()
      context!.translate(camera.x, camera.y)
      context!.scale(camera.k, camera.k)
      // Batch the base edges by evidence and highlight state.
      for (const factual of [true, false]) {
        for (const highlighted of [false, true]) {
          context!.beginPath()
          for (const link of links) {
            const a = link.source as SimNode, b = link.target as SimNode
            const active = hasSelection && (a.id === latest.current.selectedId || b.id === latest.current.selectedId)
            if (Boolean(link.sharedTags.length) !== factual || active !== highlighted) continue
            context!.moveTo(a.x, a.y)
            context!.lineTo(b.x, b.y)
          }
          context!.setLineDash(factual ? [] : [5 / camera.k, 5 / camera.k])
          context!.strokeStyle = highlighted ? '#a579ed' : latest.current.theme === 'dark' ? '#788fc25f' : '#887db36c'
          context!.lineWidth = (highlighted ? 2 : 1) / camera.k
          context!.stroke()
        }
      }
      context!.setLineDash([])
      if (canAnimate()) {
        const stride = nodes.length >= 500 ? Math.max(1, Math.ceil(links.length / 128)) : 1
        links.forEach((link, index) => {
          if (index % stride) return
          const a = link.source as SimNode, b = link.target as SimNode
          const t = (phase * .16 + index * .173) % 1
          context!.fillStyle = groupColor(a.group)
          context!.beginPath()
          context!.arc(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, 2 / camera.k, 0, Math.PI * 2)
          context!.fill()
        })
      }
      nodes.forEach((node, index) => {
        const active = node.id === latest.current.selectedId, near = related.has(node.id)
        const color = groupColor(node.group)
        const breath = canAnimate() ? 1 + .12 * Math.sin(phase * 2 + index * .7) : 1
        context!.globalAlpha = hasSelection && !near ? .4 : 1
        const radius = active ? 10 : 6
        if (nodes.length < 500 || near) {
          const size = (active ? 68 : 44) * breath
          context!.drawImage(sprites.get(color)!, node.x - size / 2, node.y - size / 2, size, size)
        }
        context!.fillStyle = color
        context!.beginPath()
        context!.arc(node.x, node.y, radius * breath, 0, Math.PI * 2)
        context!.fill()
        if (active) {
          context!.strokeStyle = latest.current.theme === 'dark' ? '#fff' : '#493275'
          context!.lineWidth = 2 / camera.k
          context!.stroke()
        }
        if (near || (nodes.length <= 80 && camera.k >= .55)) {
          context!.font = `${12 / camera.k}px sans-serif`
          context!.fillStyle = latest.current.theme === 'dark' ? '#eff0ff' : '#333c60'
          const note = latest.current.notes.find(item => item.id === node.id)
          context!.fillText(Array.from(plainNoteText(note?.content ?? '') || '仅标签记录').slice(0, 16).join(''), node.x + 11, node.y + 4)
        }
      })
      context!.restore()
      context!.globalAlpha = 1
      cache()
    }
    function tick(time: number) {
      frame = 0
      if (!canAnimate()) return
      if (!lastTime || time - lastTime >= 1000 / 30) {
        phase += Math.min(lastTime ? time - lastTime : 0, 50) / 1000
        lastTime = time
        if (simulation.alpha() > simulation.alphaMin()) simulation.tick()
        drawOnce()
      }
      frame = requestAnimationFrame(tick)
    }
    function syncMotion() {
      cancelAnimationFrame(frame)
      frame = 0
      simulation.stop()
      lastTime = 0
      drawOnce()
      if (canAnimate()) frame = requestAnimationFrame(tick)
    }
    const hit = (point: [number, number]) => {
      const [x, y] = camera.invert(point), radius = Math.max(10 / camera.k, 9)
      return nodes.find(node => Math.hypot(node.x - x, node.y - y) <= radius)
    }
    const localPoint = (event: MouseEvent | TouchEvent) => pointer(event, canvas) as [number, number]
    const selection = select(canvas)
    const zoomBehavior = zoom<HTMLCanvasElement, unknown>().scaleExtent([.2, 4])
      .extent(() => [[0, 0], [width, height]])
      .filter(event => {
        if (disposed || event.button) return false
        if (event.type === 'wheel') return true
        if (event.touches?.length > 1) return true
        return !hit(localPoint(event.touches?.[0] ?? event))
      })
      .on('zoom.camera', event => { if (!disposed) { camera = event.transform; drawOnce(); cache() } })
      .on('start.owner', event => {
        if (!disposed && event.sourceEvent?.type === 'mousedown' && event.sourceEvent.view) {
          panGesture = capturePanGesture(event.sourceEvent.view)
        }
      })
      .on('end.owner', event => {
        if (event.sourceEvent?.type === 'mouseup') panGesture = null
      })
    selection.call(zoomBehavior).on('dblclick.zoom', null)
    const nodeDrag = drag<HTMLCanvasElement, unknown, Subject | undefined>().container(canvas).clickDistance(4)
      .filter(event => !disposed && !event.button && (!event.touches || event.touches.length === 1))
      .subject(event => {
        const node = hit([event.x, event.y])
        return node ? { node, x: camera.applyX(node.x), y: camera.applyY(node.y) } : undefined
      })
      .on('start.owner', event => {
        if (disposed || !event.subject) return
        if (event.sourceEvent.type === 'mousedown' && event.sourceEvent.view) gesture = captureMouseGesture(event.sourceEvent.view)
        const node = event.subject.node
        node.fx = node.x
        node.fy = node.y
      })
      .on('drag.move', (event: D3DragEvent<HTMLCanvasElement, unknown, Subject | undefined>) => {
        if (disposed || !event.subject) return
        const node = event.subject.node
        moveDraggedNode(node, [event.x, event.y], point => camera.invert(point), disposed)
        drawOnce()
      })
      .on('end.owner', event => {
        if (event.sourceEvent.type === 'mouseup') gesture = null
        if (disposed || !event.subject) return
        if (event.subject.node.id !== latest.current.selectedId) {
          event.subject.node.fx = null
          event.subject.node.fy = null
        }
        cache()
        drawOnce()
      })
    selection.call(nodeDrag)
    function locate(id: string): LocateOutcome {
      if (disposed || !width || !height) return 'waiting'
      const node = nodes.find(item => item.id === id)
      if (!node) return 'missing'
      cancelOwnedMouseGesture(gesture); gesture = null
      cancelOwnedPanGesture(panGesture); panGesture = null
      setSelectedId(node.id)
      const centered = centeredCamera(node, width, height, camera.k)
      selection.call(zoomBehavior.transform, zoomIdentity.translate(centered.x, centered.y).scale(centered.k))
      session.current.fitted = true; cache()
      return 'located'
    }
    const locator = createGraphLocator({
      latest: () => ({ request: latest.current.locateRequest, status: latest.current.graph.status, finish: latest.current.onLocateResult }),
      locate,
    })
    const click = (event: MouseEvent) => {
      if (disposed || event.defaultPrevented) return
      setSelectedId(hit(localPoint(event))?.id ?? '')
    }
    canvas.addEventListener('click', click)
    function fit() {
      if (!nodes.length || !width || !height) return
      const xs = nodes.map(node => node.x), ys = nodes.map(node => node.y)
      const minX = Math.min(...xs) - 40, maxX = Math.max(...xs) + 40
      const minY = Math.min(...ys) - 40, maxY = Math.max(...ys) + 40
      const k = Math.max(.2, Math.min(2, width / (maxX - minX), height / (maxY - minY)) * .85)
      selection.call(zoomBehavior.transform, zoomIdentity.translate(width / 2 - (minX + maxX) / 2 * k, height / 2 - (minY + maxY) / 2 * k).scale(k))
      session.current.fitted = true
    }
    function reconcileGraph() {
      cache()
      simulation.stop()
      const copied = simulationCopies(latest.current.shown, session.current.positions)
      nodes = copied.nodes
      links = copied.links
      simulation.nodes(nodes)
      simulation.force('links', forceLink<SimNode, SimLink>(links).id(node => node.id).distance(100).strength(.12))
        .force('charge', forceManyBody().strength(-85))
        .force('collision', forceCollide(18))
        .force('x', forceX<SimNode>(node => node.anchorX).strength(.025))
        .force('y', forceY<SimNode>(node => node.anchorY).strength(.025))
      simulation.alpha(latest.current.graph.status === 'ready' && canAnimate() ? .3 : 0)
      freezeSelected()
      if (!session.current.fitted && width && nodes.length) fit()
      syncMotion()
      locator.retry()
    }
    function freezeSelected() {
      nodes.forEach(node => {
        node.fx = node.id === latest.current.selectedId ? node.x : null
        node.fy = node.id === latest.current.selectedId ? node.y : null
      })
      drawOnce()
    }
    const observer = new ResizeObserver(entries => {
      const rect = entries[0].contentRect
      width = rect.width
      height = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(2_500_000 / Math.max(1, width * height)))
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      if (!session.current.fitted && nodes.length) fit()
      drawOnce()
      locator.retry()
    })
    observer.observe(canvas)
    selection.call(zoomBehavior.transform, camera)
    controls.current = {
      zoom: factor => selection.call(zoomBehavior.scaleBy, factor), fit,
      refresh: reconcileGraph, select: freezeSelected, locate, retryLocate: locator.retry,
    }
    reconcileGraph()
    // Keep the running predicate outside React's render loop.
    const motionChange = () => syncMotion()
    canvas.addEventListener('graph-motion', motionChange)
    return () => {
      disposed = true
      locator.dispose()
      cancelOwnedPanGesture(panGesture)
      panGesture = null
      cancelOwnedMouseGesture(gesture)
      gesture = null
      cancelAnimationFrame(frame)
      simulation.stop()
      observer.disconnect()
      selection.on('.zoom', null).on('.drag', null)
      canvas.removeEventListener('click', click)
      canvas.removeEventListener('graph-motion', motionChange)
      cache()
      controls.current = null
    }
  }, [session])
  useEffect(() => { controls.current?.refresh() }, [shown])
  useEffect(() => { controls.current?.retryLocate() }, [graph.status, props.locateRequest?.token])
  useEffect(() => { controls.current?.select() }, [selectedId])
  useEffect(() => { canvasRef.current?.dispatchEvent(new Event('graph-motion')) }, [props.animate, props.visible, props.theme])

  const relations = shown.edges.filter(edge => edge.source === selectedId || edge.target === selectedId)
  const selectedNode = shown.nodes.find(node => node.id === selectedId)
  const selected = selectedNode ? selectedRecord : undefined
  const hasCenter = projected.nodes.some(node => node.id === effectiveCenter)
  const groupLabel = (group: string) => group.startsWith('tag:') ? `标签 · ${group.slice(4)}` : group.startsWith('text:') ? '正文关联组（词面推断）' : group === 'pending' ? '关联待更新' : '独立记录'
  return <div className="content graph-content graph-view-content">
    <div className="heading"><div><p className="eyebrow">围绕一条记录，读懂关联依据</p><h1>关联图</h1><p className="subtle">全图浏览匹配记录，选择一条后查看一层或两层关系。</p></div><button className="soft-button accent" onClick={props.onCreate}><Plus size={17}/>新建记录</button></div>
    <NoteFilters {...props.filters}/>
    <div className="graph-view-controls">
      <div role="group" aria-label="关系范围" className="graph-view-control-group"><span className="graph-view-control-label">关系范围</span><div className="graph-view-control-options">
        <button aria-pressed={effectiveScope === 'all'} onClick={()=>setScope('all')}>全图</button>
        <button aria-pressed={effectiveScope === 'one-hop'} disabled={!hasCenter} onClick={()=>setScope('one-hop')}>当前一层</button>
        <button aria-pressed={effectiveScope === 'two-hop'} disabled={!hasCenter} onClick={()=>setScope('two-hop')}>当前两层</button>
      </div></div>
      <div role="group" aria-label="关联依据" className="graph-view-control-group"><span className="graph-view-control-label">关联依据</span><div className="graph-view-control-options">
        <button aria-pressed={evidence === 'all'} onClick={()=>setEvidence('all')}>全部依据</button>
        <button aria-pressed={evidence === 'tags'} onClick={()=>setEvidence('tags')}>共同标签</button>
        <button aria-pressed={evidence === 'text'} onClick={()=>setEvidence('text')}>正文词面</button>
      </div></div>
    </div>
    <p className="graph-view-summary" aria-live="polite">当前范围 {shown.nodes.length} 条记录 · {shown.edges.length} 条关联 · 匹配总数 {projected.nodes.length} 条</p>
    <p className="graph-view-hint">{!effectiveCenter ? '先选择一条记录，便可围绕它查看局部关系。' : !hasCenter ? '定位目标已不在当前匹配记录中，等待定位结果。' : effectiveScope === 'two-hop' ? '当前筛选与依据中的两层关系；选择邻居会以它为新的中心。' : effectiveScope === 'one-hop' ? '当前筛选与依据中的一层关系；选择邻居会以它为新的中心。' : '全图保留全部匹配记录，孤立记录也有自己的位置。'}</p>
    <div className="graph-toolbar"><div className="graph-legend"><span><i/>共同标签</span><span><i className="inferred"/>正文相近 · 自动推断</span></div><div className="graph-tools">
      <button aria-pressed={!props.enabled} onClick={props.onMotion}>{props.enabled ? <Pause size={16}/> : <Play size={16}/>} {props.enabled ? '暂停动态' : '开启动态'}</button>
      <button aria-label="放大关联图" onClick={()=>controls.current?.zoom(1.3)}><Plus size={17}/></button><button aria-label="缩小关联图" onClick={()=>controls.current?.zoom(1/1.3)}><Minus size={17}/></button><button onClick={()=>controls.current?.fit()}><Maximize size={16}/>适配当前范围</button>
    </div></div>
    {graph.status === 'updating' && <p role="status" className="graph-status">正在更新本地关联…记录节点仍可选择。</p>}
    {graph.status === 'error' && <p role="status" className="graph-status">正文分析暂不可用，记录节点和标签筛选仍可使用。当前关联暂不可用。<button onClick={graph.retry}>重试</button></p>}
    <div className="graph-layout"><div className="graph-stage"><canvas ref={canvasRef} aria-label="记录关联画布，请使用旁边的文字选择查看和编辑记录"/>{!notes.length && <div className="graph-empty">没有匹配的记录<br/><button onClick={props.onCreate}>记下第一束微光</button></div>}</div>
      <aside className="graph-detail"><label>选择记录 · 全部匹配<select aria-label="选择图中记录" value={selectedId} onChange={event=>setSelectedId(event.target.value)}><option value="">选择一个记录节点</option>{notes.map(note=><option key={note.id} value={note.id}>{Array.from(plainNoteText(note.content) || '仅标签记录').slice(0,45).join('')}</option>)}</select></label>
        {selected ? <><p className="group-label" style={{color:groupColor(selectedNode?.group ?? 'pending')}}>{groupLabel(selectedNode?.group ?? 'pending')}</p><div className="graph-note markdown-preview">{renderMarkdown(withoutTags(selected.content) || '仅标签记录', props.appearance)}</div><div className="graph-tags">{tagsFor(selected.content).map((tag,index)=><span key={`${tag}-${index}`}># {tag}</span>)}</div><div className="graph-detail-actions"><button className="soft-button accent" onClick={()=>props.onEdit(selected.id)}>编辑记录</button><button className="soft-button" onClick={()=>props.onLocate(selected.id)}><LocateFixed size={15}/>定位此记录</button><button className="soft-button" onClick={()=>props.onDelete(selected.id)}>移至回收站</button></div><h2>关联依据</h2>{relations.length ? <ul className="relation-list">{relations.map(edge=>{
          const other = edge.source === selectedId ? edge.target : edge.source
          const note = notes.find(item=>item.id===other)
          return <li key={other}><button onClick={()=>setSelectedId(other)}>{Array.from(plainNoteText(note?.content ?? '') || '仅标签记录').slice(0,30).join('')}</button>{edge.sharedTags.length>0 && <p>共同标签：{edge.sharedTags.join('、')}</p>}{edge.similarity!==undefined && <p>正文相近：{Math.round(edge.similarity*100)}%（词面推断）</p>}</li>
        })}</ul> : <p className="subtle">暂无显示的关联，独立记录仍有自己的位置。</p>}</> : <div className="graph-intro"><span>✦</span><h2>每条记录，一束微光</h2><p>点击节点或从上方选择记录，查看正文、分组与关联依据。</p><p>拖动节点整理位置，滚轮缩放，拖动画布移动视野。</p></div>}
        <p className="graph-disclaimer">显示部分关联。共同标签是事实；正文相近是本地词面推断，仅供参考，不代表语义相同。分组依据为主标签或正文关联组。</p>
      </aside></div>
  </div>
}
