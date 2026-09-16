import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { seedIfEmpty } from './db'
import { useActiveWorkout, useSetting } from './hooks'
import { DEFAULT_THEME, applyTheme } from './themes'
import { easeOut, spring } from './components/motion'
import { elapsedOf, fmtClock, useClock, useTimer } from './lib/timer'
import Home from './pages/Home'
import Routine from './pages/Routine'
import Progress from './pages/Progress'
import Timer from './pages/Timer'
import Settings from './pages/Settings'
import WorkoutPage from './pages/WorkoutPage'
import Splash from './components/Splash'
import TimerWatcher from './components/TimerWatcher'

type Tab = 'home' | 'routine' | 'progress' | 'timer' | 'settings'

const I = {
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  routine: <><rect x="4" y="3" width="16" height="18" rx="3" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  progress: <><path d="M4 19h16" /><path d="M5 15l4-5 4 3 6-7" /></>,
  timer: <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2M10 2h4M12 2v3M18.5 6.5l1.5-1.5" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></>,
}

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: 'home', label: 'Hoy', icon: I.home },
  { id: 'routine', label: 'Rutina', icon: I.routine },
  { id: 'progress', label: 'Progreso', icon: I.progress },
  { id: 'timer', label: 'Descanso', icon: I.timer },
  { id: 'settings', label: 'Ajustes', icon: I.settings },
]

/** Mini cronómetro flotante cuando corre y estás en otra pestaña. */
function MiniTimer({ onClick }: { onClick: () => void }) {
  const t = useTimer()
  const now = useClock(t.running, 250)
  const e = elapsedOf(t, now)
  const rem = t.duration - e
  const over = t.mode === 'countdown' && rem <= 0
  const label = t.mode === 'countdown' ? (over ? `+${fmtClock(-rem)}` : fmtClock(rem + 999)) : fmtClock(e)
  const progress = t.mode === 'countdown' ? Math.max(0, Math.min(1, rem / t.duration)) : (e % 60_000) / 60_000
  return (
    <motion.button onClick={onClick} whileTap={{ scale: 0.95 }} transition={spring}
      initial={{ opacity: 0, y: 12, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.9 }}
      className={`nav-bar pointer-events-auto h-12 pl-1.5 pr-4 rounded-full flex items-center gap-2.5 font-extrabold tabular-nums ${over ? 'text-bad' : 'text-text'}`}
      aria-label="Abrir cronómetro">
      <span className="relative w-9 h-9">
        <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-surface-3)" strokeWidth="3.5" />
          <circle cx="18" cy="18" r="15" fill="none" stroke={over ? 'var(--color-bad)' : 'var(--color-accent)'} strokeWidth="3.5" strokeLinecap="round"
            strokeDasharray={94.25} strokeDashoffset={94.25 * (1 - (over ? 1 : progress))} />
        </svg>
        {t.running && <span className={`absolute inset-[11px] rounded-full animate-pulse ${over ? 'bg-bad' : 'bg-accent'}`} />}
      </span>
      <span className="text-[17px]">{label}</span>
      <span className="text-xs text-muted font-bold">{t.mode === 'countdown' ? (over ? '¡A la serie!' : 'descanso') : 'cronómetro'}</span>
    </motion.button>
  )
}

export default function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [ready, setReady] = useState(false)
  const [workoutOpen, setWorkoutOpen] = useState(false)
  const [splash, setSplash] = useState(true)
  const active = useActiveWorkout()
  const theme = useSetting<string>('theme', DEFAULT_THEME)
  const t = useTimer()
  const timerActive = t.running || t.accumulated > 0

  useEffect(() => { seedIfEmpty().then(() => setReady(true)) }, [])
  useEffect(() => { applyTheme(theme) }, [theme])
  useEffect(() => { if (active === null) setWorkoutOpen(false) }, [active])

  return (
    <MotionConfig reducedMotion="user">
      <TimerWatcher />
      {splash && <Splash onDone={() => setSplash(false)} />}
      {!ready ? <div className="h-full bg-bg" /> : (
      <AnimatePresence mode="wait" initial={false}>
        {workoutOpen && active ? (
          <motion.div key="workout" className="h-full" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24, transition: { duration: 0.16 } }} transition={{ duration: 0.28, ease: easeOut }}>
            <WorkoutPage workout={active} onClose={() => setWorkoutOpen(false)} />
          </motion.div>
        ) : (
          <motion.div key="shell" className="h-full flex flex-col relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ duration: 0.2 }}>
            <main className="flex-1 overflow-y-auto pb-[190px]">
              <div className="safe-top" />
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }} transition={{ duration: 0.22, ease: easeOut }}>
                  {tab === 'home' && <Home onOpenWorkout={() => setWorkoutOpen(true)} />}
                  {tab === 'routine' && <Routine />}
                  {tab === 'progress' && <Progress />}
                  {tab === 'timer' && <Timer />}
                  {tab === 'settings' && <Settings />}
                </motion.div>
              </AnimatePresence>
            </main>

            <div className="absolute left-0 right-0 z-40 flex flex-col items-center gap-2.5 px-6 pointer-events-none" style={{ bottom: 'max(calc(env(safe-area-inset-bottom) - 10px), 12px)' }}>
              <AnimatePresence>
                {timerActive && tab !== 'timer' && <MiniTimer key="mini" onClick={() => setTab('timer')} />}
              </AnimatePresence>
              <AnimatePresence>
                {active && (
                  <motion.button key="resume" onClick={() => setWorkoutOpen(true)} whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={spring}
                    className="btn-primary w-full justify-between pointer-events-auto">
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-on-accent animate-pulse" />En curso · {active.name}</span>
                    <span>Continuar →</span>
                  </motion.button>
                )}
              </AnimatePresence>
              <nav className="nav-bar h-[72px] rounded-full px-2 flex items-center justify-between pointer-events-auto w-full max-w-[380px]">
                {TABS.map(tb => {
                  const on = tab === tb.id
                  const ticking = tb.id === 'timer' && t.running && !on
                  return (
                    <motion.button key={tb.id} onClick={() => setTab(tb.id)} whileTap={{ scale: 0.88 }} transition={spring}
                      className="relative w-14 h-14 rounded-full flex items-center justify-center"
                      aria-label={tb.label} aria-current={on ? 'page' : undefined}>
                      {on && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-accent" transition={{ type: 'spring', stiffness: 520, damping: 40 }} />}
                      <motion.svg animate={{ scale: on ? 1.05 : 1 }} transition={spring} className={`relative transition-colors duration-200 ${on ? 'text-on-accent' : ticking ? 'text-accent' : 'text-muted'}`} viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth={on ? 2.3 : 1.9} strokeLinecap="round" strokeLinejoin="round">{tb.icon}</motion.svg>
                      {ticking && <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-accent animate-pulse" />}
                    </motion.button>
                  )
                })}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      )}
    </MotionConfig>
  )
}
