import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { PetAppearance } from './petAppearance'
import type { PetMood } from './petBehavior'
import type { Pet3DScene } from './Pet3DScene'

export function Pet3DView({ appearance, mood, animate, modelUrl, original, fallback, onError, onLoaded }: {
  appearance: PetAppearance; mood: PetMood; animate: boolean; modelUrl: string; original: boolean
  fallback: ReactNode; onError?(message: string): void; onLoaded?(): void
}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const scene = useRef<Pet3DScene | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const latest = useRef({ appearance, mood, animate })
  latest.current = { appearance, mood, animate }

  useEffect(() => {
    const element = canvas.current!
    let cancelled = false
    let unusable = false
    let observer: ResizeObserver | null = null
    const fail = (error: unknown) => {
      if (cancelled) return
      setFailed(true)
      onError?.(error instanceof Error ? error.message : '无法加载三维模型')
    }
    const contextLost = (event: Event) => {
      event.preventDefault()
      unusable = true
      observer?.disconnect()
      observer = null
      scene.current?.dispose()
      scene.current = null
      fail(new Error('三维画布不可用'))
    }
    element.addEventListener('webglcontextlost', contextLost)
    void import('./Pet3DScene').then(({ createPet3DScene }) => {
      if (cancelled || unusable) return null
      return createPet3DScene(element, modelUrl, original)
    }).then(next => {
      if (!next) return
      if (cancelled || unusable) { next.dispose(); return }
      scene.current = next
      next.setAppearance(latest.current.appearance)
      next.setMood(latest.current.mood)
      observer = new ResizeObserver(() => {
        const bounds = element.getBoundingClientRect()
        next.resize(bounds.width, bounds.height)
      })
      observer.observe(element)
      const bounds = element.getBoundingClientRect()
      next.resize(bounds.width, bounds.height)
      next.setAnimate(latest.current.animate)
      setReady(true)
      onLoaded?.()
    }).catch(fail)
    return () => {
      cancelled = true
      observer?.disconnect()
      element.removeEventListener('webglcontextlost', contextLost)
      scene.current?.dispose()
      scene.current = null
    }
  }, [modelUrl, original])

  useEffect(() => { scene.current?.setAppearance(appearance) }, [appearance])
  useEffect(() => { scene.current?.setMood(mood) }, [mood])
  useEffect(() => { scene.current?.setAnimate(animate) }, [animate])

  return <span className="pet-3d-view" data-ready={ready && !failed}>
    <canvas ref={canvas} className="pet-3d-canvas" aria-hidden="true"/>
    {(!ready || failed) && <span className="pet-3d-fallback">{fallback}</span>}
  </span>
}
