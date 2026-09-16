import Dexie, { type Table } from 'dexie'
import type { Activity, BodyWeight, Exercise, RoutineDay, Setting, Soreness, Workout } from './types'
import { DEFAULT_DAYS, DEFAULT_EXERCISES } from './data/defaultExercises'

export class GymDB extends Dexie {
  exercises!: Table<Exercise, string>
  days!: Table<RoutineDay, string>
  workouts!: Table<Workout, string>
  soreness!: Table<Soreness, string>
  activities!: Table<Activity, string>
  bodyweight!: Table<BodyWeight, string>
  settings!: Table<Setting, string>

  constructor() {
    super('gym-tracker')
    this.version(1).stores({
      exercises: 'id, name, createdAt',
      days: 'id, order',
      workouts: 'id, startedAt, finishedAt, dayId',
      soreness: 'id, workoutId, muscle, createdAt',
      activities: 'id, date, type',
      bodyweight: 'id, date',
      settings: 'key',
    })
  }
}

export const db = new GymDB()

export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36))

export async function seedIfEmpty() {
  await db.transaction('rw', db.exercises, db.days, async () => {
    if ((await db.exercises.count()) > 0) return
    await db.exercises.bulkPut(DEFAULT_EXERCISES)
    await db.days.bulkPut(DEFAULT_DAYS)
  })
}

export async function exportAll() {
  const data = {
    version: 1,
    exportedAt: Date.now(),
    exercises: await db.exercises.toArray(),
    days: await db.days.toArray(),
    workouts: await db.workouts.toArray(),
    soreness: await db.soreness.toArray(),
    activities: await db.activities.toArray(),
    bodyweight: await db.bodyweight.toArray(),
    settings: await db.settings.toArray(),
  }
  return JSON.stringify(data)
}

export async function importAll(json: string) {
  const data = JSON.parse(json)
  if (!data || !Array.isArray(data.exercises)) throw new Error('Archivo invalido')
  await db.transaction('rw', [db.exercises, db.days, db.workouts, db.soreness, db.activities, db.bodyweight, db.settings], async () => {
    await Promise.all([db.exercises.clear(), db.days.clear(), db.workouts.clear(), db.soreness.clear(), db.activities.clear(), db.bodyweight.clear(), db.settings.clear()])
    await db.exercises.bulkAdd(data.exercises ?? [])
    await db.days.bulkAdd(data.days ?? [])
    await db.workouts.bulkAdd(data.workouts ?? [])
    await db.soreness.bulkAdd(data.soreness ?? [])
    await db.activities.bulkAdd(data.activities ?? [])
    await db.bodyweight.bulkAdd(data.bodyweight ?? [])
    await db.settings.bulkAdd(data.settings ?? [])
  })
}

export async function wipeAll() {
  await db.delete()
  await db.open()
  await seedIfEmpty()
}
