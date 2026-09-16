# Gym Tracker

App de seguimiento de entrenamiento (PWA, solo celular). Registrá peso × reps por ejercicio, compará con la última vez, mirá tu progreso en gráficos y el estado de recuperación de cada músculo en un muñequito.

## Usar en el iPhone

1. Abrí la app en Safari: https://joaquin-barsky.github.io/gym/
2. Botón **Compartir** → **Agregar a pantalla de inicio**.
3. Abrila desde el ícono: pantalla completa, sin barra del navegador, funciona offline.

Los datos se guardan solo en el teléfono (IndexedDB). Hacé un backup desde **Ajustes → Exportar** de vez en cuando.

## Desarrollo

```bash
npm install
npm run dev
```

`npm run build` genera `dist/`. Cada push a `main` despliega automáticamente a GitHub Pages.

## Recuperación muscular

- 36 h base por músculo entrenado.
- +10 h si el ejercicio fue al fallo.
- +6 / +14 / +24 h según el dolor que marques al día siguiente (poco / bastante / mucho).
- Tope: 60 h. Fútbol pinta piernas y core con una ventana más corta (26–42 h según intensidad).

Stack: Vite + React + TypeScript + Tailwind v4 + Dexie (IndexedDB) + Recharts + vite-plugin-pwa.

## Créditos

El modelo anatómico del muñequito proviene de [react-native-body-highlighter](https://github.com/HichamELBSI/react-native-body-highlighter) (MIT).
