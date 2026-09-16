import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { db, uid } from '../db'
import { useActiveWorkout, useActivities, useDays, useExercises, useNow, useSoreness, useWorkouts } from '../hooks'
import { computeRecovery, recoveryColor } from '../lib/recovery'
import { fmtDateLong, fmtKg, lastFor, recentPRs, relTime, startOfWeek, totalVolume, volumePerWeek, weekDays } from '../lib/stats'
import BodyMap from '../components/BodyMap'
import Ambient from '../components/Ambient'
import SorenessCard, { usePendingSoreness } from '../components/SorenessCard'
import { Sheet, confirmDlg } from '../components/ui'
import { Item, Press, Ring, Stagger, itemVariants, spring } from '../components/motion'
import { IconCheck, IconChevron, IconDumbbell, IconFlame, IconTrophy } from '../components/icons'
import { V2_REFERENCE } from '../data/routineV2'
import { MUSCLE_LABEL } from '../muscles'
import type { RoutineDay, SetEntry, Workout } from '../types'

const WEEK_GOAL = 4
const DAY_LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

function weekStreak(finishedAt: number[], now: number): number {
  const weeks = new Set(finishedAt.map(t => startOfWeek(t)))
  let streak = 0
  let w = startOfWeek(now)
  if (!weeks.has(w)) w -= 7 * 86_400_000
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

function VolumeBars({ data }: { data: { week: number; volume: number }[] }) {
  const max = Math.max(1, ...data.map(d => d.volume))
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((d, i) => {
        const h = Math.max(0.06, d.volume / max)
        const last = i === data.length - 1
        return (
          <div key={d.week} className="flex-1 h-full flex items-end">
            <motion.div className={`w-full rounded-md ${last ? 'bg-accent' : 'bg-surface-3'}`} style={{ originY: 1, height: `${h * 100}%` }}
              initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ ...spring, delay: 0.1 + i * 0.05 }} />
          </div>
        )
      })}
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
  const [detail, setDetail] = useState<Workout | null>(null)
  const [picked, setPicked] = useState<string[]>([])

  const recovery = computeRecovery(workouts, soreness, activities, now)
  const colors = Object.fromEntries(Object.values(recovery).map(s => [s.muscle, recoveryColor(s.fraction)]))
  const fraction = Object.fromEntries(Object.values(recovery).map(s => [s.muscle, s.fraction]))

  const start = async (selected: RoutineDay[]) => {
    if (active) { onOpenWorkout(); return }
    const ids = [...new Set(selected.flatMap(d => d.exerciseIds))]
    const entries: SetEntry[] = ids.map(exerciseId => {
      const last = lastFor(exerciseId, workouts)
      const ref = V2_REFERENCE[exerciseId]
      return { exerciseId, weight: last?.weight ?? ref?.weight ?? 0, reps: last?.reps ?? ref?.reps ?? 0, sets: last?.sets ?? ref?.sets ?? 3, toFailure: false }
    })
    const name = selected.length ? selected.map(d => d.name).join(' · ') : 'Libre'
    await db.workouts.add({ id: uid(), dayId: selected[0]?.id, name, startedAt: Date.now(), entries, muscles: [], failureMuscles: [] })
    setPicked([])
    onOpenWorkout()
  }
  const toggle = (id: string) => setPicked(p => (p.includes(id) ? p.filter(x => x !== id) : [...p, id]))
  const pickedDays = days.filter(d => picked.includes(d.id))

  const finished = workouts.filter(w => w.finishedAt)
  const recent = [...finished].sort((a, b) => b.finishedAt! - a.finishedAt!).slice(0, 5)
  const weekStart = startOfWeek(now)
  const thisWeek = finished.filter(w => w.finishedAt! >= weekStart)
  const weekVolume = thisWeek.reduce((a, w) => a + totalVolume(w), 0)
  const streak = weekStreak(finished.map(w => w.finishedAt!), now)
  const exName = (id: string) => exercises.find(e => e.id === id)?.name ?? '—'
  const fatigued = Object.values(recovery).filter(s => s.fraction < 1).sort((a, b) => a.fraction - b.fraction)
  const dateLabel = new Date(now).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  const week = weekDays(workouts, now)
  const vol8 = volumePerWeek(workouts, 8)
  const prs = recentPRs(workouts, 3)
  const prevWeekVol = vol8[vol8.length - 2]?.volume ?? 0
  const volDelta = prevWeekVol > 0 ? Math.round(((weekVolume - prevWeekVol) / prevWeekVol) * 100) : null

  return (
    <div className="relative">
      <Ambient />
      <Stagger className="relative space-y-6">
        <Item className="px-5 pt-5 flex items-end justify-between">
          <div>
            <div className="label">{dateLabel}</div>
            <h1 className="text-[34px] leading-none font-extrabold tracking-tight mt-1.5">Hoy</h1>
          </div>
          <Ring value={thisWeek.length / WEEK_GOAL} size={64} stroke={6}>
            <div className="text-center leading-none">
              <div className="text-xl font-extrabold tabular-nums">{thisWeek.length}</div>
              <div className="text-[9px] text-muted font-bold">de {WEEK_GOAL}</div>
            </div>
          </Ring>
        </Item>

        <Item className="px-5">
          <div className="card px-4 py-3.5 flex justify-between">
            {week.map((d, i) => (
              <div key={d.date} className="flex flex-col items-center gap-1.5">
                <div className={`text-[11px] font-bold ${d.today ? 'text-text' : 'text-muted'}`}>{DAY_LETTERS[i]}</div>
                <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...spring, delay: 0.15 + i * 0.04 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${d.trained ? 'bg-accent border-accent text-on-accent' : d.today ? 'border-accent text-accent' : d.future ? 'border-border text-border' : 'border-surface-3 text-muted'}`}>
                  {d.trained ? <IconCheck size={15} /> : <span className="text-[11px] font-bold tabular-nums">{new Date(d.date).getDate()}</span>}
                </motion.div>
              </div>
            ))}
          </div>
        </Item>

        {pending && <Item><SorenessCard workout={pending} /></Item>}

        <Item className="px-5">
          <div className="bg-accent text-on-accent rounded-[28px] p-5 shadow-[0_24px_60px_-24px_var(--color-accent)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.14em] font-bold opacity-70">Entrenar</div>
                <div className="text-[24px] font-extrabold leading-tight mt-1">¿Qué toca hoy?</div>
                <div className="text-sm opacity-70 mt-1">Elegí uno o varios músculos.</div>
              </div>
              <div className="w-11 h-11 rounded-full bg-on-accent/15 flex items-center justify-center shrink-0"><IconDumbbell size={22} /></div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {days.map(d => {
                const on = picked.includes(d.id)
                return (
                  <Press key={d.id} onClick={() => toggle(d.id)} aria-pressed={on}
                    className={`h-11 px-4 rounded-full font-bold text-[15px] flex items-center gap-2 border-2 transition-colors ${on ? 'bg-on-accent text-accent border-on-accent' : 'border-on-accent/30 text-on-accent'}`}>
                    <span>{d.emoji}</span>{d.name}
                  </Press>
                )
              })}
            </div>
            <div className="mt-4 flex gap-2">
              <AnimatePresence mode="popLayout" initial={false}>
                {pickedDays.length > 0 ? (
                  <motion.div key="go" className="flex-1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={spring}>
                    <Press onClick={() => start(pickedDays)} className="w-full h-14 rounded-full bg-on-accent text-accent font-extrabold text-base flex items-center justify-center gap-2">
                      Empezar {pickedDays.map(d => d.name).join(' + ')} <IconChevron size={18} />
                    </Press>
                  </motion.div>
                ) : (
                  <motion.div key="free" className="flex-1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={spring}>
                    <Press onClick={() => start([])} className="w-full h-12 rounded-full border-2 border-on-accent/30 text-on-accent font-bold text-[15px] flex items-center justify-center gap-2">
                      Entrenamiento libre <IconChevron size={18} />
                    </Press>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Item>

        <Item className="px-5 flex gap-2.5">
          <Stat icon={<IconDumbbell size={18} />} value={String(thisWeek.length)} label="esta semana" />
          <Stat icon={<IconFlame size={18} />} value={`${streak} sem`} label="racha" />
          <Stat icon={<IconTrophy size={18} />} value={String(prs.length)} label="récords" />
        </Item>

        <Item className="px-5">
          <div className="card p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="label">Volumen · 8 semanas</div>
                <div className="text-[22px] font-extrabold leading-tight mt-1 tabular-nums">{fmtKg(Math.round(weekVolume))} <span className="text-sm text-muted font-bold">kg esta semana</span></div>
              </div>
              {volDelta !== null && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${volDelta >= 0 ? 'bg-good/15 text-good' : 'bg-bad/15 text-bad'}`}>{volDelta >= 0 ? '+' : ''}{volDelta}%</span>
              )}
            </div>
            <VolumeBars data={vol8} />
          </div>
        </Item>

        <Item className="px-5">
          <div className="card p-4">
            <div className="text-[17px] font-extrabold flex items-center gap-2 mb-3"><IconTrophy size={18} className="text-accent" /> Récords recientes</div>
            {prs.length === 0 ? (
              <div className="text-muted text-sm leading-relaxed">Todavía no hay récords. Cuando superes tu mejor marca en un ejercicio, aparece acá.</div>
            ) : (
              <div className="space-y-2.5">
                {prs.map(p => (
                  <div key={p.workoutId + p.exerciseId} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-accent/15 text-accent flex items-center justify-center shrink-0"><IconTrophy size={16} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate">{exName(p.exerciseId)}</div>
                      <div className="text-xs text-muted">{relTime(p.date, now)}</div>
                    </div>
                    <div className="font-extrabold tabular-nums">{fmtKg(p.weight)} kg × {p.reps}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Item>

        <Item className="px-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[17px] font-extrabold">Estado muscular</div>
            <button className="text-accent text-sm font-bold flex items-center gap-0.5 h-8 -mr-1 px-1" onClick={goBody}>Ver detalle <IconChevron size={16} /></button>
          </div>
          <Press className="card p-4 w-full text-left" onClick={goBody}>
            <BodyMap colors={colors} fraction={fraction} className="h-64" />
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
          {recent.length === 0 && <div className="card p-6 text-muted text-sm text-center leading-relaxed">Todavía no hay entrenamientos.<br />Elegí un músculo arriba y arrancá.</div>}
          <div className="space-y-2">
            {recent.map(w => (
              <motion.div key={w.id} variants={itemVariants}>
                <Press onClick={() => setDetail(w)} className="card w-full p-3 pl-3.5 text-left flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-surface-3 flex items-center justify-center shrink-0"><IconDumbbell size={20} className="text-muted" /></div>
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
