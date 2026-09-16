import { useId } from 'react'
import type { MuscleId } from '../types'

// Todas las formas se dibujan para la mitad izquierda (x <= 100) y se espejan.
// viewBox 0 0 200 420

// Silueta (mitad izquierda, cerrada por el eje central)
const SIL_HALF =
  'M100.5,6 C90,6 82,16 82,29 C82,39 86,46 91,50 L91,61 ' +
  'C80,64 66,68 55,76 C45,82 39,94 39,106 ' +
  'L33,152 C30,170 28,190 29,208 C29,215 32,223 34,227 C38,233 46,231 47,222 C48,214 48,208 46,200 ' +
  'L52,152 L58,110 C60,120 60,140 64,160 C66,172 64,182 60,194 ' +
  'C55,212 55,240 59,270 C61,285 62,300 64,312 C65,336 66,360 71,385 C71,392 67,398 66,404 C70,411 92,411 99,404 ' +
  'C100,398 99,390 96,382 C94,360 92,336 92,312 C90,300 90,286 92,272 C96,250 99,226 100.5,202 Z'

type Shape = string

const FRONT: Partial<Record<MuscleId, Shape[]>> = {
  traps: ['M91,61 C84,63 72,67 58,75 C68,75 80,73 91,71 Z'],
  side_delts: ['M54,77 C44,79 38,89 38,103 C39,109 42,113 46,111 C44,101 45,87 54,77 Z'],
  front_delts: ['M56,77 C50,79 46,87 46,97 C48,107 56,109 62,103 C66,95 64,81 56,77 Z'],
  chest: ['M64,79 C60,89 58,101 63,111 C72,119 90,119 98,113 L98,77 C88,73 74,73 64,79 Z'],
  biceps: ['M52,109 C46,113 42,127 42,143 C44,151 50,153 54,149 C58,135 58,119 52,109 Z'],
  forearms: ['M46,157 C40,161 36,181 36,201 C38,207 44,207 46,203 C48,187 50,171 50,159 C49,156 47,156 46,157 Z'],
  abs: [
    'M87,119 h11 v12 h-11 z', 'M87,134 h11 v12 h-11 z', 'M87,149 h11 v12 h-11 z', 'M87,164 h11 v18 h-11 z',
  ],
  obliques: ['M64,119 C62,141 62,161 66,181 C70,185 78,183 82,179 C84,161 84,141 84,123 C78,117 70,117 64,119 Z'],
  quads: [
    'M58,205 C54,231 56,259 62,281 C66,287 72,285 74,279 C69,259 68,231 72,207 C68,201 62,201 58,205 Z', // vasto lateral
    'M74,207 C70,231 71,261 76,283 C78,287 84,287 86,283 C90,261 90,231 86,207 C82,203 78,203 74,207 Z', // recto femoral
    'M88,221 C90,241 92,263 94,281 C92,287 86,289 84,281 C86,263 87,241 88,221 Z',                       // vasto medial
  ],
  calves: [
    'M66,319 C62,336 63,361 68,383 C71,387 78,385 80,379 C80,361 79,339 78,319 C74,313 68,313 66,319 Z',
    'M82,317 C86,331 90,351 90,371 C89,379 84,381 82,375 C80,356 80,336 82,317 Z',
  ],
}

const BACK: Partial<Record<MuscleId, Shape[]>> = {
  traps: ['M100,57 C88,59 70,65 56,75 C64,81 74,91 82,101 C90,111 96,125 100,141 Z'],
  side_delts: ['M54,77 C44,79 38,89 38,103 C39,109 42,113 46,111 C44,101 45,87 54,77 Z'],
  rear_delts: ['M56,77 C50,79 46,87 46,97 C48,107 56,109 62,103 C66,95 64,81 56,77 Z'],
  upper_back: ['M58,105 C56,119 60,133 68,141 L92,133 C88,119 82,109 76,101 C70,101 64,103 58,105 Z'],
  lats: ['M62,143 C62,163 72,185 86,199 C88,201 92,199 92,195 L92,147 C82,147 72,147 62,143 Z'],
  lower_back: ['M92,151 L100,151 L100,201 L92,201 C90,187 90,169 92,151 Z'],
  triceps: ['M52,109 C46,113 42,127 42,143 C44,151 50,153 54,149 C58,135 58,119 52,109 Z'],
  forearms: ['M46,157 C40,161 36,181 36,201 C38,207 44,207 46,203 C48,187 50,171 50,159 C49,156 47,156 46,157 Z'],
  glutes: ['M60,199 C56,213 58,233 70,241 C82,245 94,239 96,227 L96,201 C84,197 70,197 60,199 Z'],
  hamstrings: [
    'M62,247 C58,263 60,281 66,297 C70,300 76,300 78,295 C77,279 77,263 78,249 C72,247 66,247 62,247 Z',
    'M81,249 C80,263 80,279 82,295 C85,300 90,300 92,295 C96,279 96,263 94,249 C90,247 85,247 81,249 Z',
  ],
  calves: [
    'M64,313 C60,331 62,353 68,373 C71,377 76,377 78,371 C78,353 77,331 76,315 C72,309 66,309 64,313 Z',
    'M80,315 C80,331 82,353 84,371 C86,377 91,377 92,371 C94,353 92,331 88,313 C86,309 82,309 80,315 Z',
  ],
}

