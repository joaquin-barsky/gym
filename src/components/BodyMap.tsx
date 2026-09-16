import type { MuscleId } from '../types'
import { BODY_BACK, BODY_FRONT, OUTLINE_BACK, OUTLINE_FRONT, type BodyPart } from '../data/bodyModel'

// Qué músculos de la app corresponden a cada región del modelo anatómico.
const FRONT_MAP: Record<string, MuscleId[]> = {
  chest: ['chest'],
  deltoids: ['front_delts', 'side_delts'],
  biceps: ['biceps'],
  triceps: ['triceps'],
  forearm: ['forearms'],
  abs: ['abs'],
  obliques: ['obliques'],
  trapezius: ['traps'],
  quadriceps: ['quads'],
  adductors: ['quads'],
  tibialis: ['calves'],
  calves: ['calves'],
}
const BACK_MAP: Record<string, MuscleId[]> = {
  deltoids: ['rear_delts', 'side_delts'],
  trapezius: ['traps'],
  'upper-back': ['upper_back', 'lats'],
  'lower-back': ['lower_back'],
  triceps: ['triceps'],
  forearm: ['forearms'],
  gluteal: ['glutes'],
  hamstring: ['hamstrings'],
  adductors: ['hamstrings'],
  calves: ['calves'],
}

const BODY_FILL = '#26272d'
const HAIR_FILL = '#1a1b1f'
const MUSCLE_FILL = '#34353c'

interface Props {
  colors: Partial<Record<MuscleId, string>>
  /** Para elegir el color de una región con varios músculos: gana el más fatigado. */
  fraction?: Partial<Record<MuscleId, number>>
  selected?: Set<MuscleId>
  onPick?: (ids: MuscleId[]) => void
  view?: 'front' | 'back' | 'both'
  className?: string
}

function Figure({ parts, map, outline, viewBox, colors, fraction, selected, onPick, label }: {
  parts: BodyPart[]; map: Record<string, MuscleId[]>; outline: string; viewBox: string; label: string
} & Omit<Props, 'view' | 'className'>) {
  const colorFor = (ids: MuscleId[]): string | undefined => {
    let best: MuscleId | undefined
    let bestF = Infinity
    for (const id of ids) {
      const f = fraction?.[id] ?? (colors[id] ? 0 : 1)
      if (colors[id] && f < bestF) { bestF = f; best = id }
    }
    return best ? colors[best] : undefined
  }
  return (
    <svg viewBox={viewBox} className="w-full h-full" style={{ maxHeight: '100%' }}>
      {parts.map(part => {
        const ids = map[part.slug]
        const isMuscle = !!ids
        const color = ids ? (colorFor(ids) ?? MUSCLE_FILL) : part.slug === 'hair' ? HAIR_FILL : BODY_FILL
        const isSel = !!selected && !!ids && ids.some(i => selected.has(i))
        const faded = !!selected && isMuscle && !isSel
        return (
          <g key={part.slug} onClick={onPick && ids ? () => onPick(ids) : undefined} style={{ cursor: onPick && ids ? 'pointer' : 'default' }}>
            {part.paths.map((d, i) => (
              <path key={i} d={d} fill={color} opacity={faded ? 0.4 : 1}
                stroke={isSel ? '#ffffff' : 'none'} strokeWidth={isSel ? 4 : 0} strokeLinejoin="round"
                style={{ transition: 'fill .4s, opacity .3s' }} />
            ))}
          </g>
        )
      })}
      <path d={outline} fill="none" stroke="#0b0b0c" strokeWidth={3} strokeLinecap="round" opacity={0.9} />
      <text x={viewBox.startsWith('724') ? 1086 : 362} y="1430" textAnchor="middle" fontSize="34" fill="#6b6b74" fontWeight="700" letterSpacing="8">{label}</text>
    </svg>
  )
}

export default function BodyMap({ colors, fraction, selected, onPick, view = 'both', className = '' }: Props) {
  return (
    <div className={`flex justify-center gap-2 ${className}`}>
      {(view === 'front' || view === 'both') && (
        <div className="flex-1 max-w-[230px]"><Figure parts={BODY_FRONT} map={FRONT_MAP} outline={OUTLINE_FRONT} viewBox="0 0 724 1448" colors={colors} fraction={fraction} selected={selected} onPick={onPick} label="FRENTE" /></div>
      )}
      {(view === 'back' || view === 'both') && (
        <div className="flex-1 max-w-[230px]"><Figure parts={BODY_BACK} map={BACK_MAP} outline={OUTLINE_BACK} viewBox="724 0 724 1448" colors={colors} fraction={fraction} selected={selected} onPick={onPick} label="ESPALDA" /></div>
      )}
    </div>
  )
}
