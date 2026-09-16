import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { seedIfEmpty } from './db'
import { useActiveWorkout } from './hooks'
import { easeOut, spring } from './components/motion'
import Home from './pages/Home'
import Routine from './pages/Routine'
import Progress from './pages/Progress'
import Body from './pages/Body'
import Settings from './pages/Settings'
import WorkoutPage from './pages/WorkoutPage'

type Tab = 'home' | 'routine' | 'progress' | 'body' | 'settings'

const I = {
  home: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  routine: <><rect x="4" y="3" width="16" height="18" rx="3" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  progress: <><path d="M4 19h16" /><path d="M5 15l4-5 4 3 6-7" /></>,
  body: <><circle cx="12" cy="5" r="2.5" /><path d="M8 9h8l-1 6h-2v6h-2v-6H9z" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></>,
}

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: 'home', label: 'Hoy', icon: I.home },
  { id: 'routine', label: 'Rutina', icon: I.routine },
  { id: 'progress', label: 'Progreso', icon: I.progress },
  { id: 'body', label: 'Cuerpo', icon: I.body },
  { id: 'settings', label: 'Ajustes', icon: I.settings },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [ready, setReady] = useState(false)
  const [workoutOpen, setWorkoutOpen] = useState(false)
  const active = useActiveWorkout()

  useEffect(() => { seedIfEmpty().then(() => setReady(true)) }, [])
  useEffect(() => { if (active === null) setWorkoutOpen(false) }, [active])

  if (!ready) return <div className="h-full flex items-center justify-center text-muted">Cargando…</div>

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" initial={false}>
        {workoutOpen && active ? (
          <motion.div key="workout" className="h-full" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24, transition: { duration: 0.16 } }} transition={{ duration: 0.28, ease: easeOut }}>
            <WorkoutPage workout={active} onClose={() => setWorkoutOpen(false)} />
          </motion.div>
        ) : (
          <motion.div key="shell" className="h-full flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ duration: 0.2 }}>
            <div className="safe-top bg-bg" />
            <main className="flex-1 overflow-y-auto pb-[120px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }} transition={{ duration: 0.22, ease: easeOut }}>
                  {tab === 'home' && <Home onOpenWorkout={() => setWorkoutOpen(true)} goBody={() => setTab('body')} />}
                  {tab === 'routine' && <Routine />}
                  {tab === 'progress' && <Progress />}
                  {tab === 'body' && <Body />}
                  {tab === 'settings' && <Settings />}
                </motion.div>
              </AnimatePresence>
            </main>

            <div className="fixed left-4 right-4 z-40 flex flex-col gap-2" style={{ bottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}>
              <AnimatePresence>
                {active && (
                  <motion.button key="resume" onClick={() => setWorkoutOpen(true)} whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={spring}
                    className="btn-primary justify-between rounded-[22px] h-14">
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white animate-pulse" />En curso · {active.name}</span>
                    <span className="opacity-90">Continuar →</span>
                  </motion.button>
                )}
              </AnimatePresence>
              <nav className="nav-bar h-[68px] rounded-[26px] px-1.5 flex items-center">
                {TABS.map(t => {
                  const on = tab === t.id
                  return (
                    <motion.button key={t.id} onClick={() => setTab(t.id)} whileTap={{ scale: 0.9 }} transition={spring}
                      className={`relative flex-1 h-[56px] flex flex-col items-center justify-center gap-0.5 rounded-[20px] ${on ? 'text-accent' : 'text-muted'}`}
                      aria-label={t.label} aria-current={on ? 'page' : undefined}>
                      {on && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-[20px] bg-accent/15" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
                      <motion.svg animate={{ y: on ? -1 : 0, scale: on ? 1.06 : 1 }} transition={spring} className="relative" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth={on ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">{t.icon}</motion.svg>
                      <span className="relative text-[10.5px] font-bold">{t.label}</span>
                    </motion.button>
                  )
                })}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  )
}
