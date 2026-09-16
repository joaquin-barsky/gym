import { useState } from 'react'
import { useActivities, useNow, useSoreness, useWorkouts } from '../hooks'
import { computeRecovery, hoursLeft, recoveryColor, recoveryLabel } from '../lib/recovery'
import { relTime } from '../lib/stats'
import BodyMap from '../components/BodyMap'
import SorenessCard, { usePendingSoreness } from '../components/SorenessCard'
import FootballSheet from '../components/FootballSheet'
import { Chip, Header } from '../components/ui'
import { MUSCLE_LABEL } from '../muscles'
import type { MuscleId } from '../types'
import { db } from '../db'

export default function Body() {
  const workouts = useWorkouts()
  const soreness = useSoreness()
  const activities = useActivities()
  const pending = usePendingSoreness()
  const now = useNow()
  const [view, setView] = useState<'both' | 'front' | 'back'>('both')
  const [picked, setPicked] = useState<MuscleId | null>(null)
  const [football, setFootball] = useState(false)

  const recovery = computeRecovery(workouts, soreness, activities, now)
  const colors = Object.fromEntries(Object.values(recovery).map(s => [s.muscle, recoveryColor(s.fraction)]))
  const list = Object.values(recovery).sort((a, b) => a.fraction - b.fraction)
  const sel = picked ? recovery[picked] : null
  const recentActivities = activities.filter(a => now - a.date < 7 * 86_400_000).sort((a, b) => b.date - a.date)

  return (
    <div className="space-y-4">
      <Header title="Cuerpo" subtitle="Recuperación muscular" right={<button className="text-accent text-sm font-semibold" onClick={() => setFootball(true)}>⚽ Fútbol</button>} />
      {pending && <SorenessCard workout={pending} />}
      <div className="px-4 flex gap-2">
        <Chip active={view === 'both'} onClick={() => setView('both')}>Ambos</Chip>
        <Chip active={view === 'front'} onClick={() => setView('front')}>Frente</Chip>
        <Chip active={view === 'back'} onClick={() => setView('back')}>Espalda</Chip>
      </div>
      <div className="px-4">
        <div className="card p-3">
          <BodyMap colors={colors} view={view} className={view === 'both' ? 'h-80' : 'h-96'} onPick={m => setPicked(m === picked ? null : m)} selected={picked ? new Set([picked]) : undefined} />
          <div className="flex items-center justify-center gap-2 mt-2 text-[11px] text-muted">
            <span className="w-3 h-3 rounded-full" style={{ background: recoveryColor(0) }} /> Fatigado
            <span className="w-3 h-3 rounded-full ml-2" style={{ background: recoveryColor(0.5) }} /> Recuperando
            <span className="w-3 h-3 rounded-full ml-2" style={{ background: recoveryColor(1) }} /> Listo
          </div>
          {sel && (
            <div className="mt-3 bg-surface-2 rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="font-bold">{MUSCLE_LABEL[sel.muscle]}</div>
                <div className="text-xs text-muted">{sel.lastTrainedAt ? `Entrenado ${relTime(sel.lastTrainedAt, now)} · ventana ${sel.recoveryHours} h` : 'Sin registro reciente'}</div>
              </div>
              <div className="text-right">
                <div className="font-bold" style={{ color: recoveryColor(sel.fraction) }}>{recoveryLabel(sel.fraction)}</div>
                {sel.fraction < 1 && <div className="text-xs text-muted">listo en {Math.ceil(hoursLeft(sel))} h</div>}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="px-4">
        <div className="label mb-2">Por músculo</div>
        <div className="card divide-y divide-border">
          {list.map(s => (
            <button key={s.muscle} className="w-full px-3 py-2.5 flex items-center gap-3 text-left" onClick={() => setPicked(s.muscle)}>
              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: recoveryColor(s.fraction) }} />
              <span className="flex-1 font-semibold text-sm">{MUSCLE_LABEL[s.muscle]}</span>
              <span className="text-xs text-muted">{s.fraction >= 1 ? (s.lastTrainedAt ? relTime(s.lastTrainedAt, now) : '—') : `${Math.ceil(hoursLeft(s))} h`}</span>
              <span className="w-16 h-1.5 rounded-full bg-border overflow-hidden"><span className="block h-full" style={{ width: `${s.fraction * 100}%`, background: recoveryColor(s.fraction) }} /></span>
            </button>
          ))}
        </div>
      </div>
      {recentActivities.length > 0 && (
        <div className="px-4">
          <div className="label mb-2">Actividades recientes</div>
          <div className="card divide-y divide-border">
            {recentActivities.map(a => (
              <div key={a.id} className="px-3 py-2.5 flex items-center justify-between text-sm">
                <span>⚽ {a.name} · {['', 'tranqui', 'normal', 'a morir'][a.intensity]}</span>
                <span className="text-muted text-xs">{relTime(a.date, now)}</span>
                <button className="text-bad text-xs" onClick={() => db.activities.delete(a.id)}>Borrar</button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="px-4 text-xs text-muted">Regla: 36 h base por músculo, +10 h si fue al fallo, +6/14/24 h según dolor al día siguiente. Máximo 60 h.</div>
      <FootballSheet open={football} onClose={() => setFootball(false)} />
    </div>
  )
}
