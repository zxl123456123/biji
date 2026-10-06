import { useCallback, useEffect, useId, useLayoutEffect, useReducer, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { clampPetPosition, isPetTap, movePetGesture, petPolicy, reducePetMood } from './petBehavior'
import type { PetGesture, PetMood, PetPoint, PetState } from './petBehavior'
import { DEFAULT_PET_APPEARANCE, PET_CHARACTER_NAMES } from './petAppearance'
import type { PetAppearance, PetCharacter } from './petAppearance'
import { PetAccessories, PetCharacterBody } from './PetCharacters'
import './pet.css'

type PetPolicyProps = { theme: 'light' | 'dark'; motionAllowed: boolean; visible: boolean; businessEnabled: boolean }
export type PetCompanionProps = PetPolicyProps & { appearance: PetAppearance; shown: boolean; hidden: boolean; onHide(): void; onOpenNotes(): void; onOpenTodos(): void }
export type PetShowcaseProps = PetPolicyProps & { appearance: PetAppearance; onApplyAppearance(next: PetAppearance): boolean }

const initialState: PetState = { mood: 'idle', resting: false }
const messages: Record<PetCharacter, Record<PetMood, string>> = {
  xiaotuan: { idle: '轻触一下，打个招呼', happy: '嘿，见到你真好', resting: '正在打盹，晚安呀', dragging: '一起换个位置吧' },
  nailong: { idle: '奶龙在这里，慢慢陪着你', happy: '开心跺跺脚，今天也很棒', resting: '圆肚皮睡着啦，轻轻的', dragging: '奶龙陪你挪个窝' },
  chiikawa: { idle: '吉伊偷偷看着你，轻轻招手吧', happy: '有一点害羞，也有好多开心', resting: '吉伊缩成小团，睡个好觉', dragging: '带吉伊去一个舒服的位置' },
  hachiware: { idle: '小八探探头，尾巴轻轻摆', happy: '小八摇摇爪，和你说你好', resting: '猫尾巴收好，休息一下', dragging: '一起找个好看的角落' },
  usagi: { idle: '乌萨奇竖起长耳，等你来玩', happy: '乌拉！开心地跳一下', resting: '长耳朵也要休息啦', dragging: '换个地方，继续陪你' },
}
const introductions: Record<PetCharacter, string> = {
  xiaotuan: '一只住在晴笺里的原创小团子。淡紫与青色，头顶藏着一小片晴天。',
  nailong: '圆圆的奶龙，带着黄橙色的大脑袋和软软的白肚皮。开心时会摇一摇、跺跺脚。',
  chiikawa: '白白的吉伊，短圆耳和粉脸颊。轻轻晃一晃，再害羞地向你挥手。',
  hachiware: '蓝耳和猫纹的小八，探探头、摆摆尾。见到你时，小爪子会开心地摇起来。',
  usagi: '米黄色的乌萨奇，长耳朵总是精神满满。轻轻弹跳，开心时再雀跃一下。',
}
const characters: PetCharacter[] = ['xiaotuan', 'nailong', 'chiikawa', 'hachiware', 'usagi']
const palettes: { value: PetAppearance['palette']; name: string }[] = [{ value: 'cloud', name: '云朵原色' }, { value: 'mint', name: '薄荷晴天' }, { value: 'peach', name: '蜜桃晚霞' }]
const heads: { value: PetAppearance['head']; name: string }[] = [{ value: 'none', name: '不戴头饰' }, { value: 'beret', name: '画家帽' }, { value: 'halo', name: '星环' }]
const accessories: { value: PetAppearance['accessory']; name: string }[] = [{ value: 'none', name: '不戴配件' }, { value: 'scarf', name: '柔软围巾' }, { value: 'bow', name: '蝴蝶结' }]
const outfits: { name: string; palette: PetAppearance['palette']; head: PetAppearance['head']; accessory: PetAppearance['accessory'] }[] = [
  { name: '云间画家', palette: 'cloud', head: 'beret', accessory: 'bow' },
  { name: '薄荷漫步', palette: 'mint', head: 'none', accessory: 'scarf' },
  { name: '晚霞星愿', palette: 'peach', head: 'halo', accessory: 'bow' },
]

function usePetBehavior(props: PetPolicyProps, character: PetCharacter, shown = true, hidden = false) {
  const [state, dispatch] = useReducer(reducePetMood, initialState)
  const [focused, setFocused] = useState(() => document.hasFocus())
  const feedback = useRef<ReturnType<typeof setTimeout> | null>(null)
  const gestureCancel = useRef<() => void>(() => {})
  const policy = petPolicy({ ...props, focused, shown, hidden, mood: state.mood })
  const policyRef = useRef(policy); policyRef.current = policy
  const clearFeedback = useCallback(() => {
    if (feedback.current !== null) { clearTimeout(feedback.current); feedback.current = null }
  }, [])
  const cancel = useCallback(() => { clearFeedback(); gestureCancel.current(); dispatch('cancel') }, [clearFeedback])
  const tap = useCallback(() => {
    if (!policyRef.current.interactive) return
    clearFeedback(); dispatch('tap')
    feedback.current = setTimeout(() => { feedback.current = null; dispatch('settle') }, 1400)
  }, [clearFeedback])
  const rest = () => { if (policyRef.current.interactive) { clearFeedback(); gestureCancel.current(); dispatch(state.resting ? 'wake' : 'rest') } }
  useEffect(() => {
    const blur = () => { setFocused(false); cancel() }
    const focus = () => setFocused(true)
    window.addEventListener('blur', blur); window.addEventListener('focus', focus)
    return () => { window.removeEventListener('blur', blur); window.removeEventListener('focus', focus); clearFeedback(); gestureCancel.current() }
  }, [cancel, clearFeedback])
  useLayoutEffect(() => {
    if (!policy.interactive || !props.motionAllowed) cancel()
  }, [policy.interactive, props.motionAllowed, cancel])
  useLayoutEffect(() => { cancel() }, [character, cancel])
  return { state, dispatch, policy, policyRef, clearFeedback, gestureCancel, tap, rest }
}

export function PetPortrait({ appearance, mood, animate }: { appearance: PetAppearance; mood: PetMood; animate: boolean }) {
  const id = useId().replace(/:/g, '')
  const bodyColors = appearance.palette === 'mint' ? ['#f8fff9', '#d9f5df', '#92dcd1'] : appearance.palette === 'peach' ? ['#fffaf4', '#fce0d6', '#ebafc3'] : ['#fffcff', '#e9e1ff', '#a7dce9']
  const earColors = appearance.palette === 'mint' ? ['#a9dbc1', '#9ee7de'] : appearance.palette === 'peach' ? ['#edb4bf', '#f9cfad'] : ['#c6b3fc', '#9ee7de']
  return <svg viewBox="0 0 240 230" className="pet-portrait" data-character={appearance.character} data-mood={mood} data-animate={animate} aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-body`} x1=".15" y1="0" x2=".9" y2="1">
        <stop stopColor={bodyColors[0]}/><stop offset=".46" stopColor={bodyColors[1]}/><stop offset="1" stopColor={bodyColors[2]}/>
      </linearGradient>
      <linearGradient id={`${id}-ear`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={earColors[0]}/><stop offset="1" stopColor={earColors[1]}/></linearGradient>
      <radialGradient id={`${id}-glow`}><stop stopColor="#bfafff" stopOpacity=".55"/><stop offset="1" stopColor="#93dfed" stopOpacity="0"/></radialGradient>
      <radialGradient id={`${id}-blush`}><stop stopColor="#f2a9c5" stopOpacity=".72"/><stop offset="1" stopColor="#f2a9c5" stopOpacity="0"/></radialGradient>
    </defs>
    <ellipse cx="120" cy="134" rx="116" ry="91" fill={`url(#${id}-glow)`} className="pet-aura"/>
    <ellipse cx="120" cy="206" rx="56" ry="8" fill="#79729f" opacity=".12" className="pet-shadow"/>
    <g className="pet-body">
      {appearance.character === 'xiaotuan' ? <>
      <path d="M73 86C52 76 44 43 59 35C73 28 91 45 95 71" fill={`url(#${id}-ear)`} stroke="#b8a9e4" strokeWidth="1.4"/>
      <path d="M151 73C155 43 175 27 186 36C198 47 187 76 167 87" fill={`url(#${id}-ear)`} stroke="#b8a9e4" strokeWidth="1.4"/>
      <path d="M57 152C34 152 27 164 37 174C44 180 59 174 65 169M178 152C201 147 210 160 201 169C194 177 181 174 175 168" fill={`url(#${id}-body)`} stroke="#b7bddf" strokeWidth="1.4"/>
      <ellipse cx="92" cy="195" rx="19" ry="10" fill="#c6c0e9"/><ellipse cx="150" cy="195" rx="19" ry="10" fill="#b5d1e7"/>
      <path d="M49 146C45 99 73 66 120 66C167 66 194 100 191 146C188 184 162 201 120 202C77 201 52 183 49 146Z" fill={`url(#${id}-body)`} stroke="#b7bddf" strokeWidth="1.5"/>
      <path d="M66 105C75 85 91 79 107 79" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" opacity=".72"/>
      <path d="M109 65C102 53 107 44 119 46C127 47 131 57 120 65" fill="#9ee2cf" stroke="#8fcbbd" strokeWidth="1.2"/>
      <path d="M121 64C123 52 135 48 141 56C144 65 132 69 121 64" fill="#c7b1f2"/>
      <ellipse cx="78" cy="148" rx="18" ry="11" fill={`url(#${id}-blush)`}/><ellipse cx="163" cy="148" rx="18" ry="11" fill={`url(#${id}-blush)`}/>
      <g className="pet-gaze">
        <g className="pet-open-eyes"><g className="pet-blink"><ellipse cx="96" cy="129" rx="7" ry="10" fill="#514668"/><ellipse cx="147" cy="129" rx="7" ry="10" fill="#514668"/><circle cx="98" cy="126" r="2.3" fill="#fff"/><circle cx="149" cy="126" r="2.3" fill="#fff"/></g></g>
        <g className="pet-closed-eyes" stroke="#514668" strokeWidth="3" strokeLinecap="round" fill="none"><path d="M88 132Q96 137 104 132M139 132Q147 137 155 132"/></g>
      </g>
      <path className="pet-mouth" d="M111 147Q120 155 129 147" fill="none" stroke="#685276" strokeWidth="2.8" strokeLinecap="round"/>
      <path className="pet-happy-mouth" d="M108 145Q120 167 133 145Z" fill="#997394"/><path className="pet-happy-mouth" d="M115 153Q120 149 127 153" stroke="#efbdce" strokeWidth="3" fill="none"/>
      <path d="M76 178Q120 191 164 178" fill="none" stroke="#fff" strokeOpacity=".42" strokeWidth="2"/>
      </> : <PetCharacterBody character={appearance.character} mood={mood}/>}
      <PetAccessories appearance={appearance}/>
    </g>
    <g className="pet-sparkles" fill="#b9a1ec"><path d="M36 81l3 6 6 3-6 3-3 6-3-6-6-3 6-3Z"/><path d="M204 117l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z"/><circle cx="193" cy="79" r="3" fill="#90d8d4"/><circle cx="44" cy="129" r="2.5" fill="#e8b4ce"/></g>
    <g className="pet-sleep" fill="#9784bb"><text x="183" y="71" fontSize="17">z</text><text x="204" y="52" fontSize="12">z</text></g>
  </svg>
}

function viewport() {
  const view = window.visualViewport
  return { width: view?.width ?? window.innerWidth, height: view?.height ?? window.innerHeight, left: view?.offsetLeft ?? 0, top: view?.offsetTop ?? 0 }
}

export function PetCompanion(props: PetCompanionProps) {
  const pet = usePetBehavior(props, props.appearance.character, props.shown, props.hidden)
  const name = PET_CHARACTER_NAMES[props.appearance.character]
  const container = useRef<HTMLDivElement>(null), button = useRef<HTMLButtonElement>(null)
  const gesture = useRef<PetGesture | null>(null)
  const positionRef = useRef<PetPoint>({ x: 0, y: 0 })
  const placed = useRef(false)
  const [position, setPosition] = useState<PetPoint | null>(null)
  const size = useRef({ width: 160, height: 204 })
  const place = useCallback((next: PetPoint) => {
    const bounded = clampPetPosition(next, size.current, viewport())
    positionRef.current = bounded; setPosition(bounded)
  }, [])
  const releaseCapture = useCallback(() => {
    const owned = gesture.current; gesture.current = null
    if (owned && button.current?.hasPointerCapture(owned.pointerId)) button.current.releasePointerCapture(owned.pointerId)
  }, [])
  pet.gestureCancel.current = releaseCapture
  useLayoutEffect(() => {
    const fit = () => {
      const bounds = container.current?.getBoundingClientRect()
      if (bounds && bounds.width > 0) size.current = { width: bounds.width, height: bounds.height }
      const view = viewport()
      place(!placed.current ? { x: (view.left ?? 0) + view.width - size.current.width - 22, y: (view.top ?? 0) + view.height - size.current.height - 24 } : positionRef.current)
      placed.current = true
    }
    fit()
    const observer = new ResizeObserver(fit)
    if (container.current) observer.observe(container.current)
    window.addEventListener('resize', fit); window.visualViewport?.addEventListener('resize', fit); window.visualViewport?.addEventListener('scroll', fit)
    return () => { observer.disconnect(); window.removeEventListener('resize', fit); window.visualViewport?.removeEventListener('resize', fit); window.visualViewport?.removeEventListener('scroll', fit) }
  }, [place, pet.policy.present])
  const start = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!pet.policyRef.current.interactive || !event.isPrimary || event.button !== 0 || gesture.current) return
    pet.clearFeedback(); pet.dispatch('cancel')
    gesture.current = { pointerId: event.pointerId, start: { x: event.clientX, y: event.clientY }, current: { x: event.clientX, y: event.clientY }, origin: positionRef.current, dragged: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const move = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const owned = gesture.current
    if (!owned || event.pointerId !== owned.pointerId) return
    const next = movePetGesture(owned, event.pointerId, { x: event.clientX, y: event.clientY })
    gesture.current = next
    if (next.dragged) {
      if (!owned.dragged) pet.dispatch('drag-start')
      place({ x: next.origin.x + next.current.x - next.start.x, y: next.origin.y + next.current.y - next.start.y })
    }
  }
  const end = (event: ReactPointerEvent<HTMLButtonElement>, cancelled = false) => {
    const owned = gesture.current
    if (!owned || event.pointerId !== owned.pointerId) return
    const final = movePetGesture(owned, event.pointerId, { x: event.clientX, y: event.clientY })
    const tap = !cancelled && isPetTap(final, event.pointerId) && pet.policyRef.current.interactive
    if (!cancelled && final.dragged) place({ x: final.origin.x + final.current.x - final.start.x, y: final.origin.y + final.current.y - final.start.y })
    if (cancelled) pet.clearFeedback()
    releaseCapture(); pet.dispatch(cancelled ? 'cancel' : 'drag-end')
    if (tap) pet.tap()
  }
  return <div ref={container} className="pet-companion" data-theme={props.theme} data-dragging={pet.state.mood === 'dragging'}
    hidden={!pet.policy.present} style={position ? { left: position.x, top: position.y } : { visibility: 'hidden' }}>
    <span className="pet-companion-name">{name} <span>✦</span></span>
    <button ref={button} type="button" className="pet-touch pet-drag-handle" aria-label={`轻触${name}；也可拖动它`} disabled={!pet.policy.interactive}
      onPointerDown={start} onPointerMove={move} onPointerUp={event => end(event)} onPointerCancel={event => end(event, true)}
      onLostPointerCapture={event => { if (gesture.current?.pointerId === event.pointerId) { gesture.current = null; pet.clearFeedback(); pet.dispatch('cancel') } }}
      onClick={event => { if (event.detail === 0) pet.tap() }}>
      <PetPortrait appearance={props.appearance} mood={pet.state.mood} animate={pet.policy.animate}/>
    </button>
    <p className="pet-feedback" role="status">{messages[props.appearance.character][pet.state.mood]}</p>
    <div className="pet-actions">
      <button type="button" disabled={!pet.policy.interactive} onClick={props.onOpenNotes}>打开记录</button>
      <button type="button" disabled={!pet.policy.interactive} onClick={props.onOpenTodos}>今日待办</button>
      <button type="button" aria-label={pet.state.resting ? `唤醒${name}` : `让${name}休息`} disabled={!pet.policy.interactive} onClick={pet.rest}>{pet.state.resting ? '唤醒' : '休息'}</button>
      <button type="button" aria-label={`收起${name}`} disabled={!pet.policy.interactive} onClick={() => { pet.clearFeedback(); releaseCapture(); pet.dispatch('cancel'); props.onHide() }}>收起</button>
    </div>
  </div>
}

export function PetShowcase(props: PetShowcaseProps) {
  const [draft, setDraft] = useState<PetAppearance>(() => ({ ...props.appearance }))
  const [saveMessage, setSaveMessage] = useState('')
  const pet = usePetBehavior(props, draft.character)
  const name = PET_CHARACTER_NAMES[draft.character]
  const tryingOn = draft.character !== props.appearance.character || draft.palette !== props.appearance.palette
    || draft.head !== props.appearance.head || draft.accessory !== props.appearance.accessory
  useEffect(() => { setDraft({ ...props.appearance }) }, [props.appearance])
  const preview = (next: PetAppearance) => { if (pet.policyRef.current.interactive) { setDraft(next); setSaveMessage('') } }
  const apply = () => {
    if (!pet.policyRef.current.interactive) return
    const saved = props.onApplyAppearance(draft)
    setSaveMessage(saved ? '装扮已穿上，已保存在本机。' : '装扮已在本次使用中生效，但未能保存；刷新或重启会回到上次保存的装扮。')
  }
  return <section className="pet-showcase" data-theme={props.theme} data-motion={pet.policy.animate}>
    <div className="pet-preview-column">
      <div className="pet-showcase-stage" data-animate={pet.policy.animate}>
        <div className="pet-stage-halo"/><div className="pet-stage-ring"/>
        <button type="button" className="pet-touch" aria-label={`轻触${name}`} disabled={!pet.policy.interactive} onClick={pet.tap}>
          <span className="pet-preview-transition" key={`${draft.character}:${draft.palette}:${draft.head}:${draft.accessory}`}>
            <PetPortrait appearance={draft} mood={pet.state.mood} animate={pet.policy.animate}/>
          </span>
        </button>
        <span className="pet-stage-caption">{name}陪你慢慢记录</span><span className="pet-preview-badge">{tryingOn ? '试穿中 · 穿上后才会保存' : '当前装扮 · 已穿上'}</span>
      </div>
      <div className="pet-showcase-copy">
        <span className="pet-kicker">你的宠物伙伴</span><h2>{name}</h2>
        <p>{introductions[draft.character]}</p>
        <p className="pet-showcase-feedback" role="status">{messages[draft.character][pet.state.mood]}</p>
        <div className="pet-showcase-actions"><button type="button" aria-label={`和${name}打个招呼`} disabled={!pet.policy.interactive} onClick={pet.tap}>打个招呼</button>
          <button type="button" aria-label={`${pet.state.resting ? '唤醒' : '让'}${name}${pet.state.resting ? '' : '休息'}`} disabled={!pet.policy.interactive} onClick={pet.rest}>{pet.state.resting ? `唤醒${name}` : '让它休息'}</button></div>
        <small>陪伴只发生在本机。它不会读取你的记录，也不会向 AI 发送内容。</small>
      </div>
    </div>
    <div className="pet-wardrobe">
      <div className="pet-wardrobe-heading"><div><span className="pet-kicker">本机免费装扮铺</span><h3>为它挑一份小心情</h3></div><p>晴小团的配色会改变身体；其他角色保留本色，配色用于装饰。</p></div>
      <div className="pet-option-group" role="group" aria-label="选择伙伴角色"><h4>选择伙伴</h4><div className="pet-character-options">
        {characters.map(character => <button type="button" key={character} aria-pressed={draft.character === character} disabled={!pet.policy.interactive} onClick={() => preview({ ...draft, character })}>
          <PetPortrait appearance={{ ...draft, character }} mood="idle" animate={false}/><span>{PET_CHARACTER_NAMES[character]}</span>
        </button>)}
      </div></div>
      <div className="pet-wardrobe-details">
        <div className="pet-option-group" role="group" aria-label="选择装扮配色"><h4>配色</h4><div className="pet-small-options">{palettes.map(option => <button type="button" key={option.value} aria-pressed={draft.palette === option.value} disabled={!pet.policy.interactive} onClick={() => preview({ ...draft, palette: option.value })}><PetPortrait appearance={{ ...draft, palette: option.value }} mood="idle" animate={false}/><span>{option.name}</span></button>)}</div></div>
        <div className="pet-option-group" role="group" aria-label="选择头饰"><h4>头饰</h4><div className="pet-small-options">{heads.map(option => <button type="button" key={option.value} aria-pressed={draft.head === option.value} disabled={!pet.policy.interactive} onClick={() => preview({ ...draft, head: option.value })}><PetPortrait appearance={{ ...draft, head: option.value }} mood="idle" animate={false}/><span>{option.name}</span></button>)}</div></div>
        <div className="pet-option-group" role="group" aria-label="选择配件"><h4>配件</h4><div className="pet-small-options">{accessories.map(option => <button type="button" key={option.value} aria-pressed={draft.accessory === option.value} disabled={!pet.policy.interactive} onClick={() => preview({ ...draft, accessory: option.value })}><PetPortrait appearance={{ ...draft, accessory: option.value }} mood="idle" animate={false}/><span>{option.name}</span></button>)}</div></div>
      </div>
      <div className="pet-option-group" role="group" aria-label="选择装扮组合"><h4>一份搭配灵感</h4><div className="pet-outfit-options">{outfits.map(outfit => <button type="button" key={outfit.name} aria-pressed={draft.palette === outfit.palette && draft.head === outfit.head && draft.accessory === outfit.accessory} disabled={!pet.policy.interactive} onClick={() => preview({ character: draft.character, palette: outfit.palette, head: outfit.head, accessory: outfit.accessory })}><PetPortrait appearance={{ character: draft.character, palette: outfit.palette, head: outfit.head, accessory: outfit.accessory }} mood="idle" animate={false}/><span>{outfit.name}</span><small>免费试穿</small></button>)}</div></div>
      <small className="pet-character-credit">晴小团为晴笺原创角色；奶龙与三小只为指定角色的 SVG 重绘，动作由本项目设计。</small>
    </div>
    <div className="pet-wardrobe-submit">
      <div className="pet-submit-buttons"><button type="button" className="pet-apply" disabled={!pet.policy.interactive} onClick={apply}>穿上这套</button><button type="button" disabled={!pet.policy.interactive} onClick={() => preview({ ...props.appearance })}>撤销试穿</button><button type="button" disabled={!pet.policy.interactive} onClick={() => preview({ ...DEFAULT_PET_APPEARANCE, character: draft.character })}>恢复原装</button></div>
      <p className="pet-save-message" role="status">{saveMessage || (tryingOn ? '当前只在试穿。穿上后，小伙伴与大展示会使用同一套装扮。' : '这是当前装扮。继续试穿，挑一套喜欢的再穿上。')}</p>
    </div>
  </section>
}
