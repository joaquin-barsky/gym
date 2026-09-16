import { useState } from 'react'
import { db, uid } from '../db'
import { useSetting, useSoreness, useWorkouts } from '../hooks'
import { MUSCLE_LABEL } from '../muscles'
import type { MuscleId, Workout } from '../types'
import { fmtDateLong } from '../lib/stats'

const LEVELS: { v: 0 | 1 | 2 | 3; label: string; color: string }[] = [
  { v: 0, label: 'Nada', color: '#2fd27a' },
  { v: 1, label: 'Poco', color: '#b8e04a' },
  { v: 2, label: 'Bastante', color: '#ffc233' },
  { v: 3, label: 'Mucho', color: '#ff4d5e' },
]

export function usePendingSoreness(): Workout | undefined {
  const workouts = useWorkouts()
  const soreness = useSoreness()
  const dismissed = useSetting<string[]>('soreness_dismissed', [])
  const now = Date.now()
  const answered = new Set(soreness.map(s => s.workoutId))
  return workouts
    .filter(w => w.finishedAt && w.muscles.length > 0)
    .filter(w => now - w.finishedAt! > 10 * 3_600_000 && now - w.finishedAt! < 60 * 3_600_000)
    .filter(w => !answered.has(w.id) && !dismissed.includes(w.id))
    .sort((a, b) => b.finishedAt! - a.finishedAt!)[0]
}

export default function SorenessCard({ workout }: { workout: Workout }) {
  const [levels, setLevels] = useState<Partial<Record<MuscleId, 0 | 1 | 2 | 3>>>({})
  const dismissed = useSetting<string[]>('soreness_dismissed', [])

  const save = async () => {
    const now = Date.now()
    await db.soreness.bulkAdd(workout.muscles.map(m => ({ id: uid(), workoutId: workout.id, muscle: m, level: levels[m] ?? 0, createdAt: now })))
  }
  const skip = () => db.settings.put({ key: 'soreness_dismissed', value: [...dismissed, workout.id] })

  return (
    <div className="card p-4 mx-5 border-accent/40">
      <div className="font-bold text-base">¿Cómo tenés los músculos? 🤕</div>
      <div className="text-muted text-sm mb-3">Del entrenamiento {workout.name} · {fmtDateLong(workout.finishedAt!)}</div>
      <div className="space-y-2">
        {workout.muscles.map(m => (
          <div key={m} className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold w-24 shrink-0">{MUSCLE_LABEL[m]}</div>
            <div className="flex gap-1 flex-1 justify-end">
              {LEVELS.map(l => {
                const on = (levels[m] ?? 0) === l.v
                return (
                  <button key={l.v} onClick={() => setLevels({ ...levels, [m]: l.v })}
                    style={on ? { background: l.color, color: '#0b0f14', borderColor: l.color } : undefined}
                    className="text-[11px] font-bold px-2 py-1.5 rounded-lg border border-border bg-surface-2 text-muted">
                    {l.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <button className="btn-ghost flex-1" onClick={skip}>Omitir</button>
        <button className="btn-primary flex-1" onClick={save}>Guardar</button>
      </div>
    </div>
  )
}
