import type { Exercise, MuscleId, RoutineDay } from '../types'

type Def = [string, MuscleId[], MuscleId[], boolean?]

const defs: Def[] = [
  // Pecho
  ['Press banca', ['chest'], ['front_delts', 'triceps']],
  ['Press banca inclinado', ['chest', 'front_delts'], ['triceps']],
  ['Press banca con mancuernas', ['chest'], ['front_delts', 'triceps']],
  ['Press inclinado con mancuernas', ['chest', 'front_delts'], ['triceps']],
  ['Aperturas con mancuernas', ['chest'], ['front_delts']],
  ['Cruce de poleas', ['chest'], ['front_delts']],
  ['Pec deck', ['chest'], []],
  ['Fondos en paralelas', ['chest', 'triceps'], ['front_delts'], true],
  ['Flexiones', ['chest'], ['triceps', 'front_delts'], true],
  // Hombros
  ['Press militar', ['front_delts', 'side_delts'], ['triceps']],
  ['Press militar con mancuernas', ['front_delts', 'side_delts'], ['triceps']],
  ['Elevaciones laterales', ['side_delts'], []],
  ['Elevaciones laterales en polea', ['side_delts'], []],
  ['Elevaciones frontales', ['front_delts'], []],
  ['Pajaros (posterior)', ['rear_delts'], ['upper_back']],
  ['Face pull', ['rear_delts'], ['upper_back', 'traps']],
  ['Encogimientos (trapecio)', ['traps'], ['forearms']],
  // Triceps
  ['Extension de triceps en polea', ['triceps'], []],
  ['Extension de triceps con soga', ['triceps'], []],
  ['Press frances', ['triceps'], []],
  ['Extension sobre cabeza', ['triceps'], []],
  ['Press cerrado', ['triceps'], ['chest', 'front_delts']],
  ['Fondos en banco', ['triceps'], ['chest'], true],
  // Espalda
  ['Dominadas', ['lats'], ['biceps', 'upper_back', 'forearms'], true],
  ['Jalon al pecho', ['lats'], ['biceps', 'upper_back']],
  ['Remo con barra', ['upper_back', 'lats'], ['biceps', 'lower_back', 'rear_delts']],
  ['Remo con mancuerna', ['lats', 'upper_back'], ['biceps', 'rear_delts']],
  ['Remo en polea baja', ['upper_back', 'lats'], ['biceps']],
  ['Remo en maquina', ['upper_back', 'lats'], ['biceps']],
  ['Pullover en polea', ['lats'], ['chest']],
  ['Peso muerto', ['lower_back', 'glutes', 'hamstrings'], ['traps', 'forearms', 'quads', 'upper_back']],
  ['Peso muerto rumano', ['hamstrings', 'glutes'], ['lower_back']],
  ['Hiperextensiones', ['lower_back'], ['glutes', 'hamstrings']],
  // Biceps
  ['Curl con barra', ['biceps'], ['forearms']],
  ['Curl con mancuernas', ['biceps'], ['forearms']],
  ['Curl martillo', ['biceps', 'forearms'], []],
  ['Curl en polea', ['biceps'], []],
  ['Curl predicador', ['biceps'], []],
  ['Curl inclinado', ['biceps'], []],
  ['Curl de muneca', ['forearms'], []],
  // Piernas
  ['Sentadilla', ['quads', 'glutes'], ['hamstrings', 'lower_back', 'abs']],
  ['Sentadilla bulgara', ['quads', 'glutes'], ['hamstrings']],
  ['Prensa de piernas', ['quads', 'glutes'], ['hamstrings']],
  ['Hack squat', ['quads'], ['glutes']],
  ['Extension de cuadriceps', ['quads'], []],
  ['Curl femoral acostado', ['hamstrings'], []],
  ['Curl femoral sentado', ['hamstrings'], []],
  ['Hip thrust', ['glutes'], ['hamstrings']],
  ['Zancadas', ['quads', 'glutes'], ['hamstrings']],
  ['Elevacion de gemelos de pie', ['calves'], []],
  ['Elevacion de gemelos sentado', ['calves'], []],
  ['Aductores en maquina', ['glutes'], []],
  ['Abductores en maquina', ['glutes'], []],
  // Core
  ['Crunch abdominal', ['abs'], []],
  ['Crunch en polea', ['abs'], []],
  ['Elevacion de piernas', ['abs'], ['obliques'], true],
  ['Plancha', ['abs'], ['obliques'], true],
  ['Rueda abdominal', ['abs'], ['obliques', 'lats'], true],
  ['Giros rusos', ['obliques'], ['abs']],
  ['Inclinaciones laterales', ['obliques'], []],
]

// Nombres con acentos para mostrar (los ids se generan desde el nombre sin acentos)
const PRETTY: Record<string, string> = {
  'Pajaros (posterior)': 'Pájaros (posterior)',
  'Extension de triceps en polea': 'Extensión de tríceps en polea',
  'Extension de triceps con soga': 'Extensión de tríceps con soga',
  'Press frances': 'Press francés',
  'Extension sobre cabeza': 'Extensión sobre cabeza',
  'Jalon al pecho': 'Jalón al pecho',
  'Remo en maquina': 'Remo en máquina',
  'Curl de muneca': 'Curl de muñeca',
  'Sentadilla bulgara': 'Sentadilla búlgara',
  'Extension de cuadriceps': 'Extensión de cuádriceps',
  'Elevacion de gemelos de pie': 'Elevación de gemelos de pie',
  'Elevacion de gemelos sentado': 'Elevación de gemelos sentado',
  'Aductores en maquina': 'Aductores en máquina',
  'Abductores en maquina': 'Abductores en máquina',
  'Elevacion de piernas': 'Elevación de piernas',
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')

export const DEFAULT_EXERCISES: Exercise[] = defs.map(([name, muscles, secondary, bodyweight], i) => ({
  id: 'ex_' + slug(name),
  name: PRETTY[name] ?? name,
  muscles,
  secondary,
  bodyweight: !!bodyweight,
  createdAt: 1 + i,
}))

export const DEFAULT_DAYS: RoutineDay[] = [
  { id: 'day_push', name: 'Push', emoji: '🔥', order: 0, exerciseIds: ['ex_press_banca', 'ex_press_inclinado_con_mancuernas', 'ex_press_militar', 'ex_elevaciones_laterales', 'ex_extension_de_triceps_en_polea', 'ex_press_frances'] },
  { id: 'day_pull', name: 'Pull', emoji: '🧲', order: 1, exerciseIds: ['ex_dominadas', 'ex_remo_con_barra', 'ex_jalon_al_pecho', 'ex_remo_en_polea_baja', 'ex_face_pull', 'ex_curl_con_barra', 'ex_curl_martillo'] },
  { id: 'day_legs', name: 'Legs', emoji: '🦵', order: 2, exerciseIds: ['ex_sentadilla', 'ex_prensa_de_piernas', 'ex_peso_muerto_rumano', 'ex_extension_de_cuadriceps', 'ex_curl_femoral_acostado', 'ex_elevacion_de_gemelos_de_pie'] },
]
