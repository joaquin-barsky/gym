import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useActivities, useNow, useSoreness, useWorkouts } from '../hooks'
import { computeRecovery, hoursLeft, recoveryColor, recoveryLabel } from '../lib/recovery'
import { relTime } from '../lib/stats'
import BodyMap from '../components/BodyMap'
import SorenessCard, { usePendingSoreness } from '../components/SorenessCard'
import FootballSheet from '../components/FootballSheet'
import { Header, Segmented } from '../components/ui'
import { Item, Stagger, spring } from '../components/motion'
import { IconBall, IconX } from '../components/icons'
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
    <Stagger className="space-y-5">
      <Item>
        <Header title="Cuerpo" subtitle="Recuperación muscular" right={
          <button className="h-10 px-3.5 rounded-full bg-good/15 text-good text-sm font-bold flex items-center gap-1.5" onClick={() => setFootball(true)}><IconBall size={18} /> Fútbol</button>
        } />
      </Item>
      {pending && <Item><SorenessCard workout={pending} /></Item>}
      <Item className="px-5">
        <Segmented value={view} onChange={setView} options={[{ value: 'both', label: 'Ambos' }, { value: 'front', label: 'Frente' }, { value: 'back', label: 'Espalda' }]} />
      </Item>
      <Item className="px-5">
        <div className="card p-4">
          <BodyMap colors={colors} view={view} className={view === 'both' ? 'h-80' : 'h-[26rem]'} onPick={m => setPicked(m === picked ? null : m)} selected={picked ? new Set([picked]) : undefined} />
          <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-muted font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: recoveryColor(0) }} />Fatigado</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: recoveryColor(0.5) }} />Recuperando</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: recoveryColor(1) }} />Listo</span>
          </div>
          <AnimatePresence>
            {sel && (
              <motion.div key={sel.muscle} initial={{ opacity: 0, y: 8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: 8, height: 0 }} transition={spring} className="overflow-hidden">
                <div className="mt-3 bg-surface-2 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-extrabold">{MUSCLE_LABEL[sel.muscle]}</div>
                    <div className="text-xs text-muted">{sel.lastTrainedAt ? `Entrenado ${relTime(sel.lastTrainedAt, now)} · ventana ${sel.recoveryHours} h` : 'Sin registro reciente'}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-extrabold" style={{ color: recoveryColor(sel.fraction) }}>{recoveryLabel(sel.fraction)}</div>
                    {sel.fraction < 1 && <div className="text-xs text-muted">listo en {Math.ceil(hoursLeft(sel))} h</div>}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Item>
      <Item className="px-5">
        <div className="label mb-3">Por músculo</div>
        <div className="card divide-y divide-border">
          {list.map(s => (
            <button key={s.muscle} className={`w-full px-4 h-14 flex items-center gap-3 text-left transition-colors ${picked === s.muscle ? 'bg-white/5' : ''}`} onClick={() => setPicked(s.muscle === picked ? null : s.muscle)}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: recoveryColor(s.fraction) }} />
              <span className="flex-1 font-bold text-sm">{MUSCLE_LABEL[s.muscle]}</span>
              <span className="text-xs text-muted tabular-nums">{s.fraction >= 1 ? (s.lastTrainedAt ? relTime(s.lastTrainedAt, now) : '—') : `${Math.ceil(hoursLeft(s))} h`}</span>
              <span className="w-16 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                <motion.span className="block h-full rounded-full" initial={false} animate={{ width: `${s.fraction * 100}%` }} transition={{ duration: 0.6 }} style={{ background: recoveryColor(s.fraction) }} />
              </span>
            </button>
          ))}
        </div>
      </Item>
      {recentActivities.length > 0 && (
        <Item className="px-5">
          <div className="label mb-3">Actividades recientes</div>
          <div className="card divide-y divide-border">
            {recentActivities.map(a => (
              <div key={a.id} className="px-4 h-14 flex items-center justify-between text-sm gap-3">
                <span className="flex items-center gap-2 font-bold"><IconBall size={18} className="text-good" />{a.name} <span className="text-muted font-medium">· {['', 'tranqui', 'normal', 'a morir'][a.intensity]}</span></span>
                <span className="text-muted text-xs">{relTime(a.date, now)}</span>
                <button className="text-muted w-9 h-9 -mr-2 flex items-center justify-center" onClick={() => db.activities.delete(a.id)} aria-label="Borrar"><IconX size={16} /></button>
              </div>
            ))}
          </div>
        </Item>
      )}
      <Item className="px-5 text-xs text-muted leading-relaxed">Regla: 36 h base por músculo, +10 h si fue al fallo, +6/14/24 h según el dolor al día siguiente. Máximo 60 h.</Item>
      <FootballSheet open={football} onClose={() => setFootball(false)} />
    </Stagger>
  )
}
