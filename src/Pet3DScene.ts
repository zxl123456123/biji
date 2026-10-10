import type { AnimationAction, Material, Mesh, Object3D, Texture } from 'three'
import type { PetAppearance } from './petAppearance'
import type { PetMood } from './petBehavior'

export type Pet3DScene = {
  decorations: readonly PetDecoration[]
  setAppearance(appearance: PetAppearance): void
  setMood(mood: PetMood, activity?: PetActivity): void
  setAnimate(animate: boolean): void
  resize(width: number, height: number): void
  dispose(): void
}

export type PetActivity = 'walk' | 'look'
export type PetDecoration = 'Beret' | 'Halo' | 'Scarf' | 'Bow'
const decorationNames: PetDecoration[] = ['Beret', 'Halo', 'Scarf', 'Bow']

const palette = {
  cloud: { body: '#e9e1ff', ears: '#c6b3fc', leaves: '#9ee2cf', cloth: '#d2c0fa' },
  mint: { body: '#d9f5df', ears: '#a9dbc1', leaves: '#9ee7de', cloth: '#b8eadc' },
  peach: { body: '#fce0d6', ears: '#edb4bf', leaves: '#f9cfad', cloth: '#ffd4bd' },
} as const

export async function createPet3DScene(canvas: HTMLCanvasElement, modelUrl: string, original: boolean): Promise<Pet3DScene> {
  const THREE = await import('three')
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js')
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1.7, 1.7, 1.55, -1.55, 0.1, 100)
  scene.add(new THREE.HemisphereLight('#ffffff', '#bdafd9', 2.3))
  const key = new THREE.DirectionalLight('#ffffff', 2.1)
  key.position.set(-3, 4, 5)
  scene.add(key)
  const fill = new THREE.DirectionalLight('#a9e5ee', 0.7)
  fill.position.set(3, 1, -2)
  scene.add(fill)

  let root: Object3D | null = null
  let disposed = false
  let animated = false
  let animationRequested = false
  let mood: PetMood = 'idle'
  let frame = 0
  let lastTime = 0
  let action: AnimationAction | null = null
  let mixer: InstanceType<typeof THREE.AnimationMixer> | null = null
  let viewExtent = 1.55
  let decorations: PetDecoration[] = []
  const gltf = await new GLTFLoader().loadAsync(modelUrl).catch(error => {
    renderer.dispose()
    throw error
  })

  const paint = (name: string, color: string) => {
    root?.getObjectByName(name)?.traverse(object => {
      const mesh = object as Mesh
      if (!mesh.isMesh) return
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const material of materials) {
        if ('color' in material && material.color instanceof THREE.Color) material.color.set(color)
      }
    })
  }
  const show = (name: string, visible: boolean) => {
    const object = root?.getObjectByName(name)
    if (!object) return
    object.scale.setScalar(visible ? 1 : 0)
    object.visible = visible
  }
  const render = () => { if (!disposed) renderer.render(scene, camera) }
  const tick = (time: number) => {
    if (!animated || disposed) return
    if (time - lastTime >= 1000 / 30) {
      mixer?.update(Math.min((time - lastTime) / 1000, 0.1))
      lastTime = time
      render()
    }
    frame = requestAnimationFrame(tick)
  }
  const setAnimate = (next: boolean) => {
    animationRequested = next
    animated = next && mood !== 'resting'
    cancelAnimationFrame(frame)
    if (animated && !disposed) {
      lastTime = performance.now()
      frame = requestAnimationFrame(tick)
    } else {
      mixer?.setTime(0)
      render()
    }
  }
  const setMood = (next: PetMood, activity?: PetActivity) => {
    mood = next
    const preferred = mood === 'resting' ? 'rest' : mood === 'happy' ? 'happy' : activity ?? 'idle'
    const clip = gltf.animations.find(item => item.name === preferred) ?? gltf.animations.find(item => item.name === 'idle')!
    const nextAction = mixer!.clipAction(clip)
    if (action !== nextAction) {
      action?.stop()
      nextAction.reset().play()
      action = nextAction
    }
    setAnimate(animationRequested)
  }
  const setAppearance = (appearance: PetAppearance) => {
    const colors = palette[appearance.palette]
    if (original) {
      paint('Body', colors.body)
      for (const name of ['EarLeft', 'EarRight']) paint(name, colors.ears)
      for (const name of ['LeafLeft', 'LeafRight']) paint(name, colors.leaves)
    }
    for (const name of decorations) paint(name, colors.cloth)
    show('Beret', appearance.head === 'beret')
    show('Halo', appearance.head === 'halo')
    show('Scarf', appearance.accessory === 'scarf')
    show('Bow', appearance.accessory === 'bow')
    render()
  }
  const resize = (width: number, height: number) => {
    if (disposed || width <= 0 || height <= 0) return
    renderer.setSize(width, height, false)
    const aspect = width / height
    const halfHeight = viewExtent
    camera.left = -halfHeight * aspect
    camera.right = halfHeight * aspect
    camera.top = halfHeight
    camera.bottom = -halfHeight
    camera.updateProjectionMatrix()
    render()
  }
  const dispose = () => {
    if (disposed) return
    disposed = true
    cancelAnimationFrame(frame)
    mixer?.stopAllAction()
    if (root) mixer?.uncacheRoot(root)
    ;(root ?? gltf.scene).traverse(object => {
      const mesh = object as Mesh
      if (!mesh.isMesh) return
      mesh.geometry.dispose()
      for (const material of (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as Material[]) {
        for (const value of Object.values(material)) if (value && typeof value === 'object' && 'isTexture' in value) (value as Texture).dispose()
        material.dispose()
      }
    })
    renderer.dispose()
  }
  try {
    root = gltf.scene.getObjectByName('PetRoot') ?? null
    if (!root) throw new Error('模型缺少角色根节点')
    if (!['idle', 'happy'].every(name => gltf.animations.some(clip => clip.name === name))) throw new Error('模型缺少 idle/happy 动作')
    if (original && !['Body', 'EarLeft', 'EarRight', 'LeafLeft', 'LeafRight', 'Beret', 'Halo', 'Scarf', 'Bow'].every(name => root?.getObjectByName(name))) throw new Error('晴小团模型缺少装扮节点')
    decorations = decorationNames.filter(name => root?.getObjectByName(name))
    const sourceMaterials = new Set<Material>()
    root.traverse(object => {
      const mesh = object as Mesh
      if (mesh.isMesh) {
        const sources = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        sources.forEach(material => sourceMaterials.add(material))
        mesh.material = Array.isArray(mesh.material) ? sources.map(material => material.clone()) : sources[0].clone()
      }
    })
    sourceMaterials.forEach(material => material.dispose())
    scene.add(root)
    for (const name of decorations) root.getObjectByName(name)?.scale.setScalar(1)
    const box = new THREE.Box3().setFromObject(root)
    if (box.isEmpty()) throw new Error('模型没有可显示的网格')
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    camera.position.set(center.x, center.y + size.y * 0.05, center.z + Math.max(size.z, size.y) * 3)
    camera.lookAt(center.x, center.y + size.y * 0.05, center.z)
    viewExtent = Math.max(size.y / 2, size.x / 2, 0.5) * 1.24
    camera.top = viewExtent; camera.bottom = -viewExtent; camera.left = -viewExtent; camera.right = viewExtent
    camera.updateProjectionMatrix()
    mixer = new THREE.AnimationMixer(root)
    setMood('idle')
    return { decorations, setAppearance, setMood, setAnimate, resize, dispose }
  } catch (error) {
    dispose()
    throw error
  }
}
