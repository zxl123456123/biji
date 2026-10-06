import { useId } from 'react'
import type { PetMood } from './petBehavior'
import type { PetAppearance, PetCharacter } from './petAppearance'

// These SVG redraws use the requested characters' recognizable silhouettes.
// Their small layered movements are designed for this application.
export function PetCharacterBody({ character, mood }: { character: Exclude<PetCharacter, 'xiaotuan'>; mood: PetMood }) {
  const id = useId().replace(/:/g, ''), smiling = mood === 'happy', asleep = mood === 'resting'
  if (character === 'nailong') return <g className="nailong-character">
    <defs>
      <linearGradient id={`${id}-gold`} x1=".2" y1="0" x2=".9" y2="1"><stop stopColor="#fff574"/><stop offset=".42" stopColor="#ffd347"/><stop offset="1" stopColor="#f4982c"/></linearGradient>
      <linearGradient id={`${id}-muzzle`} x1=".15" y1="0" x2=".6" y2="1"><stop stopColor="#ffe979"/><stop offset=".55" stopColor="#ffd054"/><stop offset="1" stopColor="#e79931"/></linearGradient>
      <radialGradient id={`${id}-belly`} cx=".32" cy=".25" r=".8"><stop stopColor="#fffef1"/><stop offset=".7" stopColor="#f9f4dd"/><stop offset="1" stopColor="#e9d8af"/></radialGradient>
    </defs>
    <path className="nailong-tail" d="M163 166Q190 192 210 168Q207 202 172 198Z" fill={`url(#${id}-gold)`} stroke="#e5a33d" strokeWidth="1.8"/>
    <g className="nailong-foot nailong-foot-left"><path d="M80 191Q71 216 86 215L110 214Q120 207 109 193Z" fill={`url(#${id}-gold)`} stroke="#e4a139" strokeWidth="1.5"/><ellipse cx="84" cy="212" rx="4" ry="3" fill="#625543"/><ellipse cx="97" cy="213" rx="4" ry="3" fill="#625543"/></g>
    <g className="nailong-foot nailong-foot-right"><path d="M140 191Q131 214 145 216L167 215Q175 208 167 191Z" fill={`url(#${id}-gold)`} stroke="#e4a139" strokeWidth="1.5"/><ellipse cx="147" cy="214" rx="4" ry="3" fill="#625543"/><ellipse cx="160" cy="214" rx="4" ry="3" fill="#625543"/></g>
    <path d="M66 38C87 15 138 22 156 49C172 72 164 105 172 125C181 151 183 181 165 199C149 213 102 212 82 196C68 184 65 158 64 140C42 126 33 108 41 90C42 65 48 49 66 38Z" fill={`url(#${id}-gold)`} stroke="#eab43f" strokeWidth="1.7"/>
    <path d="M64 56Q78 36 100 37" stroke="#fff9bd" strokeWidth="8" strokeLinecap="round" opacity=".62" fill="none"/>
    <ellipse className="nailong-belly" cx="122" cy="169" rx="34" ry="38" fill={`url(#${id}-belly)`}/>
    <path className="nailong-arm nailong-arm-left" d="M70 132Q51 147 57 176Q62 187 69 177L78 149" fill={`url(#${id}-gold)`} stroke="#e5a53e" strokeWidth="1.5"/>
    <path className="nailong-arm nailong-arm-right" d="M167 127Q190 146 178 177Q174 188 166 178L157 149" fill={`url(#${id}-gold)`} stroke="#e5a53e" strokeWidth="1.5"/>
    <path d="M41 89C24 98 24 118 45 127C66 139 119 141 146 122C157 112 147 95 130 91C103 83 67 83 41 89Z" fill={`url(#${id}-muzzle)`} stroke="#e6ad42" strokeWidth="1.5"/>
    <path d="M38 103Q70 94 98 101" fill="none" stroke="#fff3a2" strokeWidth="5" strokeLinecap="round" opacity=".5"/>
    <g className="pet-open-eyes"><ellipse cx="64" cy="77" rx="8.5" ry="12" fill="#526647"/><ellipse cx="116" cy="76" rx="12" ry="14" fill="#536b43"/><ellipse cx="64" cy="78" rx="5.8" ry="9" fill="#1e3027"/><ellipse cx="116" cy="77" rx="8.5" ry="10.5" fill="#172e23"/><circle cx="118" cy="71" r="3" fill="#fffce9"/><circle cx="66" cy="73" r="2" fill="#fffce9"/></g>
    <g className="pet-closed-eyes" fill="none" stroke="#44543a" strokeWidth="3.2" strokeLinecap="round"><path d="M57 78Q64 73 71 78M106 78Q116 72 126 78"/></g>
    <ellipse cx="45" cy="104" rx="2.6" ry="1.8" fill="#c29b3a"/>
    <path className="pet-mouth" d="M46 123Q87 139 129 124" fill="none" stroke="#bd8136" strokeWidth="2" strokeLinecap="round"/>
    <path className="pet-happy-mouth" d="M76 127Q94 145 113 127Z" fill="#aa6d37"/><path className="pet-happy-mouth" d="M88 135Q95 131 102 135" fill="none" stroke="#eea590" strokeWidth="3"/>
    {asleep && <path d="M119 121q5 3 0 6" fill="none" stroke="#b48042" strokeWidth="2"/>}
  </g>
  if (character === 'chiikawa') return <g className="chiikawa-character">
    <defs><radialGradient id={`${id}-white`} cx=".32" cy=".22" r=".82"><stop stopColor="#fff"/><stop offset=".62" stopColor="#fffdfb"/><stop offset="1" stopColor="#dedbea"/></radialGradient><radialGradient id={`${id}-pink`}><stop stopColor="#f7b8cf"/><stop offset="1" stopColor="#f7b8cf" stopOpacity="0"/></radialGradient></defs>
    <g className="chiikawa-ear chiikawa-ear-left"><ellipse cx="77" cy="74" rx="18" ry="20" fill={`url(#${id}-white)`} stroke="#8b7d8d" strokeWidth="2"/><ellipse cx="77" cy="75" rx="9" ry="11" fill="#f9e5eb"/></g>
    <g className="chiikawa-ear chiikawa-ear-right"><ellipse cx="160" cy="73" rx="18" ry="20" fill={`url(#${id}-white)`} stroke="#8b7d8d" strokeWidth="2"/><ellipse cx="160" cy="74" rx="9" ry="11" fill="#f9e5eb"/></g>
    <ellipse cx="99" cy="201" rx="15" ry="10" fill="#f3f0f7" stroke="#8b7d8d" strokeWidth="1.7"/><ellipse cx="143" cy="201" rx="15" ry="10" fill="#f3f0f7" stroke="#8b7d8d" strokeWidth="1.7"/>
    <path d="M52 127C51 87 78 68 119 68C163 68 187 91 188 131C191 169 166 196 121 199C77 199 51 173 52 127Z" fill={`url(#${id}-white)`} stroke="#8b7d8d" strokeWidth="2"/>
    <path d="M72 97Q84 81 104 81" stroke="#fff" strokeWidth="7" strokeLinecap="round" opacity=".9" fill="none"/>
    <g className="chiikawa-paw chiikawa-paw-left"><path d="M60 157Q43 161 50 173Q56 181 69 174" fill={`url(#${id}-white)`} stroke="#8b7d8d" strokeWidth="1.8"/></g>
    <g className="chiikawa-paw chiikawa-paw-right"><path d="M180 153Q197 153 194 165Q191 176 178 173" fill={`url(#${id}-white)`} stroke="#8b7d8d" strokeWidth="1.8"/></g>
    <ellipse cx="79" cy="143" rx="16" ry="11" fill={`url(#${id}-pink)`}/><ellipse cx="161" cy="143" rx="16" ry="11" fill={`url(#${id}-pink)`}/>
    <g className="pet-open-eyes"><ellipse cx="93" cy="123" rx="5.7" ry="8" fill="#4d444f"/><ellipse cx="149" cy="123" rx="5.7" ry="8" fill="#4d444f"/><circle cx="94" cy="120" r="1.8" fill="#fff"/><circle cx="150" cy="120" r="1.8" fill="#fff"/></g>
    <g className="pet-closed-eyes" stroke="#4d444f" strokeWidth="2.8" strokeLinecap="round" fill="none"><path d="M86 125Q93 130 100 125M142 125Q149 130 156 125"/></g>
    <path className="pet-mouth" d="M113 137Q117 144 121 138Q125 144 130 137" fill="none" stroke="#665260" strokeWidth="2.2" strokeLinecap="round"/>
    <path className="pet-happy-mouth" d="M114 139Q122 154 131 139Z" fill="#9e737f"/>
    {smiling && <path d="M80 141l-2 5m7-5-2 5m72-5 2 5m-7-5 2 5" stroke="#e39db8" strokeWidth="1.5" strokeLinecap="round"/>}
  </g>
  if (character === 'hachiware') return <g className="hachiware-character">
    <defs><radialGradient id={`${id}-fur`} cx=".3" cy=".18" r=".85"><stop stopColor="#fff"/><stop offset=".68" stopColor="#f8fdff"/><stop offset="1" stopColor="#d2e2f1"/></radialGradient><linearGradient id={`${id}-blue`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#9bd5f8"/><stop offset="1" stopColor="#4f95c6"/></linearGradient></defs>
    <path className="hachiware-tail" d="M169 172Q202 200 210 161Q211 151 217 155Q226 172 206 191Q188 207 166 192" fill={`url(#${id}-blue)`} stroke="#6c83a0" strokeWidth="2"/>
    <ellipse cx="99" cy="201" rx="16" ry="9" fill={`url(#${id}-fur)`} stroke="#71839b" strokeWidth="1.7"/><ellipse cx="145" cy="201" rx="16" ry="9" fill={`url(#${id}-fur)`} stroke="#71839b" strokeWidth="1.7"/>
    <path d="M73 143Q64 185 92 200Q120 214 151 201Q178 186 168 146" fill={`url(#${id}-fur)`} stroke="#71839b" strokeWidth="1.8"/>
    <g className="hachiware-head">
      <path d="M57 99L56 48Q61 39 77 51L94 72M144 72L170 47Q180 39 186 51L183 103" fill={`url(#${id}-blue)`} stroke="#71839b" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M64 74l2-19 17 16M161 70l16-16-1 22" fill="#d6ecfb"/>
      <path d="M48 117C50 88 78 67 119 67C161 67 190 87 192 118C195 155 166 178 121 179C76 178 45 155 48 117Z" fill={`url(#${id}-fur)`} stroke="#71839b" strokeWidth="2"/>
      <path d="M54 98C66 77 91 68 119 69C147 69 174 78 185 98C168 103 151 98 139 88L120 108L102 88C88 101 71 104 54 98Z" fill={`url(#${id}-blue)`}/>
      <path d="M120 75L120 105" stroke="#eaf7ff" strokeWidth="6" strokeLinecap="round"/>
      <ellipse cx="78" cy="141" rx="13" ry="8" fill="#f5bfd2" opacity=".7"/><ellipse cx="165" cy="141" rx="13" ry="8" fill="#f5bfd2" opacity=".7"/>
      <g className="pet-open-eyes"><ellipse cx="94" cy="122" rx="5.5" ry="7.8" fill="#405268"/><ellipse cx="149" cy="122" rx="5.5" ry="7.8" fill="#405268"/><circle cx="95" cy="119" r="1.8" fill="#fff"/><circle cx="150" cy="119" r="1.8" fill="#fff"/></g>
      <g className="pet-closed-eyes" stroke="#405268" strokeWidth="2.8" strokeLinecap="round" fill="none"><path d="M87 125Q94 120 101 125M142 125Q149 120 156 125"/></g>
      <path className="pet-mouth" d="M115 137l6 4 6-4M121 142Q117 149 111 144M121 142Q126 149 132 144" fill="none" stroke="#59657b" strokeWidth="2" strokeLinecap="round"/>
      <path className="pet-happy-mouth" d="M113 142Q121 159 130 142Z" fill="#96788a"/>
      <path d="M63 130l12 3m-13 6 12-1m92-5 11-3m-10 8 12 1" stroke="#91a8c0" strokeWidth="1.5" strokeLinecap="round"/>
    </g>
    <g className="hachiware-paw hachiware-paw-left"><path d="M75 168Q57 171 64 184Q70 192 83 184" fill={`url(#${id}-fur)`} stroke="#71839b" strokeWidth="1.8"/></g>
    <g className="hachiware-paw hachiware-paw-right"><path d="M168 166Q184 161 185 175Q185 189 168 185" fill={`url(#${id}-fur)`} stroke="#71839b" strokeWidth="1.8"/></g>
  </g>
  return <g className="usagi-character">
    <defs><radialGradient id={`${id}-cream`} cx=".3" cy=".23" r=".86"><stop stopColor="#fff7d5"/><stop offset=".62" stopColor="#f9e9b6"/><stop offset="1" stopColor="#dbc896"/></radialGradient><linearGradient id={`${id}-ear`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffe4c7"/><stop offset="1" stopColor="#edc397"/></linearGradient></defs>
    <g className="usagi-ear usagi-ear-left"><path d="M81 100C65 72 62 25 75 14C92 1 103 45 101 94Z" fill={`url(#${id}-cream)`} stroke="#8e806c" strokeWidth="2"/><path d="M80 83Q68 29 80 24Q91 24 91 81Z" fill={`url(#${id}-ear)`}/></g>
    <g className="usagi-ear usagi-ear-right"><path d="M141 94C139 60 151 14 167 16C184 20 176 77 160 101Z" fill={`url(#${id}-cream)`} stroke="#8e806c" strokeWidth="2"/><path d="M151 84Q152 29 163 27Q174 27 161 85Z" fill={`url(#${id}-ear)`}/></g>
    <ellipse cx="98" cy="202" rx="16" ry="10" fill={`url(#${id}-cream)`} stroke="#8e806c" strokeWidth="1.8"/><ellipse cx="143" cy="202" rx="16" ry="10" fill={`url(#${id}-cream)`} stroke="#8e806c" strokeWidth="1.8"/>
    <path d="M51 135C48 103 73 84 117 83C164 82 188 105 191 138C194 174 167 198 122 201C78 202 51 177 51 135Z" fill={`url(#${id}-cream)`} stroke="#8e806c" strokeWidth="2"/>
    <path d="M70 112Q85 97 103 97" fill="none" stroke="#fffbea" strokeWidth="7" strokeLinecap="round" opacity=".8"/>
    <ellipse cx="77" cy="152" rx="14" ry="9" fill="#f3bda9" opacity=".78"/><ellipse cx="165" cy="152" rx="14" ry="9" fill="#f3bda9" opacity=".78"/>
    <g className="pet-open-eyes"><ellipse cx="96" cy="132" rx="5.5" ry="8" fill="#504b41"/><ellipse cx="148" cy="132" rx="5.5" ry="8" fill="#504b41"/><circle cx="97" cy="129" r="1.7" fill="#fff"/><circle cx="149" cy="129" r="1.7" fill="#fff"/></g>
    <g className="pet-closed-eyes" stroke="#504b41" strokeWidth="2.8" strokeLinecap="round" fill="none"><path d="M89 134Q96 129 103 134M141 134Q148 129 155 134"/></g>
    <path className="pet-mouth" d="M113 146Q118 153 122 147Q127 154 132 146" stroke="#75604e" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
    <path className="pet-happy-mouth" d="M111 149Q122 173 134 149Z" fill="#99705a"/><path className="pet-happy-mouth" d="M119 159Q123 155 128 159" stroke="#ebad9f" strokeWidth="3" fill="none"/>
    <g className="usagi-paw usagi-paw-left"><path d="M60 164Q44 168 51 180Q58 187 71 178" fill={`url(#${id}-cream)`} stroke="#8e806c" strokeWidth="1.8"/></g>
    <g className="usagi-paw usagi-paw-right"><path d="M178 163Q195 165 192 177Q189 188 175 180" fill={`url(#${id}-cream)`} stroke="#8e806c" strokeWidth="1.8"/></g>
  </g>
}

export function PetAccessories({ appearance }: { appearance: PetAppearance }) {
  const id = useId().replace(/:/g, '')
  const colors = appearance.palette === 'mint' ? ['#b8eadc', '#54b8ac', '#e7fff4'] : appearance.palette === 'peach' ? ['#ffd4bd', '#e58e9e', '#fff0d3'] : ['#d2c0fa', '#8d75c7', '#f7eeff']
  const top = appearance.character === 'usagi' ? 86 : appearance.character === 'nailong' ? 28 : appearance.character === 'xiaotuan' ? 40 : 65
  const neck = appearance.character === 'nailong' ? 144 : appearance.character === 'hachiware' ? 176 : 171
  return <g className="pet-accessories">
    <defs><linearGradient id={`${id}-cloth`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={colors[0]}/><stop offset="1" stopColor={colors[1]}/></linearGradient></defs>
    {appearance.head === 'beret' && <g className="pet-headwear" transform={`translate(119 ${top})`}>
      <path d="M-27-4Q-24-19 0-20Q27-20 30-5Q11 4-27-4Z" fill={`url(#${id}-cloth)`} stroke={colors[1]} strokeWidth="1.5"/>
      <path d="M-23-3Q1 4 25-3" stroke={colors[2]} strokeWidth="3" strokeLinecap="round" fill="none" opacity=".8"/><path d="M3-19l4-6" stroke={colors[1]} strokeWidth="4" strokeLinecap="round"/>
    </g>}
    {appearance.head === 'halo' && <g className="pet-headwear" fill="none" stroke={colors[1]} strokeWidth="2.5">
      {appearance.character === 'usagi' ? <><ellipse cx="120" cy="61" rx="24" ry="6"/><path d="M114 60l5-5 5 5-5 5Z" fill={colors[2]} strokeWidth="1.2"/></> : <><ellipse cx="120" cy={Math.max(10, top - 21)} rx="35" ry="8"/><path d={`M153 ${Math.max(6, top - 25)}l3 6 6 3-6 3-3 6-3-6-6-3 6-3Z`} fill={colors[2]} strokeWidth="1.2"/></>}
    </g>}
    {appearance.accessory === 'scarf' && <g className="pet-neckwear" transform={`translate(121 ${neck})`}>
      <path d="M-29-7Q0 4 28-7L27 3Q0 13-28 3Z" fill={`url(#${id}-cloth)`} stroke={colors[1]} strokeWidth="1.2"/>
      <path d="M10 4l-2 22 13-2-2-22Z" fill={`url(#${id}-cloth)`} stroke={colors[1]} strokeWidth="1.2"/><path d="M10 20l10-1" stroke={colors[2]} strokeWidth="3"/>
    </g>}
    {appearance.accessory === 'bow' && <g className="pet-neckwear" transform={`translate(121 ${neck})`}>
      <path d="M-2 1Q-20-15-22-5L-21 10Q-12 17-2 4M2 1Q21-15 23-5L22 10Q14 17 2 4" fill={`url(#${id}-cloth)`} stroke={colors[1]} strokeWidth="1.3"/>
      <ellipse cx="0" cy="3" rx="5" ry="6" fill={colors[2]} stroke={colors[1]} strokeWidth="1.3"/>
    </g>}
  </g>
}
