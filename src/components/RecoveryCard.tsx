import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { db } from '../db'
import { useActivities, useNow, useSoreness, useWorkouts } from '../hooks'
import { computeRecovery, hoursLeft, recoveryColor, recoveryLabel } from '../lib/recovery'
import { relTime } from '../lib/stats'
import { MUSCLE_LABEL } from '../muscles'
import type { MuscleId } from '../types'
import BodyMap from './BodyMap'
import ActivitySheet, { ActivityIcon, activityLevel, type ActivityKind } from './ActivitySheet'
import { Press, spring } from './motion'
import { IconBall, IconChevron, IconGrip, IconX } from './icons'

/** Estado muscular en Inicio: muñequito, detalle por músculo, fútbol y actividades. */
export default function RecoveryCard() {
  const workouts = useWorkouts()
  const soreness = useSoreness()
  const activities = useActivities()
  const now = useNow()
  const [picked, setPicked] = useState<MuscleId | null>(null)
  const [open, setOpen] = useState(false)
  const [sheet, setSheet] = useState<ActivityKind | null>(null)

  const recovery = computeRecovery(workouts, soreness, activities, now)
  const colors = Object.fromEntries(Object.values(recovery).map(s => [s.muscle, recoveryColor(s.fraction)]))
  const fraction = Object.fromEntries(Object.values(recovery).map(s => [s.muscle, s.fraction]))
  const list = Object.values(recovery).sort((a, b) => a.fraction - b.fraction)
  const fatigued = list.filter(s => s.fraction < 1)
  const sel = picked ? recovery[picked] : null
  const recentActivities = activities.filter(a => now - a.date < 7 * 86_400_000).sort((a, b) => b.date - a.date)

  const onPick = (ids: MuscleId[]) => {
    const worst = [...ids].sort((a, b) => (fraction[a] ?? 1) - (fraction[b] ?? 1))[0]
    setPicked(p => (p && ids.includes(p) ? null : worst))
  }

  return (
    <div>
      <div className="text-[17px] font-extrabold mb-3">Estado muscular</div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <Press onClick={() => setSheet('forearm')} className="h-11 rounded-full bg-warn/12 border border-warn/25 text-warn text-sm font-bold flex items-center justify-center gap-1.5">
          <IconGrip size={17} /> Antebrazo
        </Press>
        <Press onClick={() => setSheet('football')} className="h-11 rounded-full bg-good/12 border border-good/25 text-good text-sm font-bold flex items-center justify-center gap-1.5">
          <IconBall size={17} /> Fútbol
        </Press>
      </div>

      <div className="card p-4">
        <BodyMap colors={colors} fraction={fraction} className="h-72" onPick={onPick} selected={picked ? new Set([picked]) : undefined} />

        <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-muted font-semibold">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: recoveryColor(0) }} />Fatigado</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: recoveryColor(0.5) }} />Recuperando</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border border-muted/40" style={{ background: recoveryColor(1) }} />Listo</span>
        </div>

        <AnimatePresence initial={false}>
          {sel && (
            <motion.div key={sel.muscle} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={spring} className="overflow-hidden">
              <div className="mt-3 bg-surface-2 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-extrabold">{MUSCLE_LABEL[sel.muscle]}</div>
                  <div className="text-xs text-muted">{sel.lastTrainedAt ? `Entrenado ${relTime(sel.lastTrainedAt, now)} · ventana ${sel.recoveryHours} h` : 'Sin registro reciente'}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-extrabold" style={{ color: sel.fraction >= 1 ? 'var(--color-text)' : recoveryColor(sel.fraction) }}>{recoveryLabel(sel.fraction)}</div>
                  {sel.fraction < 1 && <div className="text-xs text-muted">listo en {Math.ceil(hoursLeft(sel))} h</div>}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!sel && (
          fatigued.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
              {fatigued.slice(0, 6).map(s => (
                <button key={s.muscle} onClick={() => setPicked(s.muscle)} className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: recoveryColor(s.fraction) + '26', color: recoveryColor(s.fraction) }}>
                  {MUSCLE_LABEL[s.muscle]} · {Math.ceil(hoursLeft(s))} h
                </button>
              ))}
            </div>
          ) : <div className="text-center text-muted text-sm font-semibold mt-3">Todo recuperado. Tocá un músculo para ver el detalle.</div>
        )}

        <button onClick={() => setOpen(o => !o)} className="mt-3 w-full h-11 rounded-full bg-surface-2 border border-border text-sm font-bold text-muted flex items-center justify-center gap-1">
          {open ? 'Ocultar detalle' : 'Ver por músculo'}
          <motion.span animate={{ rotate: open ? -90 : 90 }} transition={spring} className="flex"><IconChevron size={16} /></motion.span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={spring} className="overflow-hidden">
              <div className="mt-3 divide-y divide-border">
                {list.map(s => (
                  <button key={s.muscle} onClick={() => setPicked(p => (p === s.muscle ? null : s.muscle))}
                    className={`w-full px-1 h-12 flex items-center gap-3 text-left rounded-xl transition-colors ${picked === s.muscle ? 'bg-white/5' : ''}`}>
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-muted/30" style={{ background: recoveryColor(s.fraction) }} />
                    <span className="flex-1 font-bold text-sm">{MUSCLE_LABEL[s.muscle]}</span>
                    <span className="text-xs text-muted tabular-nums">{s.fraction >= 1 ? (s.lastTrainedAt ? relTime(s.lastTrainedAt, now) : '—') : `${Math.ceil(hoursLeft(s))} h`}</span>
                    <span className="w-14 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                      <span className="block h-full rounded-full" style={{ width: `${s.fraction * 100}%`, background: s.fraction >= 1 ? 'var(--color-muted)' : recoveryColor(s.fraction) }} />
                    </span>
                  </button>
                ))}
              </div>
              {recentActivities.length > 0 && (
                <div className="mt-4">
                  <div className="label mb-2">Actividades recientes</div>
                  <div className="divide-y divide-border">
                    {recentActivities.map(a => (
                      <div key={a.id} className="h-12 flex items-center justify-between text-sm gap-3">
                        <span className="flex items-center gap-2 font-bold"><ActivityIcon type={a.type} />{a.name} <span className="text-muted font-medium">· {activityLevel(a)}</span></span>
                        <span className="text-muted text-xs">{relTime(a.date, now)}</span>
                        <button className="text-muted w-9 h-9 -mr-2 flex items-center justify-center" onClick={() => db.activities.delete(a.id)} aria-label="Borrar actividad"><IconX size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="text-[11px] text-muted leading-relaxed mt-3">36 h base por músculo, +10 h si fue al fallo, +6/14/24 h según el dolor al día siguiente. Máximo 60 h.</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ActivitySheet kind={sheet} onClose={() => setSheet(null)} />
    </div>
  )
}
