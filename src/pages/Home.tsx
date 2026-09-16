import { useState } from 'react'
import { motion } from 'motion/react'
import { db, uid } from '../db'
import { useActiveWorkout, useActivities, useDays, useExercises, useNow, useSoreness, useWorkouts } from '../hooks'
import { computeRecovery, recoveryColor } from '../lib/recovery'
import { fmtDateLong, fmtKg, lastFor, relTime, startOfWeek, totalVolume } from '../lib/stats'
import BodyMap from '../components/BodyMap'
import SorenessCard, { usePendingSoreness } from '../components/SorenessCard'
import FootballSheet from '../components/FootballSheet'
import { Sheet, confirmDlg } from '../components/ui'
import { Item, Press, Ring, Stagger, itemVariants } from '../components/motion'
import { IconBall, IconChevron, IconDumbbell } from '../components/icons'
import { MUSCLE_LABEL } from '../muscles'
import type { RoutineDay, SetEntry, Workout } from '../types'

const WEEK_GOAL = 4

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
    await db.workouts.add({ id: uid(), dayId: day?.id, name: day ? `${day.emoji} ${day.name}` : 'Libre', startedAt: Date.now(), entries, muscles: [], failureMuscles: [] })
    onOpenWorkout()
  }

  const finished = workouts.filter(w => w.finishedAt)
  const recent = [...finished].sort((a, b) => b.finishedAt! - a.finishedAt!).slice(0, 6)
  const weekStart = startOfWeek(now)
  const thisWeek = finished.filter(w => w.finishedAt! >= weekStart).length
  const exName = (id: string) => exercises.find(e => e.id === id)?.name ?? '—'
  const fatigued = Object.values(recovery).filter(s => s.fraction < 1).sort((a, b) => a.fraction - b.fraction)
  const dateLabel = new Date(now).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  const hour = new Date(now).getHours()
  const greet = hour < 12 ? 'Buen día' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  const dayCard = 'card shrink-0 w-[136px] p-4 text-left'
  const iconBox = 'w-11 h-11 rounded-2xl flex items-center justify-center mb-3'

  return (
    <Stagger className="space-y-7">
      <Item className="px-5 pt-4 flex items-center justify-between">
        <div>
          <div className="label">{dateLabel}</div>
          <h1 className="text-[32px] leading-tight font-extrabold tracking-tight">{greet}</h1>
        </div>
        <Ring value={thisWeek / WEEK_GOAL} size={58} stroke={5}>
          <div className="text-center leading-none">
            <div className="text-lg font-extrabold">{thisWeek}</div>
            <div className="text-[9px] text-muted font-bold">/{WEEK_GOAL}</div>
          </div>
        </Ring>
      </Item>

      {pending && <Item><SorenessCard workout={pending} /></Item>}

      <Item>
        <div className="px-5 mb-3 label">Empezar</div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-5">
          {days.map(d => (
            <Press key={d.id} onClick={() => start(d)} className={dayCard}>
              <div className={`${iconBox} bg-surface-3 text-2xl`}>{d.emoji}</div>
              <div className="font-extrabold text-[17px] leading-tight">{d.name}</div>
              <div className="text-muted text-xs mt-0.5">{d.exerciseIds.length} ejercicios</div>
            </Press>
          ))}
          <Press onClick={() => start()} className={`${dayCard} border-dashed`}>
            <div className={`${iconBox} bg-accent/15 text-accent`}><IconDumbbell /></div>
            <div className="font-extrabold text-[17px] leading-tight">Libre</div>
            <div className="text-muted text-xs mt-0.5">sobre la marcha</div>
          </Press>
          <Press onClick={() => setFootball(true)} className={dayCard}>
            <div className={`${iconBox} bg-good/15 text-good`}><IconBall /></div>
            <div className="font-extrabold text-[17px] leading-tight">Fútbol</div>
            <div className="text-muted text-xs mt-0.5">registrar partido</div>
          </Press>
          <div className="shrink-0 w-2" />
        </div>
      </Item>

      <Item className="px-5">
        <div className="flex items-center justify-between mb-3">
          <div className="label">Estado muscular</div>
          <button className="text-accent text-sm font-bold flex items-center gap-0.5 h-8 -mr-1 px-1" onClick={goBody}>Ver detalle <IconChevron size={16} /></button>
        </div>
        <Press className="card p-4 w-full text-left" onClick={goBody}>
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
        </Press>
      </Item>

      <Item className="px-5">
        <div className="label mb-3">Últimos entrenamientos</div>
        {recent.length === 0 && <div className="card p-6 text-muted text-sm text-center leading-relaxed">Todavía no hay entrenamientos.<br />Elegí un día arriba y arrancá.</div>}
        <div className="space-y-2">
          {recent.map(w => (
            <motion.div key={w.id} variants={itemVariants}>
              <Press onClick={() => setDetail(w)} className="card w-full p-3.5 text-left flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-surface-3 flex items-center justify-center text-xl shrink-0">{/\p{Emoji}/u.test(w.name.split(' ')[0]) ? w.name.split(' ')[0] : <IconDumbbell size={20} className="text-muted" />}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold truncate">{w.name.replace(/^\p{Emoji}\S*\s*/u, '')}</div>
                  <div className="text-muted text-xs">{w.entries.length} ejercicios · {fmtKg(totalVolume(w))} kg</div>
                </div>
                <div className="text-muted text-xs font-semibold">{relTime(w.finishedAt!, now)}</div>
                <IconChevron size={16} className="text-muted -mr-1" />
              </Press>
            </motion.div>
          ))}
        </div>
      </Item>

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
    </Stagger>
  )
}
