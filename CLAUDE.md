# Gym Tracker

App para el celular (PWA instalable, sobre todo iPhone) para registrar pesos del gym, ver el progreso y la recuperación muscular. La idea es no bajar nunca el peso de la vez anterior. Hoy la usa Joaquín. Quiere sumar a otras personas y, más adelante, usuario y contraseña.

## Estado (actualizado 3/11/2026)

- En producción: https://joaquin-barsky.github.io/gym/
- Último cambio: una instalación nueva arranca limpia, sin el entrenamiento del 15/09 y sin los pesos de referencia de Joaquín.
- Los datos viven solo en cada teléfono (IndexedDB, base `gym-tracker`). No hay cuentas ni nube todavía.
- El teléfono de Joaquín tiene entrenamientos reales. **No se borran ni se migran sin backup.**

## Cómo se corre y se deploya

- Local: `npm run dev`. En Claude Code, `preview_start` con el nombre `gym-dev` (abre en `/gym/`).
- Antes de subir: `npm run lint` y `npm run build`.
- Deploy: push a `main` publica solo en **GitHub Pages** (no Vercel), con `.github/workflows/deploy.yml`. Tarda 1 a 2 minutos.
- Para verificar que salió: comparar el `index-*.js` de `dist/assets` con el de la URL de producción.
- Windows: el comando de Python es `py`, no `python`.
- La pestaña de la vista previa, si está oculta, frena las animaciones y los cambios de pantalla. Traerla al frente con `tabs_select` y sacar una captura para que dibuje. Las capturas no alcanzan a mostrar animaciones cuadro por cuadro.

## Decisiones tomadas

- Stack: Vite, React, TypeScript, Tailwind v4, `motion/react`, Dexie, Recharts, vite-plugin-pwa.
- **Instalación nueva:** si la base no tiene ejercicios, `seedIfEmpty` (`src/db.ts`) carga la rutina base y guarda `routine_v2` y `blank_start`. Con eso no se carga el entrenamiento del 15/09 ni se prellenan los pesos de `V2_REFERENCE`.
- **Instalación existente (Joaquín):** no tiene `blank_start`, conserva sus datos y sus referencias. No sacar `V2_SEED_WORKOUT` ni `V2_REFERENCE` sin pensar en esto.
- **Modo demo:** interruptor en Ajustes. Usa otra base (`gym-tracker-demo`) y otra clave de cronómetro, y recarga la app. La base real no se lee ni se escribe. Se regenera al activarla o si pasaron más de 3 horas.
- **Recuperación:** 36 h base por músculo, +10 h si fue al fallo, +6/14/24 h según el dolor, tope 60 h. Fútbol y antebrazo se registran aparte.
- **Muñequito:** modelo anatómico de `react-native-body-highlighter` (MIT), en `src/data/bodyModel.ts`. Recuperado en gris, fatigado de rojo a ámbar.
- **Series:** se carga peso y reps de la primera serie más la cantidad de series. "Serie hecha" reinicia el cronómetro.

## Le gustó / no tocar

- Que ocupe toda la pantalla, sin barra del navegador.
- El look negro con acento lima, a partir de sus referencias de Pinterest. Temas elegibles en Ajustes.
- La fuente Plus Jakarta Sans y el menú flotante de íconos con círculo de color que se desliza.
- El muñequito con modelo anatómico real, pintado por recuperación.
- La idea del fondo animado de Inicio y los gráficos en Inicio.
- La demo con el muñequito bien marcado en rojo, naranja y amarillo.

## Rechazado (y por qué)

- Las frases motivacionales, ni crudas ni de mentalidad: no le gustaron.
- Contador de tiempo dentro del entrenamiento: no lo quiere.
- Muñequitos dibujados a mano: "se nota que es IA".
- Números que cuentan al aparecer en Progreso: "queda raro".
- Etiqueta DEMO fija arriba y la pregunta de dolor en la demo.
- Fútbol dentro de "¿Qué toca hoy?": no es parte del gym, se registra aparte.
- Rutina Push/Pull/Legs: entrena por músculo.
- Loaders anteriores: onda con logo, barra que se carga, cuenta regresiva de película.

## Reglas del proyecto

- Cualquier cambio tiene que dejar intactos los datos ya cargados. Avisarle explícitamente cuando se toque algo cercano a la base.
- Descanso abre en Cronómetro, que es lo que más usa.
- Para cosas de gusto, mostrar 2 o 3 variantes conmutables en vez de apostar a una sola (regla global).

## Pendientes

1. **Usuario y contraseña** para que otras personas la usen. Es la próxima etapa grande. Hay que definir plan gratis (Supabase se pausa a los 7 días sin uso) y cómo pasar a la nube los datos locales de Joaquín, con backup previo y su ok.
2. **Rutina inicial de una persona nueva:** hoy ve los días y ejercicios de Joaquín, sin sus pesos. Falta decidir si queda como plantilla o si arranca vacía.
3. **Botón "Mucho" cortado:** en "¿Cómo tenés los músculos?" (`src/components/SorenessCard.tsx`) se sale del borde en celulares de 360 a 390 px. Joaquín decidió dejarlo porque no aparece en la demo, pero las personas nuevas sí lo van a ver. Volver a consultarle.
4. **Loader actual (glitch con zoom al punto):** el glitch está en la lista anti-IA global y Joaquín todavía no dijo si le gusta. Proponer variantes.
5. **Deuda con la lista anti-IA global, sin tocar todavía:** `window.confirm` en `confirmDlg` (`src/components/ui.tsx`), etiquetas chicas en mayúsculas (`.label`), emoji en `SorenessCard`.
6. **Backup automático:** se lo sugerí y no lo eligió. Cobra más sentido con más gente.
7. Rutina de pierna real de Joaquín: la va a pasar cuando la tenga.

## Arreglo del eje Y en Progreso (14/10/2026)

- Con la métrica "Volumen", el eje Y salía cortado ("700" en vez de "2700"). Se arregló en `src/pages/Progress.tsx` (`AreaTrend`: `YAxis width="auto"` y margen izquierdo 5).
- **Detalle completo:** `FIX-NOTAS.md`.
