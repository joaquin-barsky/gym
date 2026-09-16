import type { Activity, MuscleId, Soreness, Workout } from '../types'
import { MUSCLES } from '../muscles'

export const BASE_HOURS = 36
export const FAILURE_BONUS = 10
export const SORENESS_BONUS: Record<number, number> = { 0: 0, 1: 6, 2: 14, 3: 24 }
export const MAX_HOURS = 60

export interface MuscleState {
  muscle: MuscleId
  lastTrainedAt: number | null
  recoveryHours: number
  elapsedHours: number
  fraction: number // 0 = recien entrenado, 1 = recuperado
  source?: 'workout' | 'activity'
}

export function computeRecovery(
  workouts: Workout[],
  soreness: Soreness[],
  activities: Activity[],
  now = Date.now(),
): Record<MuscleId, MuscleState> {
  const result = {} as Record<MuscleId, MuscleState>
  for (const m of MUSCLES) {
    result[m.id] = { muscle: m.id, lastTrainedAt: null, recoveryHours: BASE_HOURS, elapsedHours: Infinity, fraction: 1 }
  }

  const sorenessByWorkout = new Map<string, Soreness[]>()
  for (const s of soreness) {
    const list = sorenessByWorkout.get(s.workoutId) ?? []
    list.push(s)
    sorenessByWorkout.set(s.workoutId, list)
  }

  const consider = (muscle: MuscleId, at: number, hours: number, source: 'workout' | 'activity') => {
    const st = result[muscle]
    const elapsed = (now - at) / 3_600_000
    const frac = Math.min(1, Math.max(0, elapsed / hours))
    if (st.lastTrainedAt === null || frac < st.fraction) {
      result[muscle] = { muscle, lastTrainedAt: at, recoveryHours: hours, elapsedHours: elapsed, fraction: frac, source }
    }
  }

  for (const w of workouts) {
    if (!w.finishedAt) continue
    const sore = sorenessByWorkout.get(w.id) ?? []
    for (const m of w.muscles) {
      let hours = BASE_HOURS
      if (w.failureMuscles.includes(m)) hours += FAILURE_BONUS
      const s = sore.find(x => x.muscle === m)
      if (s) hours += SORENESS_BONUS[s.level] ?? 0
      hours = Math.min(MAX_HOURS, hours)
      consider(m, w.finishedAt, hours, 'workout')
    }
  }

  for (const a of activities) {
    const hours = Math.min(MAX_HOURS, 18 + a.intensity * 8)
    for (const m of a.muscles) consider(m, a.date, hours, 'activity')
  }

  return result
}

/** Rojo (0) -> amarillo (0.5) -> verde (1). */
export function recoveryColor(fraction: number): string {
  const f = Math.min(1, Math.max(0, fraction))
  const hue = f < 0.5 ? f * 2 * 60 : 60 + (f - 0.5) * 2 * 70
  const light = 48 + (1 - Math.abs(f - 0.5) * 2) * 4
  return `hsl(${hue.toFixed(0)} 85% ${light.toFixed(0)}%)`
}

export function recoveryLabel(fraction: number): string {
  if (fraction >= 1) return 'Recuperado'
  if (fraction >= 0.66) return 'Casi listo'
  if (fraction >= 0.33) return 'Recuperando'
  return 'Fatigado'
}

export function hoursLeft(st: MuscleState): number {
  if (st.lastTrainedAt === null) return 0
  return Math.max(0, st.recoveryHours - st.elapsedHours)
}
