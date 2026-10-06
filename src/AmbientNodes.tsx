import { useEffect, useRef } from 'react'

type NodePoint = { x: number; y: number; depth: number; speed: number; phase: number; px: number; py: number }

export function AmbientNodes({enabled,theme}:{enabled:boolean;theme:'light'|'dark'}) {
  const canvasRef=useRef<HTMLCanvasElement>(null)
  useEffect(()=>{
    const canvas=canvasRef.current, context=canvas?.getContext('2d')
    if(!canvas||!context||!enabled)return
    const reduced=matchMedia('(prefers-reduced-motion: reduce)')
    const sprite=document.createElement('canvas')
    sprite.width=64; sprite.height=64
    const spriteContext=sprite.getContext('2d')
    if(!spriteContext)return
    const color=getComputedStyle(canvas).getPropertyValue('--node-rgb').trim() || (theme==='dark'?'174, 153, 226':'147, 129, 184')
    const glow=spriteContext.createRadialGradient(32,32,0,32,32,32)
    glow.addColorStop(0,`rgba(${color},.8)`)
    glow.addColorStop(.18,`rgba(${color},.22)`)
    glow.addColorStop(1,`rgba(${color},0)`)
    spriteContext.fillStyle=glow; spriteContext.fillRect(0,0,64,64)
    let width=1,height=1,nodes:NodePoint[]=[],lineLimit=60
    let frame=0,lastDraw=0,elapsed=0,pointerX=0,pointerY=0,offsetX=0,offsetY=0
    const allowed=()=>!reduced.matches&&!document.hidden
    const stop=()=>{
      cancelAnimationFrame(frame); frame=0; lastDraw=0
      context.clearRect(0,0,width,height)
    }
    const draw=(time:number)=>{
      frame=0
      if(!allowed()){stop();return}
      if(!lastDraw||time-lastDraw>=1000/30){
        const dt=lastDraw?Math.min((time-lastDraw)/1000,.08):0
        lastDraw=time; elapsed+=dt
        offsetX+=(pointerX-offsetX)*Math.min(dt*3,1)
        offsetY+=(pointerY-offsetY)*Math.min(dt*3,1)
        context.clearRect(0,0,width,height)
        for(const node of nodes){
          node.y=(node.y+dt*node.speed)%1
          node.px=node.x*width+Math.sin(elapsed*.15+node.phase)*12+offsetX*node.depth*9
          node.py=node.y*height+Math.cos(elapsed*.12+node.phase)*8+offsetY*node.depth*9
        }
        let lines=0
        const reach=Math.min(190,width*.32)
        context.lineWidth=.7
        for(let i=0;i<nodes.length&&lines<lineLimit;i++){
          for(let j=i+1;j<nodes.length&&lines<lineLimit;j++){
            const a=nodes[i],b=nodes[j],distance=Math.hypot(a.px-b.px,a.py-b.py)
            if(distance>reach)continue
            context.strokeStyle=`rgba(${color},${(1-distance/reach)*.22})`
            context.beginPath(); context.moveTo(a.px,a.py); context.lineTo(b.px,b.py); context.stroke(); lines++
          }
        }
        for(const node of nodes){
          const size=18+node.depth*17
          context.globalAlpha=.35+node.depth*.35
          context.drawImage(sprite,node.px-size/2,node.py-size/2,size,size)
          context.globalAlpha=1
          context.fillStyle=`rgba(${color},${.4+node.depth*.35})`
          context.beginPath(); context.arc(node.px,node.py,1+node.depth*1.5,0,Math.PI*2); context.fill()
        }
      }
      frame=requestAnimationFrame(draw)
    }
    const sync=()=>{stop();if(allowed())frame=requestAnimationFrame(draw)}
    const resize=()=>{
      width=Math.max(1,window.innerWidth); height=Math.max(1,window.innerHeight)
      const ratio=Math.min(devicePixelRatio||1,1.5,Math.sqrt(2_500_000/(width*height)))
      canvas.width=Math.max(1,Math.floor(width*ratio)); canvas.height=Math.max(1,Math.floor(height*ratio))
      context.setTransform(ratio,0,0,ratio,0,0)
      const narrow=width<=720,count=narrow?12:24
      lineLimit=narrow?24:60
      nodes=Array.from({length:count},(_,index)=>({
        x:index%2?.84+Math.random()*.14:.02+Math.random()*.15,
        y:Math.random(),depth:.2+Math.random()*.8,speed:.002+Math.random()*.004,
        phase:Math.random()*Math.PI*2,px:0,py:0,
      }))
      sync()
    }
    const pointer=(event:PointerEvent)=>{
      if(event.pointerType!=='mouse')return
      pointerX=event.clientX/width*2-1; pointerY=event.clientY/height*2-1
    }
    const leave=()=>{pointerX=0;pointerY=0}
    resize()
    window.addEventListener('resize',resize)
    window.addEventListener('pointermove',pointer,{passive:true})
    document.addEventListener('pointerleave',leave)
    document.addEventListener('visibilitychange',sync)
    reduced.addEventListener('change',sync)
    return ()=>{
      stop()
      window.removeEventListener('resize',resize)
      window.removeEventListener('pointermove',pointer)
      document.removeEventListener('pointerleave',leave)
      document.removeEventListener('visibilitychange',sync)
      reduced.removeEventListener('change',sync)
    }
  },[enabled,theme])
  return <canvas ref={canvasRef} className="ambient-nodes" aria-hidden="true"/>
}
