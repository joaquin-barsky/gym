# FIX-NOTAS: eje Y del gráfico de Volumen (rama `fix/grafico-volumen`, 14/10/2026)

Worktree: `C:\Users\joaqu\_fixes\gym`, creado desde `main` @ c6485dc. **No está publicado** (sin push ni deploy).

## 1. Eje Y cortado en Progreso > Volumen (ARREGLADO)

**Bug:** con la métrica "Volumen", los números del eje Y se veían cortados a la izquierda ("700" en vez de "2700").

**Causa:** en `AreaTrend` el `YAxis` tenía un ancho fijo `width={44}` y el gráfico un margen izquierdo `left: -18`.
El texto del tick termina 8 px antes del área de dibujo, así que solo quedaban unos 18 px para el número.
Con 2 dígitos alcanza; con 4 dígitos ("1350", "2700", unos 26 px) se cortaban de 7 a 10 px. El SVG tiene `overflow: hidden`.
También se cortaban unos 3,5 px los ticks decimales de Reps ("9.35", "10.2").

**Cambio** (`src/pages/Progress.tsx`, función `AreaTrend`):
- Línea 27: `margin={{ ..., left: -18, ... }}` pasa a `left: 5`.
- Línea 35: `<YAxis ... width={44} />` pasa a `width="auto"`. Recharts 3 mide los ticks y ajusta el ancho del eje.

Con 2 dígitos (casi todo Peso y 1RM) el área de dibujo empieza en x=26, igual que antes, así que el gráfico se ve igual.
Con 3 o 4 dígitos el eje se ensancha lo justo. No cambian colores, fuente ni formato.
El gráfico de barras "Por semana" (General) no se tocó.

**Cómo se probó:**
- `npm ci` y `npm run build` en el worktree: sin errores. `oxlint` sin avisos.
- Playwright (scripts en el scratchpad, `fixes/test.mjs`) contra producción (antes) y contra `vite preview` del build local (después).
  El script levanta y apaga el preview en un puerto entre 5300 y 5399 con `base: '/gym/'`. Se usó el modo demo, 5 ejercicios, las 4 métricas y anchos de 390 y 360 px.
  Para cada tick se midió cuánto queda del texto fuera del SVG.
  - Antes, en Volumen: cortes de 6,7 a 9,6 px en todos los ejercicios. En Reps con decimales: 3,5 px.
  - Después: ningún tick cortado en ninguna métrica ni ancho (quedan unos 5 px de aire). Peso, 1RM y Reps se ven igual que antes.
  - Revisé las capturas a ojo: el eje muestra "900 … 2700" completos.

**Cómo revertir:** `git revert <commit>` en esta rama, o volver esas 2 líneas a `left: -18` y `width={44}`.

## 2. Botón "Mucho" de la tarjeta "¿Cómo tenés los músculos?" (PENDIENTE, NO aplicado)

Joaquín aclaró que en la demo la tarjeta se oculta a propósito y eso no se cambia. El arreglo de layout solo se aplicaba si era trivial, y no lo es.

**Diagnóstico** (`src/components/SorenessCard.tsx`, líneas 46-59). Se probó forzando, solo en un navegador descartable de Playwright contra el preview local, un entreno terminado hace 20 h. No se cambió el código.
- Cada fila tiene el nombre del músculo con un ancho fijo `w-24` (96 px) y 4 botones que no se achican (`px-2`, `gap-1`), que suman unos 226 px.
- El espacio útil es de 318 px a 390 de ancho y de 288 px a 360. A 390 "Mucho" se pasa 12 px del padding de la tarjeta. A 360 se pasa 42 px y queda cortado por el borde de la pantalla.
- "Isquiotibiales" ocupa justo 96 px y no se puede cortar, así que achicar padding o gaps no alcanza a 360 px. Haría falta cambiar algo del diseño.

**Opciones** (hay que decidir el diseño):
- a) En pantallas angostas, poner el nombre del músculo arriba y los 4 botones debajo, en una fila de ancho completo con `flex-1` cada uno.
- b) Usar el nombre corto (`short` de `src/muscles.ts`: "Isquios", "H. ant.") en la tarjeta, junto con `px-1.5`.
- c) Botones con `flex-1 min-w-0`, texto de 10 px y nombre en `w-20` con salto de línea. Es el más ajustado y "Bastante" queda muy justo.

No cambiar la lógica de `usePendingSoreness` (el `if (DEMO) return undefined` es intencional).

## Qué falta para publicarlo
1. Que Joaquín revise y apruebe el diff de `src/pages/Progress.tsx`.
2. Mergear `fix/grafico-volumen` en `main`: `git -C C:\Users\joaqu\Proyectos\gym merge fix/grafico-volumen`. Ojo, este `FIX-NOTAS.md` también viene en el merge: se puede borrar después o mergear solo el commit del arreglo.
3. Hacer push / deploy a GitHub Pages con el flujo habitual del repo.
4. Borrar el worktree: `git -C C:\Users\joaqu\Proyectos\gym worktree remove C:\Users\joaqu\_fixes\gym`.
