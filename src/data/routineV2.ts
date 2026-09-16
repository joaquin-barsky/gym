import type { Exercise, RoutineDay, SetEntry } from '../types'

// Rutina por músculo de Joaquín (v2). Reemplaza el Push/Pull/Legs inicial.
const t0 = 1000
const ex = (id: string, name: string, muscles: Exercise['muscles'], secondary: Exercise['secondary'] = []): Exercise =>
  ({ id, name, muscles, secondary, bodyweight: false, createdAt: t0 })

export const V2_EXERCISES: Exercise[] = [
  ex('ex_pec_fly', 'Pec fly', ['chest']),
  ex('ex_vuelos_laterales', 'Vuelos laterales', ['side_delts']),
  ex('ex_press_hombro_maquina', 'Press de hombro en máquina', ['front_delts', 'side_delts'], ['triceps']),
  ex('ex_triceps_soga_arriba', 'Tríceps en polea con soga (desde arriba)', ['triceps']),
  ex('ex_triceps_unilateral_abajo', 'Tríceps en polea unilateral (desde abajo)', ['triceps']),
  ex('ex_triceps_barra_recta_arriba', 'Tríceps en polea con barra recta (desde arriba)', ['triceps']),
  ex('ex_remo_polea_alta', 'Polea alta con agarre de remo', ['lats', 'upper_back'], ['biceps', 'rear_delts']),
  ex('ex_remo_polea_baja', 'Polea baja con agarre de remo', ['upper_back', 'lats'], ['biceps']),
  ex('ex_pull_down', 'Pull down', ['lats'], ['biceps']),
  ex('ex_curl_inclinado_barra_w', 'Curl inclinado con barra W', ['biceps']),
  ex('ex_curl_polea_media_unilateral', 'Curl en polea media unilateral', ['biceps']),
  ex('ex_curl_polea_baja_soga', 'Curl en polea baja con soga', ['biceps'], ['forearms']),
]

export const V2_DAYS: RoutineDay[] = [
  { id: 'day_pecho', name: 'Pecho', emoji: '🏋️', order: 0, exerciseIds: ['ex_press_banca', 'ex_press_inclinado_con_mancuernas', 'ex_pec_fly'] },
  { id: 'day_hombro', name: 'Hombro', emoji: '🎯', order: 1, exerciseIds: ['ex_vuelos_laterales', 'ex_press_hombro_maquina', 'ex_face_pull'] },
  { id: 'day_triceps', name: 'Tríceps', emoji: '🔩', order: 2, exerciseIds: ['ex_triceps_soga_arriba', 'ex_triceps_unilateral_abajo', 'ex_triceps_barra_recta_arriba'] },
  { id: 'day_espalda', name: 'Espalda', emoji: '🧲', order: 3, exerciseIds: ['ex_remo_polea_alta', 'ex_remo_polea_baja', 'ex_pull_down'] },
  { id: 'day_biceps', name: 'Bíceps', emoji: '💪', order: 4, exerciseIds: ['ex_curl_inclinado_barra_w', 'ex_curl_polea_media_unilateral', 'ex_curl_polea_baja_soga'] },
  { id: 'day_pierna', name: 'Pierna', emoji: '🦵', order: 5, exerciseIds: [] },
]

// Entrenamiento del 15/09/2026: pecho + hombro + tríceps.
const e = (exerciseId: string, weight: number, reps: number, sets: number): SetEntry => ({ exerciseId, weight, reps, sets, toFailure: false })
export const V2_SEED_WORKOUT = {
  id: 'wk_seed_20260915',
  name: 'Pecho · Hombro · Tríceps',
  startedAt: new Date(2026, 8, 15, 19, 0).getTime(),
  finishedAt: new Date(2026, 8, 15, 20, 15).getTime(),
  entries: [
    e('ex_press_banca', 100, 4, 4),
    e('ex_press_inclinado_con_mancuernas', 26, 7, 4),
    e('ex_pec_fly', 60, 9, 3),
    e('ex_vuelos_laterales', 20, 9, 4),
    e('ex_press_hombro_maquina', 45, 7, 3),
    e('ex_face_pull', 50, 8, 3),
    e('ex_triceps_soga_arriba', 45, 7, 3),
    e('ex_triceps_unilateral_abajo', 12, 8, 3),
    e('ex_triceps_barra_recta_arriba', 60, 7, 4),
  ],
  muscles: ['chest', 'front_delts', 'side_delts', 'rear_delts', 'triceps'] as const,
  failureMuscles: [] as const,
}

// Pesos de referencia de la rutina (para prellenar la primera vez que se hace cada ejercicio).
export const V2_REFERENCE: Record<string, { weight: number; reps: number; sets: number }> = {
  ex_remo_polea_alta: { weight: 91, reps: 7, sets: 4 },
  ex_remo_polea_baja: { weight: 91, reps: 7, sets: 4 },
  ex_pull_down: { weight: 50, reps: 8, sets: 3 },
  ex_curl_inclinado_barra_w: { weight: 15, reps: 5, sets: 4 },
  ex_curl_polea_media_unilateral: { weight: 18, reps: 6, sets: 3 },
  ex_curl_polea_baja_soga: { weight: 36, reps: 7, sets: 3 },
}
