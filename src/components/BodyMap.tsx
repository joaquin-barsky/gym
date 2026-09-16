import type { MuscleId } from '../types'

// Formas de la mitad izquierda; la derecha se genera espejada.
// viewBox 0 0 200 440
const SIL_LEFT = [
  'M44,78 L64,84 L52,152 L32,150 Z',       // brazo sup
  'M32,150 L52,152 L44,215 L26,212 Z',     // antebrazo
  'M56,198 L100,198 L100,286 L60,286 Z',   // muslo
  'M62,286 L96,286 L92,372 L66,372 Z',     // pierna baja
]
const SIL_CENTER = [
  'M60,72 L140,72 C150,72 154,80 154,90 L147,182 C147,192 148,198 148,202 L52,202 C52,198 53,192 53,182 L46,90 C46,80 50,72 60,72 Z',
]

type Shape = { d: string; mirror?: boolean }

const FRONT: Partial<Record<MuscleId, Shape[]>> = {
  traps: [{ d: 'M88,60 L62,78 L88,74 Z', mirror: true }],
  front_delts: [{ d: 'M50,78 C46,86 47,98 56,102 C64,100 68,90 66,80 C60,74 54,74 50,78 Z', mirror: true }],
  side_delts: [{ d: 'M49,79 C42,86 40,98 46,108 C50,106 52,102 54,100 C46,96 46,86 49,79 Z', mirror: true }],
  chest: [{ d: 'M68,78 C63,88 63,102 72,111 C82,117 95,115 98,110 L98,76 C90,73 76,73 68,78 Z', mirror: true }],
  biceps: [{ d: 'M50,104 C42,108 38,124 39,142 C42,150 50,150 54,145 C58,128 58,110 50,104 Z', mirror: true }],
  forearms: [{ d: 'M35,158 C29,176 27,196 29,208 C33,214 42,214 44,206 C46,190 46,170 48,158 C44,152 39,152 35,158 Z', mirror: true }],
  abs: [
    { d: 'M88,114 h10 v13 h-10 z', mirror: true },
    { d: 'M88,130 h10 v13 h-10 z', mirror: true },
    { d: 'M88,146 h10 v13 h-10 z', mirror: true },
    { d: 'M88,162 h10 v16 h-10 z', mirror: true },
  ],
  obliques: [{ d: 'M74,118 C70,136 72,160 80,178 L86,178 L86,118 Z', mirror: true }],
  quads: [{ d: 'M60,206 C56,232 58,262 64,282 C72,286 88,286 94,280 C98,250 98,222 96,206 Z', mirror: true }],
  calves: [{ d: 'M66,294 C62,312 62,342 68,366 L88,366 C92,342 92,312 90,294 Z', mirror: true }],
}

const BACK: Partial<Record<MuscleId, Shape[]>> = {
  traps: [{ d: 'M100,58 L62,80 L78,92 L100,132 L122,92 L138,80 Z' }],
  rear_delts: [{ d: 'M50,78 C46,86 47,98 56,102 C64,100 68,90 66,80 C60,74 54,74 50,78 Z', mirror: true }],
  side_delts: [{ d: 'M49,79 C42,86 40,98 46,108 C50,106 52,102 54,100 C46,96 46,86 49,79 Z', mirror: true }],
  upper_back: [{ d: 'M62,94 C60,112 64,128 70,138 L96,140 L96,134 L78,94 Z', mirror: true }],
  lats: [{ d: 'M64,142 C64,162 74,180 86,192 L90,192 L96,144 Z', mirror: true }],
  lower_back: [{ d: 'M90,146 L110,146 C112,166 112,182 110,198 L90,198 C88,182 88,166 90,146 Z' }],
  triceps: [{ d: 'M50,104 C42,108 38,124 39,142 C42,150 50,150 54,145 C58,128 58,110 50,104 Z', mirror: true }],
  forearms: [{ d: 'M35,158 C29,176 27,196 29,208 C33,214 42,214 44,206 C46,190 46,170 48,158 C44,152 39,152 35,158 Z', mirror: true }],
  glutes: [{ d: 'M58,202 C54,216 58,234 72,240 C86,242 96,236 98,226 L98,202 Z', mirror: true }],
  hamstrings: [{ d: 'M60,246 C58,264 60,278 66,292 C74,296 88,296 94,290 C98,272 98,254 97,246 Z', mirror: true }],
  calves: [{ d: 'M64,300 C60,318 62,344 70,364 L88,364 C94,344 94,318 90,300 C84,294 70,294 64,300 Z', mirror: true }],
}

