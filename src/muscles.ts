import type { MuscleId } from './types'

export const MUSCLES: { id: MuscleId; label: string; short: string }[] = [
  { id: 'chest', label: 'Pecho', short: 'Pecho' },
  { id: 'front_delts', label: 'Hombro anterior', short: 'H. ant.' },
  { id: 'side_delts', label: 'Hombro lateral', short: 'H. lat.' },
  { id: 'rear_delts', label: 'Hombro posterior', short: 'H. post.' },
  { id: 'biceps', label: 'Bíceps', short: 'Bíceps' },
  { id: 'triceps', label: 'Tríceps', short: 'Tríceps' },
  { id: 'forearms', label: 'Antebrazos', short: 'Anteb.' },
  { id: 'abs', label: 'Abdominales', short: 'Abs' },
  { id: 'obliques', label: 'Oblicuos', short: 'Oblic.' },
  { id: 'traps', label: 'Trapecios', short: 'Trap.' },
  { id: 'upper_back', label: 'Espalda alta', short: 'E. alta' },
  { id: 'lats', label: 'Dorsales', short: 'Dorsal' },
  { id: 'lower_back', label: 'Lumbares', short: 'Lumbar' },
  { id: 'glutes', label: 'Glúteos', short: 'Glúteo' },
  { id: 'quads', label: 'Cuádriceps', short: 'Cuádr.' },
  { id: 'hamstrings', label: 'Isquiotibiales', short: 'Isquios' },
  { id: 'calves', label: 'Gemelos', short: 'Gemelo' },
]

export const MUSCLE_LABEL = Object.fromEntries(MUSCLES.map(m => [m.id, m.label])) as Record<MuscleId, string>

export const MUSCLE_GROUPS: { label: string; ids: MuscleId[] }[] = [
  { label: 'Pecho', ids: ['chest'] },
  { label: 'Hombros', ids: ['front_delts', 'side_delts', 'rear_delts'] },
  { label: 'Brazos', ids: ['biceps', 'triceps', 'forearms'] },
  { label: 'Espalda', ids: ['traps', 'upper_back', 'lats', 'lower_back'] },
  { label: 'Core', ids: ['abs', 'obliques'] },
  { label: 'Piernas', ids: ['quads', 'hamstrings', 'glutes', 'calves'] },
]

export const LEGS: MuscleId[] = ['quads', 'hamstrings', 'glutes', 'calves']
