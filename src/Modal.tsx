import { useEffect, useRef } from 'react'

export function Modal({children,onClose,title,className}:{children:React.ReactNode;onClose:()=>void;title:string;className?:string}) {
  const frameRef=useRef<HTMLDivElement>(null)
  const returnFocus=useRef(document.activeElement instanceof HTMLElement ? document.activeElement : null)
  useEffect(()=>{
    const overflow=document.body.style.overflow
    document.body.style.overflow='hidden'
    const frame=frameRef.current
    const initial=frame?.querySelector<HTMLElement>('.visual-editor, input[autofocus], input, textarea')
    ;(initial??frame)?.focus({preventScroll:true})
    const trap=(event:KeyboardEvent)=>{
      if(event.key!=='Tab'||!frame)return
      const controls=Array.from(frame.querySelectorAll<HTMLElement>('button, input, select, textarea, [contenteditable="true"], [tabindex]'))
        .filter(control=>!control.hasAttribute('disabled')&&control.tabIndex>=0&&control.getClientRects().length>0)
      if(!controls.length){event.preventDefault();frame.focus();return}
      const first=controls[0],last=controls[controls.length-1],active=document.activeElement
      if(event.shiftKey&&(active===first||!frame.contains(active))){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&(active===last||!frame.contains(active))){event.preventDefault();first.focus()}
    }
    frame?.addEventListener('keydown',trap)
    return ()=>{
      frame?.removeEventListener('keydown',trap)
      document.body.style.overflow=overflow
      if(returnFocus.current?.isConnected)returnFocus.current.focus({preventScroll:true})
    }
  },[])
  return <div className="modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}>
    <div ref={frameRef} className={`modal-frame${className ? ` ${className}` : ''}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}>{children}</div>
  </div>
}