interface Props {
  colors: Partial<Record<MuscleId, string>>
  selected?: Set<MuscleId>
  onPick?: (m: MuscleId) => void
  view?: 'front' | 'back' | 'both'
  className?: string
  dim?: boolean
}

function Figure({ shapes, colors, selected, onPick, label, dim }: {
  shapes: Partial<Record<MuscleId, Shape[]>>
  colors: Partial<Record<MuscleId, string>>
  selected?: Set<MuscleId>
  onPick?: (m: MuscleId) => void
  label: string
  dim?: boolean
}) {
  const base = '#2a3442'
  const renderShape = (m: MuscleId, s: Shape, i: number, mirrored: boolean) => {
    const color = colors[m] ?? (dim ? '#3a4656' : '#4a5668')
    const isSel = selected?.has(m)
    return (
      <path
        key={`${m}-${i}-${mirrored ? 'r' : 'l'}`}
        d={s.d}
        fill={color}
        stroke={isSel ? '#ffffff' : '#0b0f14'}
        strokeWidth={isSel ? 2 : 1}
        strokeLinejoin="round"
        opacity={isSel || !selected ? 1 : 0.55}
        style={{ cursor: onPick ? 'pointer' : 'default', transition: 'fill .3s' }}
        onClick={onPick ? () => onPick(m) : undefined}
      />
    )
  }
  const entries = Object.entries(shapes) as [MuscleId, Shape[]][]
  return (
    <svg viewBox="0 0 200 400" className="w-full h-full" style={{ maxHeight: '100%' }}>
      <g fill={base}>
        <circle cx="100" cy="30" r="24" />
        <rect x="89" y="48" width="22" height="24" rx="6" />
        {SIL_CENTER.map((d, i) => <path key={i} d={d} />)}
        {SIL_LEFT.map((d, i) => <path key={i} d={d} />)}
        <g transform="translate(200,0) scale(-1,1)">{SIL_LEFT.map((d, i) => <path key={i} d={d} />)}</g>
        <circle cx="35" cy="221" r="9" /><circle cx="165" cy="221" r="9" />
        <circle cx="42" cy="152" r="10" /><circle cx="158" cy="152" r="10" />
        <rect x="62" y="370" width="32" height="14" rx="6" /><rect x="106" y="370" width="32" height="14" rx="6" />
      </g>
      <g>
        {entries.flatMap(([m, list]) => list.map((s, i) => renderShape(m, s, i, false)))}
      </g>
      <g transform="translate(200,0) scale(-1,1)">
        {entries.flatMap(([m, list]) => list.filter(s => s.mirror).map((s, i) => renderShape(m, s, i, true)))}
      </g>
      <text x="100" y="396" textAnchor="middle" fontSize="11" fill="#8a96a6" fontWeight="600">{label}</text>
    </svg>
  )
}

export default function BodyMap({ colors, selected, onPick, view = 'both', className = '', dim }: Props) {
  return (
    <div className={`flex justify-center gap-2 ${className}`}>
      {(view === 'front' || view === 'both') && (
        <div className="flex-1 max-w-[220px]"><Figure shapes={FRONT} colors={colors} selected={selected} onPick={onPick} label="FRENTE" dim={dim} /></div>
      )}
      {(view === 'back' || view === 'both') && (
        <div className="flex-1 max-w-[220px]"><Figure shapes={BACK} colors={colors} selected={selected} onPick={onPick} label="ESPALDA" dim={dim} /></div>
      )}
    </div>
  )
}
