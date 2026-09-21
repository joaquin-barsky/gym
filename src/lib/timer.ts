import { useEffect, useState, useSyncExternalStore } from 'react'

// Cronómetro / temporizador de descanso.
// Guarda timestamps (no un contador), así sigue exacto aunque cambies de pestaña o cierres la app.
// Vive en localStorage, separado de la base de datos de entrenamientos.

export type TimerMode = 'countdown' | 'stopwatch'

export interface Rest { at: number; ms: number }

export interface TimerState {
  mode: TimerMode
  running: boolean
  startedAt: number | null
  accumulated: number
  duration: number
  laps: number[]
  alerted: boolean
  sound: boolean
  history: Rest[]
}

const KEY = 'gym_timer_v1'
const DEFAULT: TimerState = {
  mode: 'stopwatch', running: false, startedAt: null, accumulated: 0,
  duration: 90_000, laps: [], alerted: false, sound: true, history: [],
}

function load(): TimerState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const saved: TimerState = { ...DEFAULT, ...JSON.parse(raw) }
      // Al abrir la app arranca en cronómetro, salvo que haya algo corriendo o pausado.
      if (!saved.running && saved.accumulated === 0) saved.mode = 'stopwatch'
      return saved
    }
  } catch { /* sin storage: arranca de cero */ }
  return DEFAULT
}

let state: TimerState = load()
const listeners = new Set<() => void>()

function set(patch: Partial<TimerState>) {
  state = { ...state, ...patch }
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* ignorar */ }
  listeners.forEach(l => l())
}

export const elapsedOf = (s: TimerState, now = Date.now()) =>
  s.accumulated + (s.running && s.startedAt ? now - s.startedAt : 0)

export const remainingOf = (s: TimerState, now = Date.now()) => s.duration - elapsedOf(s, now)

// ---------- Sonido ----------
let ctx: AudioContext | null = null

function unlockAudio() {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx ??= new AC()
    if (ctx.state === 'suspended') void ctx.resume()
    const o = ctx.createOscillator(), g = ctx.createGain()
    g.gain.value = 0
    o.connect(g).connect(ctx.destination)
    o.start(); o.stop(ctx.currentTime + 0.01)
  } catch { /* sin audio */ }
}

function tone(freq: number, at: number, len: number, vol = 0.3) {
  if (!ctx) return
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.type = 'sine'
  o.frequency.value = freq
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(vol, at + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, at + len)
  o.connect(g).connect(ctx.destination)
  o.start(at); o.stop(at + len + 0.02)
}

export function tick() {
  if (!state.sound || !ctx) return
  tone(660, ctx.currentTime, 0.09, 0.18)
}

export function alarm() {
  try { navigator.vibrate?.([220, 120, 220, 120, 400]) } catch { /* iOS no vibra */ }
  if (!state.sound || !ctx) return
  const t = ctx.currentTime
  tone(880, t, 0.16); tone(880, t + 0.22, 0.16); tone(1320, t + 0.44, 0.38)
}

// ---------- Acciones ----------
export const timer = {
  start() {
    if (state.running) return
    unlockAudio()
    set({ running: true, startedAt: Date.now() })
  },
  pause() {
    if (!state.running) return
    set({ running: false, accumulated: elapsedOf(state), startedAt: null })
  },
  toggle() { if (state.running) timer.pause(); else timer.start() },
  reset() {
    const e = elapsedOf(state)
    const history = e >= 5_000 ? [...state.history, { at: Date.now(), ms: e }].slice(-60) : state.history
    set({ running: false, startedAt: null, accumulated: 0, laps: [], alerted: false, history })
  },
  /** Reinicia y arranca de una: para cuando terminás la serie. */
  restart() { timer.reset(); timer.start() },
  lap() {
    const e = elapsedOf(state)
    if (e > 0) set({ laps: [...state.laps, e] })
  },
  setMode(mode: TimerMode) {
    if (mode === state.mode) return
    timer.reset()
    set({ mode })
  },
  setDuration(ms: number) {
    set({ duration: Math.max(5_000, Math.min(ms, 60 * 60_000)), alerted: false })
  },
  addTime(ms: number) { timer.setDuration(state.duration + ms) },
  markAlerted() { set({ alerted: true }) },
  toggleSound() { unlockAudio(); set({ sound: !state.sound }) },
  clearHistory() { set({ history: [] }) },
}

export function useTimer(): TimerState {
  return useSyncExternalStore(cb => { listeners.add(cb); return () => { listeners.delete(cb) } }, () => state)
}

/** Reloj para redibujar: cada frame si `fps` es true, o cada `ms` milisegundos. */
export function useClock(active: boolean, ms?: number): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    if (ms) {
      const id = setInterval(() => setNow(Date.now()), ms)
      return () => clearInterval(id)
    }
    let id = 0
    const loop = () => { setNow(Date.now()); id = requestAnimationFrame(loop) }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [active, ms])
  return active ? now : Date.now()
}

// ---------- Formato ----------
export function fmtClock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}
export const fmtCs = (ms: number) => String(Math.floor((Math.max(0, ms) % 1000) / 10)).padStart(2, '0')
export function fmtShort(ms: number): string {
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  return s % 60 === 0 ? `${s / 60}m` : fmtClock(ms)
}
