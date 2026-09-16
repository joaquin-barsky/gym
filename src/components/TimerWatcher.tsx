import { useEffect, useRef } from 'react'
import { alarm, remainingOf, tick, timer, useTimer } from '../lib/timer'

/** Siempre montado: dispara la cuenta regresiva sonora, la alarma y mantiene la pantalla prendida. */
export default function TimerWatcher() {
  const s = useTimer()
  const lastTick = useRef<number | null>(null)

  useEffect(() => {
    if (!s.running || s.mode !== 'countdown') return
    const id = setInterval(() => {
      const rem = remainingOf(s)
      if (rem <= 0) {
        if (!s.alerted) { alarm(); timer.markAlerted() }
        return
      }
      const secs = Math.ceil(rem / 1000)
      if (secs <= 3 && lastTick.current !== secs) { lastTick.current = secs; tick() }
    }, 100)
    return () => clearInterval(id)
  }, [s])

  useEffect(() => { if (!s.running) lastTick.current = null }, [s.running])

  // Pantalla siempre encendida mientras corre (si el sistema lo permite).
  useEffect(() => {
    if (!s.running) return
    type Lock = { release: () => Promise<void> }
    const nav = navigator as unknown as { wakeLock?: { request: (t: 'screen') => Promise<Lock> } }
    let lock: Lock | null = null
    let cancelled = false
    const acquire = async () => {
      try {
        if (nav.wakeLock && document.visibilityState === 'visible') {
          lock = await nav.wakeLock.request('screen')
          if (cancelled) void lock.release()
        }
      } catch { /* no soportado */ }
    }
    void acquire()
    const onVis = () => { if (document.visibilityState === 'visible') void acquire() }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVis)
      if (lock) void lock.release().catch(() => {})
    }
  }, [s.running])

  return null
}
