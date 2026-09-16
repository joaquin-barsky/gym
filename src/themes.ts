export interface Theme {
  id: string
  name: string
  vars: Record<string, string>
}

const base = {
  bg: '#0b0b0c', surface: '#151517', 'surface-2': '#1d1d21', 'surface-3': '#28282d', border: '#232327',
  text: '#f5f5f6', muted: '#8f8f98', good: '#3ddc97', warn: '#ffc857', bad: '#ff4d5e',
}

export const THEMES: Theme[] = [
  { id: 'lima', name: 'Lima', vars: { ...base, accent: '#c9f24d', 'on-accent': '#0b0b0c', glow: 'rgba(201, 242, 77, 0.22)' } },
  { id: 'violeta', name: 'Violeta', vars: { ...base, bg: '#0b0a10', surface: '#15131c', 'surface-2': '#1d1a25', 'surface-3': '#2a2634', border: '#25212f', accent: '#b18cff', 'on-accent': '#0b0a10', glow: 'rgba(196, 92, 255, 0.28)' } },
  { id: 'cielo', name: 'Cielo', vars: { ...base, bg: '#0a0c11', surface: '#13161d', 'surface-2': '#1a1e27', 'surface-3': '#262b36', border: '#20252f', accent: '#5ea2ff', 'on-accent': '#0a0c11', glow: 'rgba(94, 162, 255, 0.26)' } },
  { id: 'menta', name: 'Menta', vars: { ...base, bg: '#0a0d0c', surface: '#131817', 'surface-2': '#1a201e', 'surface-3': '#252d2a', border: '#1f2724', accent: '#3ddc97', 'on-accent': '#0a0d0c', glow: 'rgba(61, 220, 151, 0.24)' } },
  { id: 'fuego', name: 'Fuego', vars: { ...base, bg: '#0d0a0a', surface: '#171313', 'surface-2': '#201a1a', 'surface-3': '#2c2424', border: '#262020', accent: '#ff6a3d', 'on-accent': '#0d0a0a', glow: 'rgba(255, 106, 61, 0.26)' } },
  { id: 'rosa', name: 'Rosa', vars: { ...base, bg: '#0e0a0d', surface: '#181317', 'surface-2': '#211a1f', 'surface-3': '#2d242a', border: '#272026', accent: '#ff5c8a', 'on-accent': '#0e0a0d', glow: 'rgba(255, 92, 138, 0.26)' } },
  { id: 'ambar', name: 'Ámbar', vars: { ...base, bg: '#0c0b09', surface: '#161512', 'surface-2': '#1e1c18', 'surface-3': '#2a2722', border: '#24211c', accent: '#ffc857', 'on-accent': '#0c0b09', glow: 'rgba(255, 200, 87, 0.24)' } },
  { id: 'hielo', name: 'Hielo', vars: { ...base, accent: '#f5f5f7', 'on-accent': '#0b0b0c', glow: 'rgba(255, 255, 255, 0.14)' } },
]

export const DEFAULT_THEME = 'lima'

export function applyTheme(id: string) {
  const t = THEMES.find(x => x.id === id) ?? THEMES[0]
  const root = document.documentElement
  for (const [k, v] of Object.entries(t.vars)) root.style.setProperty(`--color-${k}`, v)
  root.dataset.theme = t.id
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.vars.bg)
}
