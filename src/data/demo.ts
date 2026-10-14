import type { Activity, BodyWeight, Exercise, MuscleId, RoutineDay, SetEntry, Soreness, Workout } from '../types'
import { DEFAULT_EXERCISES } from './defaultExercises'
import { V2_DAYS, V2_EXERCISES } from './routineV2'

// Datos simulados para el modo demo: ~14 semanas de un usuario constante que progresa.
// Generador con semilla fija para que la demo se vea siempre parecida.

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Plan { id: string; from: number; to: number; step: number; reps: [number, number]; sets: [number, number] }

const PLANS: Record<string, Plan[]> = {
  day_pecho: [
    { id: 'ex_press_banca', from: 80, to: 100, step: 2.5, reps: [4, 8], sets: [4, 4] },
    { id: 'ex_press_inclinado_con_mancuernas', from: 22, to: 28, step: 2, reps: [7, 10], sets: [3, 4] },
    { id: 'ex_pec_fly', from: 45, to: 62.5, step: 2.5, reps: [8, 12], sets: [3, 4] },
  ],
  day_hombro: [
    { id: 'ex_vuelos_laterales', from: 12, to: 20, step: 1, reps: [9, 14], sets: [3, 4] },
    { id: 'ex_press_hombro_maquina', from: 35, to: 50, step: 2.5, reps: [6, 9], sets: [3, 4] },
    { id: 'ex_face_pull', from: 35, to: 52.5, step: 2.5, reps: [8, 12], sets: [3, 3] },
  ],
  day_triceps: [
    { id: 'ex_triceps_soga_arriba', from: 30, to: 45, step: 2.5, reps: [7, 11], sets: [3, 4] },
    { id: 'ex_triceps_unilateral_abajo', from: 8, to: 13, step: 1, reps: [8, 12], sets: [3, 3] },
    { id: 'ex_triceps_barra_recta_arriba', from: 45, to: 62.5, step: 2.5, reps: [7, 10], sets: [3, 4] },
  ],
  day_espalda: [
    { id: 'ex_remo_polea_alta', from: 70, to: 91, step: 2.5, reps: [6, 9], sets: [4, 4] },
    { id: 'ex_remo_polea_baja', from: 70, to: 91, step: 2.5, reps: [6, 9], sets: [3, 4] },
    { id: 'ex_pull_down', from: 40, to: 55, step: 2.5, reps: [8, 11], sets: [3, 4] },
  ],
  day_biceps: [
    { id: 'ex_curl_inclinado_barra_w', from: 10, to: 16, step: 1, reps: [5, 8], sets: [3, 4] },
    { id: 'ex_curl_polea_media_unilateral', from: 12, to: 19, step: 1, reps: [6, 10], sets: [3, 3] },
    { id: 'ex_curl_polea_baja_soga', from: 25, to: 37.5, step: 2.5, reps: [7, 10], sets: [3, 4] },
  ],
  day_pierna: [
    { id: 'ex_sentadilla', from: 70, to: 100, step: 2.5, reps: [5, 8], sets: [4, 4] },
    { id: 'ex_prensa_de_piernas', from: 140, to: 200, step: 5, reps: [8, 12], sets: [3, 4] },
    { id: 'ex_extension_de_cuadriceps', from: 40, to: 60, step: 2.5, reps: [10, 14], sets: [3, 3] },
    { id: 'ex_curl_femoral_acostado', from: 30, to: 45, step: 2.5, reps: [8, 12], sets: [3, 3] },
    { id: 'ex_elevacion_de_gemelos_de_pie', from: 50, to: 75, step: 5, reps: [12, 16], sets: [3, 4] },
  ],
}

// Rotación de 4 sesiones por semana.
const ROTATION: string[][] = [
  ['day_pecho', 'day_triceps'],
  ['day_espalda', 'day_biceps'],
  ['day_pierna'],
  ['day_hombro', 'day_pecho'],
]
const WEEKDAYS = [0, 1, 3, 5] // lunes, martes, jueves, sábado
const WEEKS = 14

export interface DemoData {
  exercises: Exercise[]
  days: RoutineDay[]
  workouts: Workout[]
  soreness: Soreness[]
  activities: Activity[]
  bodyweight: BodyWeight[]
}

