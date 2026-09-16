import type { Exercise, MuscleId, SetEntry, Workout } from '../types'

export const e1rm = (weight: number, reps: number) => (reps <= 1 ? weight : weight * (1 + reps / 30))

export interface HistoryPoint {
  workoutId: string
  date: number
  weight: number
  reps: number
  sets: number
  toFailure: boolean
  e1rm: number
  volume: number
}

export function finishedSorted(workouts: Workout[]): Workout[] {
  return workouts.filter(w => w.finishedAt).sort((a, b) => (a.finishedAt! - b.finishedAt!))
}

export function historyFor(exerciseId: string, workouts: Workout[]): HistoryPoint[] {
  const out: HistoryPoint[] = []
  for (const w of finishedSorted(workouts)) {
    const e = w.entries.find(x => x.exerciseId === exerciseId)
    if (!e || e.weight === undefined || e.reps === undefined) continue
    out.push({
      workoutId: w.id, date: w.finishedAt!, weight: e.weight, reps: e.reps, sets: e.sets || 1,
      toFailure: e.toFailure, e1rm: e1rm(e.weight, e.reps), volume: e.weight * e.reps * (e.sets || 1),
    })
  }
  return out
}

export function lastFor(exerciseId: string, workouts: Workout[], excludeWorkoutId?: string): HistoryPoint | undefined {
  const h = historyFor(exerciseId, workouts).filter(p => p.workoutId !== excludeWorkoutId)
  return h[h.length - 1]
}

export function bestFor(exerciseId: string, workouts: Workout[], excludeWorkoutId?: string): { weight?: HistoryPoint; e1rm?: HistoryPoint } {
  const h = historyFor(exerciseId, workouts).filter(p => p.workoutId !== excludeWorkoutId)
  let weight: HistoryPoint | undefined, best: HistoryPoint | undefined
  for (const p of h) {
    if (!weight || p.weight > weight.weight || (p.weight === weight.weight && p.reps > weight.reps)) weight = p
    if (!best || p.e1rm > best.e1rm) best = p
  }
  return { weight, e1rm: best }
}

export type Compare = 'pr' | 'up' | 'same' | 'down' | 'first'

export function compareEntry(entry: SetEntry, last?: HistoryPoint, best?: HistoryPoint): Compare {
  if (!last) return 'first'
  if (best && (entry.weight > best.weight || (entry.weight === best.weight && entry.reps > best.reps))) return 'pr'
  if (entry.weight > last.weight) return 'up'
  if (entry.weight < last.weight) return 'down'
  if (entry.reps > last.reps) return 'up'
  if (entry.reps < last.reps) return 'down'
  return 'same'
}

export function startOfWeek(t: number): number {
  const d = new Date(t)
  d.setHours(0, 0, 0, 0)
  const day = (d.getDay() + 6) % 7 // lunes = 0
  d.setDate(d.getDate() - day)
  return d.getTime()
}

export function weeksBack(n: number, now = Date.now()): number[] {
  const start = startOfWeek(now)
  const arr: number[] = []
  for (let i = n - 1; i >= 0; i--) arr.push(start - i * 7 * 86_400_000)
  return arr
}

export function workoutsPerWeek(workouts: Workout[], n = 8): { week: number; count: number }[] {
  const weeks = weeksBack(n)
  const counts = new Map(weeks.map(w => [w, 0]))
  for (const w of finishedSorted(workouts)) {
    const k = startOfWeek(w.finishedAt!)
    if (counts.has(k)) counts.set(k, counts.get(k)! + 1)
  }
  return weeks.map(week => ({ week, count: counts.get(week)! }))
}

