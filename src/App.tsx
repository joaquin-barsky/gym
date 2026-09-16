import { useEffect, useState, type ReactNode } from 'react'
import { seedIfEmpty } from './db'
import { useActiveWorkout } from './hooks'
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

  if (workoutOpen && active) {
    return <WorkoutPage workout={active} onClose={() => setWorkoutOpen(false)} />
  }

  return (
    <div className="h-full flex flex-col">
      <div className="safe-top bg-bg" />
      <main className="flex-1 overflow-y-auto pb-6" key={tab}>
        <div className="animate-rise">
          {tab === 'home' && <Home onOpenWorkout={() => setWorkoutOpen(true)} goBody={() => setTab('body')} />}
          {tab === 'routine' && <Routine />}
          {tab === 'progress' && <Progress />}
          {tab === 'body' && <Body />}
          {tab === 'settings' && <Settings />}
        </div>
      </main>
      {active && !workoutOpen && (
        <button onClick={() => setWorkoutOpen(true)} className="mx-4 mb-2 btn-primary justify-between">
          <span>Entrenamiento en curso · {active.name}</span><span>Continuar →</span>
        </button>
      )}
      <nav className="safe-bottom bg-surface/95 backdrop-blur border-t border-border">
        <div className="flex">
          {TABS.map(t => {
            const on = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 flex flex-col items-center pt-2.5 pb-1.5 gap-1 ${on ? 'text-accent' : 'text-muted'}`}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth={on ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">{t.icon}</svg>
                <span className="text-[10.5px] font-bold">{t.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
