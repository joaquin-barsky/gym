export type MuscleId =
  | 'chest' | 'front_delts' | 'side_delts' | 'rear_delts'
  | 'biceps' | 'triceps' | 'forearms'
  | 'abs' | 'obliques'
  | 'traps' | 'upper_back' | 'lats' | 'lower_back'
  | 'glutes' | 'quads' | 'hamstrings' | 'calves'

export interface Exercise {
  id: string
  name: string
  muscles: MuscleId[]        // principales
  secondary: MuscleId[]      // secundarios
  bodyweight?: boolean
  createdAt: number
}

export interface RoutineDay {
  id: string
  name: string
  emoji: string
  exerciseIds: string[]
  order: number
}

export interface SetEntry {
  exerciseId: string
  weight: number       // kg (lastre si es peso corporal)
  reps: number
  sets: number         // cantidad de series
  toFailure: boolean
  note?: string
}

export interface Workout {
  id: string
  dayId?: string
  name: string
  startedAt: number
  finishedAt?: number
  entries: SetEntry[]
  muscles: MuscleId[]         // musculos marcados como entrenados (editable)
  failureMuscles: MuscleId[]  // musculos entrenados al fallo
  note?: string
}

export interface Soreness {
  id: string
  workoutId: string
  muscle: MuscleId
  level: 0 | 1 | 2 | 3
  createdAt: number
}

export interface Activity {
  id: string
  type: 'football' | 'forearm' | 'other'
  name: string
  date: number
  muscles: MuscleId[]
  intensity: 1 | 2 | 3
}

export interface BodyWeight {
  id: string
  date: number
  kg: number
}

export interface Setting {
  key: string
  value: unknown
}
