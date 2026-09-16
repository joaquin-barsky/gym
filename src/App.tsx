import { useEffect, useState } from 'react'
import { seedIfEmpty } from './db'
import { useActiveWorkout } from './hooks'
import Home from './pages/Home'
import Routine from './pages/Routine'
import Progress from './pages/Progress'
import Body from './pages/Body'
import Settings from './pages/Settings'
import WorkoutPage from './pages/WorkoutPage'

type Tab = 'home' | 'routine' | 'progress' | 'body' | 'settings'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Hoy', icon: '🏠' },
  { id: 'routine', label: 'Rutina', icon: '📋' },
  { id: 'progress', label: 'Progreso', icon: '📈' },
  { id: 'body', label: 'Cuerpo', icon: '🫀' },
  { id: 'settings', label: 'Ajustes', icon: '⚙️' },
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
      <main className="flex-1 overflow-y-auto pb-4">
        {tab === 'home' && <Home onOpenWorkout={() => setWorkoutOpen(true)} goBody={() => setTab('body')} />}
        {tab === 'routine' && <Routine />}
        {tab === 'progress' && <Progress />}
        {tab === 'body' && <Body />}
        {tab === 'settings' && <Settings />}
      </main>
      {active && !workoutOpen && (
        <button onClick={() => setWorkoutOpen(true)} className="mx-4 mb-2 bg-accent text-white rounded-2xl px-4 py-3 font-bold flex items-center justify-between shadow-lg">
          <span>🏋️ Entrenamiento en curso: {active.name}</span><span>Continuar →</span>
        </button>
      )}
      <nav className="safe-bottom bg-surface border-t border-border">
        <div className="flex">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 flex flex-col items-center py-2 gap-0.5 ${tab === t.id ? 'text-accent' : 'text-muted'}`}>
              <span className="text-xl leading-none">{t.icon}</span>
              <span className="text-[11px] font-semibold">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