interface Props {
  colors: Partial<Record<MuscleId, string>>
  selected?: Set<MuscleId>
  onPick?: (m: MuscleId) => void
  view?: 'front' | 'back' | 'both'
  className?: string
}

function Figure({ shapes, colors, selected, onPick, label }: {
  shapes: Partial<Record<MuscleId, Shape[]>>
  colors: Partial<Record<MuscleId, string>>
  selected?: Set<MuscleId>
  onPick?: (m: MuscleId) => void
  label: string
}) {
  const id = 'bm' + useId().replace(/[^a-zA-Z0-9]/g, '')
  const entries = Object.entries(shapes) as [MuscleId, Shape[]][]

  const muscle = (m: MuscleId, d: string, key: string) => {
    const color = colors[m] ?? '#2e2f36'
    const isSel = selected?.has(m)
    const faded = selected && !isSel
    return (
      <g key={key} onClick={onPick ? () => onPick(m) : undefined} style={{ cursor: onPick ? 'pointer' : 'default' }}>
        <path d={d} fill={color} style={{ transition: 'fill .4s' }} opacity={faded ? 0.35 : 1} />
        <path d={d} fill={`url(#${id}-gloss)`} opacity={faded ? 0.2 : 0.55} />
        <path d={d} fill="none" stroke={isSel ? '#ffffff' : '#0b0b0c'} strokeWidth={isSel ? 1.6 : 0.9} strokeOpacity={isSel ? 1 : 0.55} strokeLinejoin="round" />
      </g>
    )
  }

  return (
    <svg viewBox="0 0 200 420" className="w-full h-full">
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#202127" />
          <stop offset="1" stopColor="#161619" />
        </linearGradient>
        <linearGradient id={`${id}-gloss`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.28" />
        </linearGradient>
        <radialGradient id={`${id}-shadow`} cx="0.5" cy="0.9" r="0.6">
          <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.14" />
          <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="392" rx="70" ry="22" fill={`url(#${id}-shadow)`} />
      <g fill={`url(#${id}-body)`} stroke={`url(#${id}-body)`} strokeWidth="0.6">
        <path d={SIL_HALF} />
        <path d={SIL_HALF} transform="translate(200,0) scale(-1,1)" />
      </g>
      {/* sombra sutil para dar volumen */}
      <g fill={`url(#${id}-gloss)`} opacity="0.35">
        <path d={SIL_HALF} />
        <path d={SIL_HALF} transform="translate(200,0) scale(-1,1)" />
      </g>
      <g>{entries.flatMap(([m, list]) => list.map((d, i) => muscle(m, d, `${m}-${i}`)))}</g>
      <g transform="translate(200,0) scale(-1,1)">
        {entries.flatMap(([m, list]) => list.map((d, i) => muscle(m, d, `${m}-${i}-r`)))}
      </g>
      <text x="100" y="418" textAnchor="middle" fontSize="9" fill="#6b6b74" fontWeight="700" letterSpacing="2">{label}</text>
    </svg>
  )
}

export default function BodyMap({ colors, selected, onPick, view = 'both', className = '' }: Props) {
  return (
    <div className={`flex justify-center gap-3 ${className}`}>
      {(view === 'front' || view === 'both') && (
        <div className="flex-1 max-w-[230px]"><Figure shapes={FRONT} colors={colors} selected={selected} onPick={onPick} label="FRENTE" /></div>
      )}
      {(view === 'back' || view === 'both') && (
        <div className="flex-1 max-w-[230px]"><Figure shapes={BACK} colors={colors} selected={selected} onPick={onPick} label="ESPALDA" /></div>
      )}
    </div>
  )
}