/** Series semanales por musculo (principal cuenta 1, secundario 0.5). */
export function setsPerMusclePerWeek(workouts: Workout[], exercises: Exercise[], n = 8): { week: number; sets: Record<MuscleId, number> }[] {
  const exMap = new Map(exercises.map(e => [e.id, e]))
  const weeks = weeksBack(n)
  const res = weeks.map(week => ({ week, sets: {} as Record<MuscleId, number> }))
  const idx = new Map(weeks.map((w, i) => [w, i]))
  for (const w of finishedSorted(workouts)) {
    const i = idx.get(startOfWeek(w.finishedAt!))
    if (i === undefined) continue
    for (const e of w.entries) {
      const ex = exMap.get(e.exerciseId)
      if (!ex) continue
      const s = e.sets || 1
      for (const m of ex.muscles) res[i].sets[m] = (res[i].sets[m] ?? 0) + s
      for (const m of ex.secondary) res[i].sets[m] = (res[i].sets[m] ?? 0) + s * 0.5
    }
  }
  return res
}

export function totalVolume(w: Workout): number {
  return w.entries.reduce((a, e) => a + (e.weight || 0) * (e.reps || 0) * (e.sets || 1), 0)
}

export function fmtDate(t: number): string {
  return new Date(t).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

export function fmtDateLong(t: number): string {
  return new Date(t).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function relTime(t: number, now = Date.now()): string {
  const h = (now - t) / 3_600_000
  if (h < 1) return 'hace minutos'
  if (h < 24) return `hace ${Math.round(h)} h`
  const d = Math.floor(h / 24)
  if (d === 1) return 'ayer'
  if (d < 7) return `hace ${d} días`
  return fmtDate(t)
}

export function fmtKg(n: number): string {
  return Number.isInteger(n) ? `${n}` : n.toFixed(1).replace(/\.0$/, '')
}

export function volumePerWeek(workouts: Workout[], n = 8): { week: number; volume: number }[] {
  const weeks = weeksBack(n)
  const sums = new Map(weeks.map(w => [w, 0]))
  for (const w of finishedSorted(workouts)) {
    const k = startOfWeek(w.finishedAt!)
    if (sums.has(k)) sums.set(k, sums.get(k)! + totalVolume(w))
  }
  return weeks.map(week => ({ week, volume: sums.get(week)! }))
}

export interface PR { exerciseId: string; weight: number; reps: number; date: number; workoutId: string }

/** Récords: entradas que superaron la mejor marca anterior de ese ejercicio (no cuenta la primera vez). */
export function recentPRs(workouts: Workout[], n = 3): PR[] {
  const byEx = new Map<string, { weight: number; reps: number; date: number; workoutId: string }[]>()
  for (const w of finishedSorted(workouts)) {
    for (const e of w.entries) {
      if (!(e.weight > 0) || !(e.reps > 0)) continue
      const list = byEx.get(e.exerciseId) ?? []
      list.push({ weight: e.weight, reps: e.reps, date: w.finishedAt!, workoutId: w.id })
      byEx.set(e.exerciseId, list)
    }
  }
  const prs: PR[] = []
  for (const [exerciseId, pts] of byEx) {
    let bestW = -1, bestR = -1
    for (const p of pts) {
      if (p.weight > bestW || (p.weight === bestW && p.reps > bestR)) {
        if (bestW >= 0) prs.push({ exerciseId, ...p })
        bestW = p.weight; bestR = p.reps
      }
    }
  }
  return prs.sort((a, b) => b.date - a.date).slice(0, n)
}

/** Días de la semana actual (lunes a domingo) con si hubo entrenamiento. */
export function weekDays(workouts: Workout[], now = Date.now()): { date: number; trained: boolean; today: boolean; future: boolean }[] {
  const start = startOfWeek(now)
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
  const trainedDays = new Set(workouts.filter(w => w.finishedAt).map(w => { const d = new Date(w.finishedAt!); d.setHours(0, 0, 0, 0); return d.getTime() }))
  return Array.from({ length: 7 }, (_, i) => {
    const date = start + i * 86_400_000
    return { date, trained: trainedDays.has(date), today: date === todayStart.getTime(), future: date > todayStart.getTime() }
  })
}
