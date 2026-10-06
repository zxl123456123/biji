import * as THREE from 'three'
import type { CelestialWheelModel, WheelMonth } from './celestialWheelModel.ts'
import { createSpatialScheduler, spatialPixelRatio, spatialPolicy } from './spatialRuntime.ts'

type ReadyModel = Extract<CelestialWheelModel, { kind: 'ready' }>
export type WheelPolicy = { visible: boolean; focused: boolean; businessEnabled: boolean; motionAllowed: boolean; paused: boolean }
export type WheelScene = {
  setModel: (model: ReadyModel) => void; select: (key: string) => void
  setTheme: (theme: 'light' | 'dark') => void; setPolicy: (policy: WheelPolicy) => void
  setExpanded: (expanded: boolean) => void; dispose: () => void
}
export const wheelSlots = (month: WheelMonth) => month.days.map((day, index) => ({ key: day.key, angle: index * Math.PI * 2 / month.days.length }))
export const wheelLabelDayIndices = (dayCount: number) => [0, 0, 14, dayCount - 1] as const

export function createCelestialWheelScene(canvas: HTMLCanvasElement, options: {
  model: ReadyModel; selectedDate: string; theme: 'light' | 'dark'; policy: WheelPolicy
  onSelectDate: (key: string) => void; onFailure: (reason: string) => void
}): WheelScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' })
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 120)
  const geometry = new THREE.BoxGeometry(0.82, 0.09, 0.34)
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.94 })
  const trackGeometry = new THREE.TorusGeometry(1, 0.008, 4, 192)
  const trackMaterial = new THREE.MeshBasicMaterial({ color: 0x9c83dc, transparent: true, opacity: 0.38, depthWrite: false })
  const coreGeometry = new THREE.SphereGeometry(0.53, 24, 16)
  const coreMaterial = new THREE.MeshBasicMaterial({ color: 0xaa8ee6 })
  const core = new THREE.Mesh(coreGeometry, coreMaterial)
  scene.add(core)
  const haloGeometry = new THREE.RingGeometry(0.92, 0.96, 128)
  const haloMaterial = new THREE.MeshBasicMaterial({ color: 0x9c79ed, transparent: true, opacity: 0.20, side: THREE.DoubleSide, depthWrite: false })
  const halo = new THREE.Mesh(haloGeometry, haloMaterial)
  halo.rotation.x = -Math.PI / 2
  scene.add(halo)
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2(), matrix = new THREE.Matrix4(), labelRotation = new THREE.Quaternion()
  const rings: { group: THREE.Group; mesh: THREE.InstancedMesh; slots: ReturnType<typeof wheelSlots>; radius: number; month: number }[] = []
  let model = options.model, selected = options.selectedDate, theme = options.theme, policy = options.policy
  let disposed = false, expanded: boolean | null = null, pausedPose = 0, pose = 0, elapsed = 0, focus = 0
  let pointerStart: { x: number; y: number; id: number } | null = null
  const labels: THREE.Mesh[] = []
  const labelGeometries: THREE.PlaneGeometry[] = []
  const atlas = document.createElement('canvas')
  atlas.width = 512; atlas.height = 512
  const context = atlas.getContext('2d')
  if (!context) { renderer.dispose(); throw new Error('Cannot create wheel text atlas') }
  context.clearRect(0, 0, 512, 512)
  context.font = 'bold 28px sans-serif'; context.textAlign = 'center'; context.textBaseline = 'middle'
  for (let index = 0; index < 48; index++) {
    const month = Math.floor(index / 4) + 1, marker = index % 4
    const text = marker === 0 ? `${month}月` : marker === 1 ? '1' : marker === 2 ? '15' : '末'
    const x = (index % 8) * 64, y = Math.floor(index / 8) * 80
    context.fillStyle = marker === 0 ? '#432f73' : '#30264f'
    context.fillRect(x + 2, y + 12, 60, 54)
    context.fillStyle = '#fff'
    context.fillText(text, (index % 8) * 64 + 32, Math.floor(index / 8) * 80 + 40)
  }
  const texture = new THREE.CanvasTexture(atlas)
  texture.colorSpace = THREE.SRGBColorSpace
  const labelMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthTest: false, side: THREE.DoubleSide })
  function addLabels() {
    labels.forEach(label => label.parent?.remove(label))
    labelGeometries.forEach(geometry => geometry.dispose())
    labels.length = 0; labelGeometries.length = 0
    rings.forEach((ring, monthIndex) => {
      const indices = wheelLabelDayIndices(ring.slots.length)
      indices.forEach((dayIndex, marker) => {
        const labelIndex = monthIndex * 4 + marker
        const cellX = labelIndex % 8, cellY = Math.floor(labelIndex / 8)
        const geometry = new THREE.PlaneGeometry(marker === 0 ? 1.65 : 0.92, marker === 0 ? 0.88 : 0.55)
        const uv = geometry.getAttribute('uv')
        for (let vertex = 0; vertex < uv.count; vertex++) uv.setXY(vertex,
          (cellX + uv.getX(vertex)) * 64 / 512, 1 - (cellY + 1 - uv.getY(vertex)) * 80 / 512)
        uv.needsUpdate = true
        labelGeometries.push(geometry)
        const sprite = new THREE.Mesh(geometry, labelMaterial)
        const angle = marker === 0 ? monthIndex * Math.PI / 6 : ring.slots[dayIndex].angle
        const radius = marker === 0 ? ring.radius + 0.78 : ring.radius - 0.45
        sprite.position.set(Math.cos(angle) * radius, 0.35, Math.sin(angle) * radius)
        ring.group.add(sprite); labels.push(sprite)
      })
    })
  }
  function colors() {
    const dark = theme === 'dark'
    renderer.setClearColor(dark ? 0x0c1023 : 0xf7f4ff, 1)
    haloMaterial.color.set(dark ? 0xaa8cff : 0x7655c4)
    trackMaterial.color.set(dark ? 0xaa8cff : 0x7655c4)
    coreMaterial.color.set(dark ? 0xb89dff : 0x7c5bc8)
    for (const ring of rings) {
      ring.slots.forEach((slot, index) => {
        const day = model.daysByKey.get(slot.key)!
        const color = day.relatedIds.length ? new THREE.Color(dark ? 0xffd78d : 0xc8752f)
          : day.count ? new THREE.Color(dark ? 0xbba8ff : 0x7960c1)
          : new THREE.Color(dark ? 0x344064 : 0xc9c4da)
        if (slot.key === selected) color.set(dark ? 0xfff2b3 : 0x5630b3)
        ring.mesh.setColorAt(index, color)
      })
      if (ring.mesh.instanceColor) ring.mesh.instanceColor.needsUpdate = true
    }
  }
  function build(next: ReadyModel) {
    rings.forEach(ring => { scene.remove(ring.group); ring.mesh.dispose() })
    rings.length = 0
    model = next
    next.months.forEach((month, monthIndex) => {
      const group = new THREE.Group(), slots = wheelSlots(month), radius = 3.1 + monthIndex * 0.73
      const mesh = new THREE.InstancedMesh(geometry, material, slots.length)
      mesh.name = month.key
      slots.forEach((slot, index) => {
        const day = month.days[index]
        const scale = day.count ? 1 + Math.min(day.count, 5) * 0.10 : 0.72
        matrix.compose(new THREE.Vector3(Math.cos(slot.angle) * radius, 0, Math.sin(slot.angle) * radius),
          new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -slot.angle),
          new THREE.Vector3(scale, 1, scale))
        mesh.setMatrixAt(index, matrix)
      })
      mesh.instanceMatrix.needsUpdate = true
      const track = new THREE.Mesh(trackGeometry, trackMaterial)
      track.rotation.x = -Math.PI / 2; track.scale.setScalar(radius)
      group.add(track, mesh); scene.add(group)
      rings.push({ group, mesh, slots, radius, month: monthIndex })
    })
    addLabels(); colors(); scheduler.invalidate()
  }
  const resize = () => {
    if (disposed) return
    const width = Math.max(1, canvas.clientWidth), height = Math.max(1, canvas.clientHeight)
    renderer.setPixelRatio(spatialPixelRatio(width, height, window.devicePixelRatio))
    renderer.setSize(width, height, false)
    camera.aspect = width / height; camera.updateProjectionMatrix()
    scheduler.invalidate()
  }
  const scheduler = createSpatialScheduler({ request: callback => requestAnimationFrame(callback), cancel: frame => cancelAnimationFrame(frame),
    draw: (_time, dt) => {
      if (policy.motionAllowed && policy.visible && policy.focused && policy.businessEnabled && !policy.paused) elapsed += dt
      const cycle = elapsed % 22
      const target = expanded === null ? cycle < 3 ? 0 : cycle < 8 ? (cycle - 3) / 5 : cycle < 15 ? 1 : cycle < 20 ? 1 - (cycle - 15) / 5 : 0 : Number(expanded)
      if (policy.motionAllowed && (!policy.paused || expanded !== null)) pose += (target - pose) * Math.min(1, dt * 1.8)
      else pose = pausedPose
      const ease = pose * pose * (3 - 2 * pose)
      camera.position.set(0, 25 - ease * 11, 9 + ease * 15)
      camera.lookAt(0, 0, 0)
      rings.forEach((ring, index) => {
        const direction = index % 2 ? -1 : 1
        ring.group.rotation.y = elapsed * (0.03 + index * 0.003) * direction
        ring.group.rotation.x = ease * (index % 2 ? -0.24 : 0.24)
        ring.group.position.y = ease * Math.sin(index * 0.85) * 0.9
      })
      rings.forEach((ring, index) => {
        ring.group.getWorldQuaternion(labelRotation).invert().multiply(camera.quaternion)
        for (let marker = 0; marker < 4; marker++) labels[index * 4 + marker].quaternion.copy(labelRotation)
      })
      if (expanded !== null && Math.abs(target - pose) < 0.005 && policy.paused) scheduler.setContinuous(false)
      const selectedRing = rings.find(ring => ring.slots.some(slot => slot.key === selected))
      focus += ((selectedRing ? selectedRing.radius : 3) - focus) * Math.min(1, dt * 3)
      halo.scale.setScalar(focus || 3)
      haloMaterial.opacity = selectedRing ? 0.12 + 0.08 * Math.sin(elapsed * 2) : 0
      renderer.render(scene, camera)
    } })
  const sync = () => { const state = spatialPolicy(policy); scheduler.setActive(state.active); scheduler.setContinuous(state.continuous || (state.interactive && policy.motionAllowed && expanded !== null && Math.abs(Number(expanded) - pose) > 0.005)); scheduler.invalidate() }
  const pointerDown = (event: PointerEvent) => { if (spatialPolicy(policy).interactive) pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId } }
  const pointerUp = (event: PointerEvent) => {
    if (!pointerStart || pointerStart.id !== event.pointerId) return
    const start = pointerStart; pointerStart = null
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8 || !spatialPolicy(policy).interactive) return
    const rect = canvas.getBoundingClientRect()
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1)
    raycaster.setFromCamera(pointer, camera)
    scene.updateMatrixWorld(true)
    const hit = raycaster.intersectObjects(rings.map(ring => ring.mesh), false)[0]
    const ring = rings.find(ring => ring.mesh === hit?.object)
    const key = ring && hit?.instanceId !== undefined ? ring.slots[hit.instanceId]?.key : null
    if (key) options.onSelectDate(key)
  }
  const contextLost = (event: Event) => { event.preventDefault(); dispose(); options.onFailure('WebGL 上下文已丢失') }
  const pointerCancel = () => { pointerStart = null }
  const visibility = () => { policy = { ...policy, visible: !document.hidden }; sync() }
  const focusChange = () => { policy = { ...policy, focused: document.hasFocus() }; sync() }
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  canvas.addEventListener('pointerdown', pointerDown)
  canvas.addEventListener('pointerup', pointerUp)
  canvas.addEventListener('pointercancel', pointerCancel)
  canvas.addEventListener('webglcontextlost', contextLost)
  document.addEventListener('visibilitychange', visibility)
  window.addEventListener('focus', focusChange)
  window.addEventListener('blur', focusChange)
  function dispose() {
    if (disposed) return
    disposed = true; scheduler.dispose(); observer.disconnect(); pointerStart = null
    canvas.removeEventListener('pointerdown', pointerDown)
    canvas.removeEventListener('pointerup', pointerUp)
    canvas.removeEventListener('pointercancel', pointerCancel)
    canvas.removeEventListener('webglcontextlost', contextLost)
    document.removeEventListener('visibilitychange', visibility)
    window.removeEventListener('focus', focusChange)
    window.removeEventListener('blur', focusChange)
    rings.forEach(ring => ring.mesh.dispose())
    labelGeometries.forEach(geometry => geometry.dispose())
    texture.dispose(); labelMaterial.dispose(); geometry.dispose(); material.dispose(); trackGeometry.dispose(); trackMaterial.dispose(); coreGeometry.dispose(); coreMaterial.dispose(); haloGeometry.dispose(); haloMaterial.dispose(); renderer.dispose()
  }
  build(model); resize(); sync()
  return { setModel: next => { if (!disposed) {
      const sameSlots = next.year === model.year && next.months.every((month, index) => month.days.every((day, dayIndex) =>
        day.key === model.months[index].days[dayIndex]?.key && day.count === model.months[index].days[dayIndex]?.count))
      if (sameSlots) { model = next; colors(); scheduler.invalidate() } else build(next)
    } }, select: key => { if (!disposed) { selected = key; colors(); scheduler.invalidate() } },
    setTheme: next => { if (!disposed) { theme = next; colors(); scheduler.invalidate() } },
    setPolicy: next => { if (!disposed) { policy = next; pausedPose = pose; sync() } },
    setExpanded: next => { expanded = next; if (!policy.motionAllowed) { pose = Number(next); pausedPose = pose } sync() }, dispose }
}
