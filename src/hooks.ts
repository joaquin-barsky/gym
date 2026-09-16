import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { db } from './db'
import type { Activity, Exercise, RoutineDay, Soreness, Workout } from './types'

export function useExercises(): Exercise[] {
  return useLiveQuery(() => db.exercises.orderBy('name').toArray(), [], [] as Exercise[])
}
export function useDays(): RoutineDay[] {
  return useLiveQuery(() => db.days.orderBy('order').toArray(), [], [] as RoutineDay[])
}
export function useWorkouts(): Workout[] {
  return useLiveQuery(() => db.workouts.orderBy('startedAt').toArray(), [], [] as Workout[])
}
export function useSoreness(): Soreness[] {
  return useLiveQuery(() => db.soreness.toArray(), [], [] as Soreness[])
}
export function useActivities(): Activity[] {
  return useLiveQuery(() => db.activities.orderBy('date').toArray(), [], [] as Activity[])
}
export function useActiveWorkout(): Workout | undefined | null {
  return useLiveQuery(async () => (await db.workouts.filter(w => !w.finishedAt).first()) ?? null, [], undefined)
}
export function useSetting<T>(key: string, fallback: T): T {
  const s = useLiveQuery(() => db.settings.get(key), [key])
  return s ? (s.value as T) : fallback
}
export function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
