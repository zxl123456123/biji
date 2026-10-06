import { select } from 'd3-selection'
import { dragEnable } from 'd3-drag'
import type { GraphModel } from './noteGraphModel.ts'

export type Camera = { k: number; x: number; y: number }
export type Position = { x: number; y: number }
export type GraphSession = { positions: Map<string, Position>; camera: Camera | null; fitted: boolean }
export const palette = ['#8b5cf6', '#3979e6', '#16b9c5', '#e863a3', '#e8a145']
export function stableHash(value: string) {
  let hash = 2166136261
  for (const char of value) hash = Math.imul(hash ^ char.codePointAt(0)!, 16777619)
  return hash >>> 0
}
export const groupColor = (group: string) => palette[stableHash(group) % palette.length]
export const toScreen = (position: Position, camera: Camera): Position => ({ x: position.x * camera.k + camera.x, y: position.y * camera.k + camera.y })
export const toWorld = (position: Position, camera: Camera): Position => ({ x: (position.x - camera.x) / camera.k, y: (position.y - camera.y) / camera.k })
export function centeredCamera(position: Position, width: number, height: number, zoom: number): Camera {
  const k = Math.min(2, Math.max(.6, zoom))
  return { k, x: width / 2 - position.x * k, y: height / 2 - position.y * k }
}
export function moveDraggedNode(node: Position & { fx?: number | null; fy?: number | null }, point: [number, number], invert: (point: [number, number]) => [number, number], disposed: boolean) {
  if (disposed) return false
  const [x, y] = invert(point)
  node.x = node.fx = x
  node.y = node.fy = y
  return true
}
export function simulationCopies(model: GraphModel, positions: Map<string, Position>) {
  const groups = [...new Set(model.nodes.map(node => node.group))].sort()
  const side = Math.max(1, Math.ceil(Math.sqrt(groups.length)))
  const nodes = model.nodes.map((node, index) => {
    const groupIndex = groups.indexOf(node.group)
    const anchorX = (groupIndex % side) * 220, anchorY = Math.floor(groupIndex / side) * 220
    const hash = stableHash(node.id), angle = hash * .001, radius = 20 + Math.sqrt(index + 1) * 12
    const seed = positions.get(node.id) ?? { x: anchorX + Math.cos(angle) * radius, y: anchorY + Math.sin(angle) * radius }
    return { ...node, ...seed, anchorX, anchorY }
  })
  return { nodes, links: model.edges.map(edge => ({ ...edge, sharedTags: [...edge.sharedTags] })) }
}
export type OwnedMouseGesture = { view: Window; move: (this: Window, event: MouseEvent, datum: unknown) => void; up: (this: Window, event: MouseEvent, datum: unknown) => void; active: boolean }
export function captureMouseGesture(view: Window): OwnedMouseGesture | null {
  const target = select(view), move = target.on('mousemove.drag'), up = target.on('mouseup.drag')
  return move && up ? { view, move, up, active: true } : null
}
export function cancelOwnedMouseGesture(gesture: OwnedMouseGesture | null) {
  if (!gesture?.active) return
  const target = select(gesture.view)
  if (target.on('mousemove.drag') !== gesture.move || target.on('mouseup.drag') !== gesture.up) return
  target.on('mousemove.drag', null).on('mouseup.drag', null)
  dragEnable(gesture.view)
}
export function capturePanGesture(view: Window): OwnedMouseGesture | null {
  const target = select(view), move = target.on('mousemove.zoom'), up = target.on('mouseup.zoom')
  return move && up ? { view, move, up, active: true } : null
}
export function cancelOwnedPanGesture(gesture: OwnedMouseGesture | null) {
  if (!gesture?.active) return
  const target = select(gesture.view)
  if (target.on('mousemove.zoom') !== gesture.move || target.on('mouseup.zoom') !== gesture.up) return
  target.on('mousemove.zoom', null).on('mouseup.zoom', null)
  dragEnable(gesture.view)
}
