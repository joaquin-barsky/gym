// Modo demo: la app usa una base de datos aparte con datos simulados.
// Tus datos reales viven en la base "gym-tracker" y nunca se tocan desde la demo.

const FLAG = 'gym_demo'
const FRESH = 'gym_demo_fresh'
const THEME = 'gym_demo_theme'

function read(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

export const DEMO = read(FLAG) === '1'
export const DB_NAME = DEMO ? 'gym-tracker-demo' : 'gym-tracker'

/** Activa o desactiva la demo y recarga la app. Al activarla se generan datos nuevos con fechas de hoy. */
export function setDemo(on: boolean, theme?: string) {
  try {
    if (on) {
      localStorage.setItem(FLAG, '1')
      localStorage.setItem(FRESH, '1')
      if (theme) localStorage.setItem(THEME, theme)
    } else {
      localStorage.removeItem(FLAG)
    }
  } catch { /* sin storage no hay demo */ }
  window.location.reload()
}

/** Devuelve true una sola vez después de activar la demo (para regenerar los datos). */
export function takeFreshDemo(): boolean {
  if (read(FRESH) !== '1') return false
  try { localStorage.removeItem(FRESH) } catch { /* ignorar */ }
  return true
}

export const demoTheme = () => read(THEME)
