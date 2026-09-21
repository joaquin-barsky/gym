import { memo } from 'react'
import { BODY_BACK, BODY_FRONT } from '../data/bodyModel'
import { LEGS } from '../muscles'
import type { Exercise, MuscleId, RoutineDay } from '../types'

// Qué región del modelo pinta cada músculo, y de qué lado se ve mejor.
const FRONT_SLUG: Partial<Record<MuscleId, string>> = {
  chest: 'chest', front_delts: 'deltoids', side_delts: 'deltoids', biceps: 'biceps', forearms: 'forearm',
  abs: 'abs', obliques: 'obliques', quads: 'quadriceps', calves: 'calves', traps: 'trapezius',
}
const BACK_SLUG: Partial<Record<MuscleId, string>> = {
  rear_delts: 'deltoids', triceps: 'triceps', upper_back: 'upper-back', lats: 'upper-back', lower_back: 'lower-back',
  traps: 'trapezius', glutes: 'gluteal', hamstrings: 'hamstring', calves: 'calves', forearms: 'forearm',
}
const BACK_FIRST: MuscleId[] = ['rear_delts', 'triceps', 'upper_back', 'lats', 'lower_back', 'glutes', 'hamstrings']

// Recortes del modelo (frente en x 0..724, espalda en x 724..1448).
// Medidos sobre el modelo: torso con hombros y brazos, o piernas.
const CROP = {
  front: { upper: '172 262 384 384', legs: '160 630 410 620' },
  back: { upper: '889 262 384 384', legs: '880 610 410 690' },
}

const NAME_HINT: [RegExp, MuscleId[]][] = [
  [/pecho|chest/i, ['chest']],
  [/hombro|delt/i, ['front_delts', 'side_delts', 'rear_delts']],
  [/tr[ií]ceps/i, ['triceps']],
  [/b[ií]ceps/i, ['biceps']],
  [/espalda|dorsal|back/i, ['upper_back', 'lats']],
  [/pierna|leg|cu[aá]dri/i, LEGS],
  [/antebrazo/i, ['forearms']],
  [/abdom|core/i, ['abs', 'obliques']],
]

/** Músculos principales de un día, según sus ejercicios (o su nombre si está vacío). */
export function dayMuscles(day: RoutineDay, exMap: Map<string, Exercise>): MuscleId[] {
  const count = new Map<MuscleId, number>()
  for (const id of day.exerciseIds) for (const m of exMap.get(id)?.muscles ?? []) count.set(m, (count.get(m) ?? 0) + 1)
  if (count.size) {
    const max = Math.max(...count.values())
    return [...count.entries()].filter(([, n]) => n >= Math.max(1, max / 2)).map(([m]) => m)
  }
  return NAME_HINT.find(([re]) => re.test(day.name))?.[1] ?? []
}

function MuscleGlyph({ muscles, size = 28, className = '' }: { muscles: MuscleId[]; size?: number; className?: string }) {
  const backScore = muscles.filter(m => BACK_FIRST.includes(m)).length
  const side: 'front' | 'back' = backScore > muscles.length - backScore ? 'back' : 'front'
  const legsOnly = muscles.length > 0 && muscles.every(m => LEGS.includes(m))
  const parts = side === 'front' ? BODY_FRONT : BODY_BACK
  const map = side === 'front' ? FRONT_SLUG : BACK_SLUG
  const lit = new Set(muscles.map(m => map[m]).filter(Boolean) as string[])
  const viewBox = CROP[side][legsOnly ? 'legs' : 'upper']
  return (
    <svg viewBox={viewBox} width={size} height={size} className={className} aria-hidden preserveAspectRatio="xMidYMid meet">
      {parts.map(p => p.paths.map((d, i) => (
        <path key={p.slug + i} d={d} fill="currentColor" opacity={lit.has(p.slug) ? 1 : p.slug === 'hair' ? 0.12 : 0.22} />
      )))}
    </svg>
  )
}

export default memo(MuscleGlyph)