export function buildDemo(now = Date.now()): DemoData {
  const r = rng(20261013)
  const exById = new Map([...DEFAULT_EXERCISES, ...V2_EXERCISES].map(e => [e.id, e]))
  const days: RoutineDay[] = V2_DAYS.map(d => ({ ...d, exerciseIds: PLANS[d.id]?.map(p => p.id) ?? d.exerciseIds }))
  const dayName = new Map(days.map(d => [d.id, d.name]))

  const today = new Date(now); today.setHours(0, 0, 0, 0)
  const monday = new Date(today); monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  const start = new Date(monday); start.setDate(monday.getDate() - (WEEKS - 1) * 7)
  const span = now - start.getTime()

  const round = (v: number, step: number) => Math.round(v / step) * step
  const pick = ([a, b]: [number, number]) => a + Math.floor(r() * (b - a + 1))

  const workouts: Workout[] = []
  const soreness: Soreness[] = []

  const makeWorkout = (id: string, date: number, group: string[], allFailure: boolean): Workout => {
    const t = Math.min(1, Math.pow((date - start.getTime()) / span, 0.85))
    const entries: SetEntry[] = []
    const seen = new Set<string>()
    for (const dayId of group) {
      for (const p of PLANS[dayId]) {
        if (seen.has(p.id)) continue
        seen.add(p.id)
        const dip = !allFailure && r() < 0.12 ? -p.step : 0
        const weight = Math.max(p.step, round(p.from + (p.to - p.from) * t + dip, p.step))
        const sets = pick(p.sets)
        entries.push({ exerciseId: p.id, weight, reps: pick(p.reps), sets, toFailure: allFailure || r() < 0.25, done: sets })
      }
    }
    const muscles = [...new Set(entries.flatMap(e => exById.get(e.exerciseId)?.muscles ?? []))] as MuscleId[]
    const failureMuscles = [...new Set(entries.filter(e => e.toFailure).flatMap(e => exById.get(e.exerciseId)?.muscles ?? []))] as MuscleId[]
    return {
      id, dayId: group[0], name: group.map(g => dayName.get(g)).join(' · '),
      startedAt: date, finishedAt: date + (52 + Math.floor(r() * 30)) * 60_000,
      entries, muscles, failureMuscles,
    }
  }

  // Historial: todo lo anterior a los últimos 3 días.
  const recentFrom = now - 3 * 86_400_000
  let rot = 0
  for (let w = 0; w < WEEKS; w++) {
    for (const wd of WEEKDAYS) {
      const date = new Date(start); date.setDate(start.getDate() + w * 7 + wd)
      date.setHours(18 + Math.floor(r() * 3), Math.floor(r() * 60))
      if (date.getTime() >= recentFrom) continue
      if (r() < 0.12) continue // alguna sesión salteada, como en la vida real
      workouts.push(makeWorkout(`demo_w_${w}_${wd}`, date.getTime(), ROTATION[rot++ % ROTATION.length], false))
    }
  }

  // Últimos días armados a mano para que el muñequito muestre fatiga en distintos grados:
  // pecho y tríceps recién entrenados (rojo), espalda y bíceps ayer (naranja), piernas antes de ayer (amarillo).
  // Cada uno trae su respuesta de dolor cargada, así la demo no muestra la pregunta.
  const RECENT: { id: string; hoursAgo: number; group: string[]; sore: 0 | 1 | 2 | 3 }[] = [
    { id: 'demo_recent_piernas', hoursAgo: 34, group: ['day_pierna'], sore: 3 },
    { id: 'demo_recent_espalda', hoursAgo: 20, group: ['day_espalda', 'day_biceps'], sore: 2 },
    { id: 'demo_recent_pecho', hoursAgo: 2.5, group: ['day_pecho', 'day_triceps'], sore: 3 },
  ]
  for (const rw of RECENT) {
    const startedAt = now - rw.hoursAgo * 3_600_000 - 65 * 60_000
    const wk = makeWorkout(rw.id, startedAt, rw.group, true)
    wk.finishedAt = now - rw.hoursAgo * 3_600_000
    workouts.push(wk)
    for (const m of wk.muscles) soreness.push({ id: `${rw.id}_${m}`, workoutId: rw.id, muscle: m, level: rw.sore, createdAt: wk.finishedAt + 12 * 3_600_000 })
  }

  const activities: Activity[] = []
  for (let w = 0; w < WEEKS; w++) {
    const sunday = new Date(start); sunday.setDate(start.getDate() + w * 7 + 6); sunday.setHours(11, 0)
    if (sunday.getTime() < recentFrom && r() < 0.75) {
      activities.push({ id: `demo_f_${w}`, type: 'football', name: 'Fútbol', date: sunday.getTime(), muscles: ['quads', 'hamstrings', 'glutes', 'calves', 'abs'], intensity: (2 + Math.floor(r() * 2)) as 2 | 3 })
    }
    const friday = new Date(start); friday.setDate(start.getDate() + w * 7 + 4); friday.setHours(21, 0)
    if (friday.getTime() < recentFrom && r() < 0.5) {
      activities.push({ id: `demo_a_${w}`, type: 'forearm', name: 'Antebrazo', date: friday.getTime(), muscles: ['forearms'], intensity: 2 })
    }
  }

  const bodyweight: BodyWeight[] = []
  for (let w = 0; w < WEEKS; w++) {
    const d = new Date(start); d.setDate(start.getDate() + w * 7); d.setHours(8, 0)
    if (d.getTime() > now) continue
    const kg = 77.5 + (w / (WEEKS - 1)) * 3.6 + (r() - 0.5) * 0.8
    bodyweight.push({ id: `demo_bw_${w}`, date: d.getTime(), kg: Math.round(kg * 10) / 10 })
  }

  return { exercises: [...DEFAULT_EXERCISES, ...V2_EXERCISES], days, workouts, soreness, activities, bodyweight }
}
