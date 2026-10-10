import { useId } from 'react'
import type { PetAppearance } from './petAppearance'
import type { PetMood } from './petBehavior'
import { PetAccessories, PetCharacterBody } from './PetCharacters'

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
