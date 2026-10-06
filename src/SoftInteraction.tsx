import { createContext, useCallback, useContext, useLayoutEffect, useRef } from 'react'
import { animate, domMax, LazyMotion, useDragControls, useMotionValue } from 'motion/react'
import type { HTMLMotionProps } from 'motion/react'
import * as m from 'motion/react-m'
import { cancelSoftMotion } from './softMotion'

const SoftPolicy = createContext(false)
const spring = { type: 'spring' as const, stiffness: 260, damping: 24, mass: .65 }

export function SoftInteraction({ allowed, children }: { allowed: boolean; children: React.ReactNode }) {
  return <LazyMotion features={domMax} strict><SoftPolicy value={allowed}>{children}</SoftPolicy></LazyMotion>
}

function useResetOnPolicy(allowed: boolean, reset: () => void) {
  useLayoutEffect(() => {
    if (!allowed) reset()
    window.addEventListener('blur', reset)
    return () => { window.removeEventListener('blur', reset); reset() }
  }, [allowed, reset])
}

export function SoftButton(props: HTMLMotionProps<'button'>) {
  const allowed = useContext(SoftPolicy) && !props.disabled
  const current = useRef(allowed); current.current = allowed
  const mounted = useRef(false)
  const scale = useMotionValue(1)
  const animations = useRef<ReturnType<typeof animate>[]>([])
  const reset = useCallback(() => cancelSoftMotion(() => {}, [[scale, 1]], animations.current), [scale])
  useResetOnPolicy(allowed, reset)
  useLayoutEffect(() => { mounted.current = true; return () => { mounted.current = false; reset() } }, [reset])
  const move = (target: number) => {
    if (!mounted.current || !current.current) { reset(); return }
    while (animations.current.length) animations.current.pop()!.stop()
    animations.current.push(animate(scale, target, spring))
  }
  return <m.button {...props} type={props.type ?? 'button'} style={{ ...props.style, scale }}
    onTapStart={() => move(.97)} onTap={() => move(1)} onTapCancel={reset}
    onPointerCancel={reset} onLostPointerCapture={reset}
    onBlur={event => { reset(); props.onBlur?.(event) }}/>
}

export function useSoftDrag(enabled: boolean) {
  const allowed = useContext(SoftPolicy) && enabled
  const current = useRef(allowed); current.current = allowed
  const mounted = useRef(false)
  const controls = useDragControls(), x = useMotionValue(0), y = useMotionValue(0)
  const animations = useRef<ReturnType<typeof animate>[]>([])
  const reset = useCallback(() => cancelSoftMotion(() => controls.cancel(), [[x, 0], [y, 0]], animations.current), [controls, x, y])
  useResetOnPolicy(allowed, reset)
  useLayoutEffect(() => { mounted.current = true; return () => { mounted.current = false; reset() } }, [reset])
  const release = (event: MouseEvent | TouchEvent | PointerEvent) => {
    if (!mounted.current || !current.current || event.type === 'pointercancel') { reset(); return }
    while (animations.current.length) animations.current.pop()!.stop()
    animations.current.push(animate(x, 0, spring), animate(y, 0, spring))
  }
  return {
    allowed, reset,
    card: { drag: allowed, dragListener: false, dragControls: controls, style: { x, y },
      dragConstraints: { left: -12, right: 12, top: -10, bottom: 10 }, dragElastic: 0, dragMomentum: false, onDragEnd: release },
    start: (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!current.current || !event.isPrimary || event.button !== 0) return
      while (animations.current.length) animations.current.pop()!.stop()
      controls.start(event)
    },
  }
}
