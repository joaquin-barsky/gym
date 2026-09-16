// Frases para la pantalla de inicio: mentalidad, disciplina, estoicismo, emprender, gym.
// Se elige una al azar cada vez que se abre la app.
export const PHRASES: string[] = [
  // Disciplina y mentalidad
  'La disciplina es elegir entre lo que querés ahora y lo que querés más.',
  'No tenés que tener ganas. Tenés que hacerlo.',
  'La motivación se agota. La disciplina no.',
  'Sos lo que hacés todos los días, no lo que decís que vas a hacer.',
  'El día que no querés es el día que más cuenta.',
  'Nadie viene a salvarte. Y está bien: podés solo.',
  'La comodidad es el enemigo más caro que vas a tener.',
  'Cuando querés rendirte, acordate por qué empezaste.',
  'Hacé hoy lo que otros no quieren, para tener mañana lo que otros no pueden.',
  'Ser promedio es una decisión. Vos decidís todos los días.',
  'La constancia aburre. Por eso funciona.',
  'No busques que sea fácil. Buscá ser mejor.',
  'Lo que evitás es exactamente lo que te falta.',
  'La versión de vos que querés ser está del otro lado del esfuerzo.',
  'Si duele, estás cambiando.',
  // Estoicismo
  'No controlás lo que pasa. Controlás cómo respondés.',
  'El obstáculo es el camino.',
  'Sufrimos más en la imaginación que en la realidad.',
  'Lo que hacés con tu tiempo es lo que hacés con tu vida.',
  'Exigite a vos mismo lo que le exigirías a un rival.',
  'La calma también se entrena.',
  'Que tus actos hablen tan fuerte que no necesites explicar nada.',
  'Ningún viento es favorable para el que no sabe adónde va.',
  'Sé duro con vos y tolerante con los demás.',
  'No pierdas tiempo discutiendo cómo debe ser un buen hombre. Sé uno.',
  // Emprender y crecer
  'Todo el mundo quiere el resultado. Nadie quiere el proceso.',
  'Empezá antes de estar listo. Nunca vas a estar listo.',
  'Nadie te debe nada. Eso es libertad, no una carga.',
  'Tu competencia está entrenando mientras vos dudás.',
  'Un año de disciplina te cambia la vida. Un año de excusas también.',
  'No te compares con otros. Compará con quien eras ayer.',
  'Los resultados llegan tarde. Los que se quedan, los ven.',
  'Lo que no te desafía, no te cambia.',
  'Si no te da un poco de miedo, es que es muy chico.',
  'El progreso no se siente. Se acumula.',
  // Gym
  'La barra no sabe si estás cansado.',
  'Un kilo más que la última vez. Eso es todo.',
  'Las repeticiones que no querés hacer son las que te construyen.',
  'No hay atajo. Hay barra.',
  'Nunca te vas a arrepentir de haber entrenado.',
  'El dolor de hoy es la fuerza de mañana.',
  'Entrená como si tu futuro dependiera de eso. Porque depende.',
  'Menos charla, más hierro.',
  'Otra vez acá. Ese es el secreto.',
  'Salí sin nada guardado.',
  'La única mala sesión es la que no hiciste.',
  'Cuidá tu cuerpo: es el único lugar donde vas a vivir.',
]

export function randomPhrase(): string {
  return PHRASES[Math.floor(Math.random() * PHRASES.length)]
}
