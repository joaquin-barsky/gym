import { useState } from 'react'
import { motion } from 'motion/react'
import { db, uid } from '../db'
import { useActiveWorkout, useActivities, useDays, useExercises, useNow, useSoreness, useWorkouts } from '../hooks'
import { computeRecovery, recoveryColor } from '../lib/recovery'
import { fmtDateLong, fmtKg, lastFor, relTime, startOfWeek, totalVolume } from '../lib/stats'
import { randomPhrase } from '../data/phrases'
import BodyMap from '../components/BodyMap'
import SorenessCard, { usePendingSoreness } from '../components/SorenessCard'
import FootballSheet from '../components/FootballSheet'
import { Sheet, confirmDlg } from '../components/ui'
import { Item, Press, Stagger, itemVariants } from '../components/motion'
import { IconBall, IconCheck, IconChevron, IconDumbbell, IconFlame } from '../components/icons'
import { MUSCLE_LABEL } from '../muscles'
import type { RoutineDay, SetEntry, Workout } from '../types'

function weekStreak(finishedAt: number[], now: number): number {
  const weeks = new Set(finishedAt.map(t => startOfWeek(t)))
  let streak = 0
  let w = startOfWeek(now)
  if (!weeks.has(w)) w -= 7 * 86_400_000 // la semana actual todavía puede sumarse
  while (weeks.has(w)) { streak++; w -= 7 * 86_400_000 }
  return streak
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="card flex-1 p-3.5 min-w-0">
      <div className="text-accent mb-2">{icon}</div>
      <div className="text-[20px] font-extrabold leading-none tabular-nums truncate">{value}</div>
      <div className="text-[11px] text-muted font-semibold mt-1 truncate">{label}</div>
    </div>
  )
}

export default function Home({ onOpenWorkout, goBody }: { onOpenWorkout: () => void; goBody: () => void }) {
  const days = useDays()
  const workouts = useWorkouts()
  const exercises = useExercises()
  const soreness = useSoreness()
  const activities = useActivities()
  const active = useActiveWorkout()
  const pending = usePendingSoreness()
  const now = useNow()
  const [phrase] = useState(randomPhrase)
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
  const thisWeek = finished.filter(w => w.finishedAt! >= weekStart)
  const weekVolume = thisWeek.reduce((a, w) => a + totalVolume(w), 0)
  const streak = weekStreak(finished.map(w => w.finishedAt!), now)
  const exName = (id: string) => exercises.find(e => e.id === id)?.name ?? '—'
  const fatigued = Object.values(recovery).filter(s => s.fraction < 1).sort((a, b) => a.fraction - b.fraction)
  const dateLabel = new Date(now).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })

  const pill = 'h-11 px-4 rounded-full font-bold text-[15px] flex items-center gap-2 bg-on-accent text-accent'

  return (
    <div className="glow">
      <Stagger className="space-y-6">
        <Item className="px-5 pt-5">
          <div className="label">{dateLabel}</div>
          <h1 className="text-[28px] leading-[1.15] font-extrabold tracking-tight mt-1.5 pr-4">{phrase}</h1>
        </Item>

        {pending && <Item><SorenessCard workout={pending} /></Item>}

        <Item className="px-5 flex gap-2.5">
          <Stat icon={<IconDumbbell size={18} />} value={String(thisWeek.length)} label="esta semana" />
          <Stat icon={<IconFlame size={18} />} value={`${streak} sem`} label="racha" />
          <Stat icon={<IconChevron size={18} className="-rotate-90" />} value={`${fmtKg(Math.round(weekVolume))} kg`} label="volumen sem." />
        </Item>

        <Item className="px-5">
          <div className="bg-accent text-on-accent rounded-[28px] p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.14em] font-bold opacity-70">Entrenar</div>
                <div className="text-[24px] font-extrabold leading-tight mt-1">¿Qué toca hoy?</div>
              </div>
              <div className="w-11 h-11 rounded-full bg-on-accent/15 flex items-center justify-center"><IconDumbbell size={22} /></div>
            </div>
            <div className="flex flex-wrap gap-2 mt-5">
              {days.map(d => (
                <Press key={d.id} onClick={() => start(d)} className={pill}><span>{d.emoji}</span>{d.name}</Press>
              ))}
              <Press onClick={() => start()} className="h-11 px-4 rounded-full font-bold text-[15px] flex items-center gap-2 border-2 border-on-accent/30 text-on-accent">Libre</Press>
              <Press onClick={() => setFootball(true)} className="h-11 px-4 rounded-full font-bold text-[15px] flex items-center gap-2 border-2 border-on-accent/30 text-on-accent"><IconBall size={18} /> Fútbol</Press>
            </div>
          </div>
        </Item>

        <Item className="px-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[17px] font-extrabold">Estado muscular</div>
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
            ) : <div className="text-center text-muted text-sm font-semibold mt-2">Todo recuperado</div>}
          </Press>
        </Item>

        <Item className="px-5">
          <div className="text-[17px] font-extrabold mb-3">Últimos entrenamientos</div>
          {recent.length === 0 && <div className="card p-6 text-muted text-sm text-center leading-relaxed">Todavía no hay entrenamientos.<br />Elegí un día arriba y arrancá.</div>}
          <div className="space-y-2">
            {recent.map(w => (
              <motion.div key={w.id} variants={itemVariants}>
                <Press onClick={() => setDetail(w)} className="card w-full p-3 pl-3.5 text-left flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-surface-3 flex items-center justify-center text-xl shrink-0">{/\p{Emoji}/u.test(w.name.split(' ')[0]) ? w.name.split(' ')[0] : <IconDumbbell size={20} className="text-muted" />}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold truncate">{w.name.replace(/^\p{Emoji}\S*\s*/u, '')}</div>
                    <div className="text-muted text-xs">{relTime(w.finishedAt!, now)} · {w.entries.length} ejercicios · {fmtKg(totalVolume(w))} kg</div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-accent text-on-accent flex items-center justify-center shrink-0"><IconCheck size={18} /></div>
                </Press>
              </motion.div>
            ))}
          </div>
        </Item>
      </Stagger>

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
                    <div className="font-extrabold tabular-nums">{fmtKg(e.weight)} kg × {e.reps}</div>
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
