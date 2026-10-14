## Arreglo del eje Y en Progreso (14/10/2026)

- Con la métrica "Volumen", el eje Y salía cortado ("700" en vez de "2700"). Se arregló en `src/pages/Progress.tsx` (`AreaTrend`: `YAxis width="auto"` y margen izquierdo 5).
- **Detalle completo:** `FIX-NOTAS.md`.
- **Decidido no hacerlo:** en "¿Cómo tenés los músculos?" (`src/components/SorenessCard.tsx`), el botón "Mucho" se sale del borde en celulares de 360 a 390 px. Joaquín decidió dejarlo así porque esa tarjeta no aparece en la demo.
