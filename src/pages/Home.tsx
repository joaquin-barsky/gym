import { useState } from 'react'
import { db, uid } from '../db'
import { useActiveWorkout, useActivities, useDays, useExercises, useNow, useSoreness, useWorkouts } from '../hooks'
import { computeRecovery, recoveryColor } from '../lib/recovery'
import { fmtDateLong, fmtKg, lastFor, relTime, startOfWeek, totalVolume } from '../lib/stats'
import BodyMap from '../components/BodyMap'
import SorenessCard, { usePendingSoreness } from '../components/SorenessCard'
import FootballSheet from '../components/FootballSheet'
import { Sheet, confirmDlg } from '../components/ui'
import { MUSCLE_LABEL } from '../muscles'
import type { RoutineDay, SetEntry, Workout } from '../types'

export default function Home({ onOpenWorkout, goBody }: { onOpenWorkout: () => void; goBody: () => void }) {
  const days = useDays()
  const workouts = useWorkouts()
  const exercises = useExercises()
  const soreness = useSoreness()
  const activities = useActivities()
  const active = useActiveWorkout()
  const pending = usePendingSoreness()
  const now = useNow()
  const [football, setFootball] = useState(false)
  const [detail, setDetail] = useState<Workout | null>(null)

  const recovery = computeRecovery(workouts, soreness, activities, now)
  const colors = Object.fromEntries(Object.values(recovery).map(s => [s.muscle, recoveryColor(s.fraction)]))

  const start = async (day?: RoutineDay) => {
    if (active) { onOpenWorkout(); return }
    const entries: SetEntry[] = (day?.exerciseIds ?? []).map(exerciseId => {
      const last = lastFor(exerciseId, workouts)
      return { exerciseId, weight: last?.weight ?? 0, reps: last?.reps ?? 0, sets: last?.sets ?? 3, toFailure: false }
    })
    await db.workouts.add({ id: uid(), dayId: day?.id, name: day ? `${day.emoji} ${day.name}` : '💪 Libre', startedAt: Date.now(), entries, muscles: [], failureMuscles: [] })
    onOpenWorkout()
  }

  const finished = workouts.filter(w => w.finishedAt)
  const recent = [...finished].sort((a, b) => b.finishedAt! - a.finishedAt!).slice(0, 6)
  const weekStart = startOfWeek(now)
  const thisWeek = finished.filter(w => w.finishedAt! >= weekStart).length
  const exName = (id: string) => exercises.find(e => e.id === id)?.name ?? '—'
  const fatigued = Object.values(recovery).filter(s => s.fraction < 1).sort((a, b) => a.fraction - b.fraction)
  const dateLabel = new Date(now).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="space-y-6">
      <div className="px-5 pt-4 flex items-end justify-between">
        <div>
          <div className="label">{dateLabel}</div>
          <h1 className="text-[32px] leading-tight font-extrabold tracking-tight">Hoy</h1>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold leading-none">{thisWeek}</div>
          <div className="text-[11px] text-muted font-semibold">esta semana</div>
        </div>
      </div>

      {pending && <SorenessCard workout={pending} />}

      <section>
        <div className="px-5 flex items-center justify-between mb-3">
          <div className="label">Empezar</div>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 snap-x">
          {days.map(d => (
            <button key={d.id} onClick={() => start(d)} className="card snap-start shrink-0 w-[132px] p-4 text-left active:scale-[0.97] transition-transform">
              <div className="w-11 h-11 rounded-2xl bg-surface-3 flex items-center justify-center text-2xl mb-3">{d.emoji}</div>
              <div className="font-extrabold text-[17px] leading-tight">{d.name}</div>
              <div className="text-muted text-xs mt-0.5">{d.exerciseIds.length} ejercicios</div>
            </button>
          ))}
          <button onClick={() => start()} className="card snap-start shrink-0 w-[132px] p-4 text-left active:scale-[0.97] transition-transform border-dashed">
            <div className="w-11 h-11 rounded-2xl bg-surface-3 flex items-center justify-center text-2xl mb-3">💪</div>
            <div className="font-extrabold text-[17px] leading-tight">Libre</div>
            <div className="text-muted text-xs mt-0.5">sobre la marcha</div>
          </button>
          <button onClick={() => setFootball(true)} className="card snap-start shrink-0 w-[132px] p-4 text-left active:scale-[0.97] transition-transform">
            <div className="w-11 h-11 rounded-2xl bg-surface-3 flex items-center justify-center text-2xl mb-3">⚽</div>
            <div className="font-extrabold text-[17px] leading-tight">Fútbol</div>
            <div className="text-muted text-xs mt-0.5">registrar partido</div>
          </button>
          <div className="shrink-0 w-2" />
        </div>
      </section>

      <section className="px-5">
        <div className="flex items-center justify-between mb-3">
          <div className="label">Estado muscular</div>
          <button className="text-accent text-sm font-bold" onClick={goBody}>Ver detalle →</button>
        </div>
        <div className="card p-4" onClick={goBody}>
          <BodyMap colors={colors} className="h-64" />
          {fatigued.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
              {fatigued.slice(0, 6).map(s => (
                <span key={s.muscle} className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: recoveryColor(s.fraction) + '26', color: recoveryColor(s.fraction) }}>
                  {MUSCLE_LABEL[s.muscle]}
                </span>
              ))}
            </div>
          ) : <div className="text-center text-good text-sm font-bold mt-2">Todo recuperado</div>}
        </div>
      </section>

      <section className="px-5">
        <div className="label mb-3">Últimos entrenamientos</div>
        {recent.length === 0 && <div className="card p-5 text-muted text-sm text-center">Todavía no hay entrenamientos.<br />Elegí un día arriba y arrancá.</div>}
        <div className="space-y-2">
          {recent.map(w => (
            <button key={w.id} onClick={() => setDetail(w)} className="card w-full p-3.5 text-left flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-surface-3 flex items-center justify-center text-xl shrink-0">{w.name.split(' ')[0]}</div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold truncate">{w.name.split(' ').slice(1).join(' ') || w.name}</div>
                <div className="text-muted text-xs">{w.entries.length} ejercicios · {fmtKg(totalVolume(w))} kg</div>
              </div>
              <div className="text-muted text-xs font-semibold">{relTime(w.finishedAt!, now)}</div>
            </button>
          ))}
        </div>
      </section>

      <FootballSheet open={football} onClose={() => setFootball(false)} />

      <Sheet open={!!detail} onClose={() => setDetail(null)} title={detail?.name}>
        {detail && (
          <div className="space-y-4">
            <div className="text-muted text-sm">{fmtDateLong(detail.finishedAt!)} · Volumen {fmtKg(totalVolume(detail))} kg</div>
            <div className="card divide-y divide-border">
              {detail.entries.map((e, i) => (
                <div key={i} className="px-4 py-3 flex justify-between items-center">
                  <div className="font-semibold">{exName(e.exerciseId)}</div>
                  <div className="text-right">
                    <div className="font-extrabold">{fmtKg(e.weight)} kg × {e.reps}</div>
                    <div className="text-xs text-muted">{e.sets} series{e.toFailure ? ' · al fallo' : ''}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">{detail.muscles.map(m => <span key={m} className="text-xs bg-surface-2 border border-border rounded-full px-2.5 py-1">{MUSCLE_LABEL[m]}</span>)}</div>
            {detail.note && <div className="text-sm text-muted italic">“{detail.note}”</div>}
            <button className="btn-danger w-full" onClick={async () => {
              if (!confirmDlg('¿Borrar este entrenamiento?')) return
              await db.workouts.delete(detail.id)
              await db.soreness.where('workoutId').equals(detail.id).delete()
              setDetail(null)
            }}>Borrar entrenamiento</button>
          </div>
        )}
      </Sheet>
    </div>
  )
}
