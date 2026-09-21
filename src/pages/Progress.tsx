import { useId, useMemo, useState } from 'react'
import { Area, AreaChart, Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { motion } from 'motion/react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { useExercises, useWorkouts } from '../hooks'
import { bestFor, fmtDate, fmtKg, historyFor, setsPerMusclePerWeek, workoutsPerWeek } from '../lib/stats'
import { Empty, Header, Segmented } from '../components/ui'
import { Item, Press, Stagger, spring } from '../components/motion'
import { IconDown, IconUp } from '../components/icons'
import { MUSCLE_GROUPS } from '../muscles'
import type { BodyWeight, MuscleId } from '../types'

const tooltipStyle = {
  contentStyle: { background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 14, fontSize: 12, fontWeight: 700 },
  labelStyle: { color: 'var(--color-muted)', fontWeight: 600 },
  itemStyle: { color: 'var(--color-text)' },
  cursor: { stroke: 'var(--color-border)', strokeWidth: 1 },
}
const axis = { tick: { fill: 'var(--color-muted)', fontSize: 10, fontWeight: 600 }, axisLine: false, tickLine: false }

function AreaTrend({ data, dataKey, unit = '', height = 190 }: { data: Record<string, unknown>[]; dataKey: string; unit?: string; height?: number }) {
  const gid = 'g' + useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: 'var(--color-accent)', stopOpacity: 0.45 }} />
              <stop offset="100%" style={{ stopColor: 'var(--color-accent)', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" {...axis} minTickGap={18} />
          <YAxis {...axis} domain={['auto', 'auto']} width={44} />
          <Tooltip {...tooltipStyle} formatter={(v) => [`${v}${unit}`, '']} separator="" />
          <Area type="monotone" dataKey={dataKey} stroke="var(--color-accent)" strokeWidth={3} fill={`url(#${gid})`}
            dot={{ r: 3.5, fill: 'var(--color-bg)', stroke: 'var(--color-accent)', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: 'var(--color-accent)', stroke: 'var(--color-bg)', strokeWidth: 3 }}
            animationDuration={900} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function MiniStat({ label, children, sub }: { label: string; children: React.ReactNode; sub?: string }) {
  return (
    <div className="card p-3.5 min-w-0">
      <div className="label truncate">{label}</div>
      <div className="text-[20px] font-extrabold leading-tight mt-1 truncate">{children}</div>
      {sub && <div className="text-[11px] text-muted font-semibold truncate">{sub}</div>}
    </div>
  )
}

type Metric = 'peso' | 'rm' | 'reps' | 'vol'
const METRICS: { id: Metric; label: string; unit: string }[] = [
  { id: 'peso', label: 'Peso', unit: ' kg' },
  { id: 'rm', label: '1RM', unit: ' kg' },
  { id: 'reps', label: 'Reps', unit: '' },
  { id: 'vol', label: 'Volumen', unit: ' kg' },
]

function ExerciseView() {
  const exercises = useExercises()
  const workouts = useWorkouts()
  const [exId, setExId] = useState('')
  const [metric, setMetric] = useState<Metric>('peso')

  const withHistory = useMemo(() => {
    const lastDate = new Map<string, number>()
    for (const w of workouts) {
      if (!w.finishedAt) continue
      for (const e of w.entries) lastDate.set(e.exerciseId, Math.max(lastDate.get(e.exerciseId) ?? 0, w.finishedAt))
    }
    return exercises.filter(e => lastDate.has(e.id)).sort((a, b) => lastDate.get(b.id)! - lastDate.get(a.id)!)
  }, [exercises, workouts])

  const current = withHistory.find(e => e.id === exId) ?? withHistory[0]
  const history = useMemo(() => (current ? historyFor(current.id, workouts) : []), [current, workouts])
  if (withHistory.length === 0) return <Empty>Cuando termines tu primer entrenamiento vas a ver acá tu evolución por ejercicio.</Empty>

  const best = current ? bestFor(current.id, workouts) : {}
  const data = history.map(h => ({ label: fmtDate(h.date), peso: h.weight, reps: h.reps, rm: Math.round(h.e1rm * 10) / 10, vol: h.volume }))
  const first = history[0]
  const last = history[history.length - 1]
  const delta = first && last && history.length > 1 ? last.weight - first.weight : null
  const m = METRICS.find(x => x.id === metric)!

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
        {withHistory.map(e => {
          const on = e.id === current?.id
          return (
            <Press key={e.id} onClick={() => setExId(e.id)} aria-pressed={on}
              className={`relative shrink-0 h-10 px-4 rounded-full text-sm font-bold whitespace-nowrap ${on ? 'text-on-accent' : 'text-muted bg-surface-2 border border-border'}`}>
              {on && <motion.span layoutId="ex-pill" className="absolute inset-0 rounded-full bg-accent" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
              <span className="relative">{e.name}</span>
            </Press>
          )
        })}
      </div>

      <motion.div key={current?.id} className="card p-5 relative overflow-hidden" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
        <div className="absolute -right-16 -top-16 w-52 h-52 rounded-full pointer-events-none" style={{ background: 'var(--color-accent)', filter: 'blur(70px)', opacity: 0.16 }} />
        <div className="label">Mejor marca</div>
        <div className="flex items-end gap-2 mt-1">
          <div className="text-[48px] font-extrabold leading-none tracking-tight">
            {fmtKg(best.weight?.weight ?? 0)}
          </div>
          <div className="text-lg font-extrabold text-muted pb-1">kg × {best.weight?.reps ?? 0}</div>
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {delta !== null && delta !== 0 && (
            <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 ${delta >= 0 ? 'bg-good/15 text-good' : 'bg-bad/15 text-bad'}`}>
              {delta >= 0 ? <IconUp size={12} /> : <IconDown size={12} />}{delta >= 0 ? '+' : ''}{fmtKg(delta)} kg desde el inicio
            </span>
          )}
          {best.e1rm && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-surface-2 text-muted">1RM estimado {fmtKg(Math.round(best.e1rm.e1rm * 2) / 2)} kg</span>}
        </div>
      </motion.div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[17px] font-extrabold">Evolución</div>
          <div className="text-xs text-muted font-bold">{history.length} {history.length === 1 ? 'sesión' : 'sesiones'}</div>
        </div>
        <div className="flex gap-1 bg-surface-2 rounded-full p-1 mb-2">
          {METRICS.map(x => (
            <button key={x.id} onClick={() => setMetric(x.id)} className={`relative flex-1 h-8 rounded-full text-xs font-extrabold ${metric === x.id ? 'text-on-accent' : 'text-muted'}`}>
              {metric === x.id && <motion.span layoutId="metric-pill" className="absolute inset-0 rounded-full bg-accent" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
              <span className="relative">{x.label}</span>
            </button>
          ))}
        </div>
        {data.length > 1 ? <AreaTrend key={metric} data={data} dataKey={metric} unit={m.unit} /> : (
          <div className="h-[120px] flex items-center justify-center text-sm text-muted text-center px-6">Con una sesión más ya ves la curva.</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <MiniStat label="Último" sub={last ? fmtDate(last.date) : undefined}>{last ? `${fmtKg(last.weight)} kg × ${last.reps}` : '—'}</MiniStat>
        <MiniStat label="Sesiones" sub="registradas">{history.length}</MiniStat>
      </div>

      <div className="card overflow-hidden">
        <div className="text-[17px] font-extrabold px-4 pt-4 pb-2">Historial</div>
        <div className="divide-y divide-border">
          {[...history].reverse().map((h, i, arr) => {
            const prev = arr[i + 1]
            const diff = prev ? h.weight - prev.weight || h.reps - prev.reps : 0
            return (
              <div key={h.workoutId} className="px-4 h-14 flex items-center gap-3 text-sm">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${!prev ? 'bg-surface-2 text-muted' : diff > 0 ? 'bg-good/15 text-good' : diff < 0 ? 'bg-bad/15 text-bad' : 'bg-surface-2 text-muted'}`}>
                  {!prev ? '·' : diff > 0 ? <IconUp size={13} /> : diff < 0 ? <IconDown size={13} /> : '='}
                </span>
                <span className="text-muted w-16 shrink-0">{fmtDate(h.date)}</span>
                <span className="font-extrabold tabular-nums flex-1 text-right">{fmtKg(h.weight)} kg × {h.reps}</span>
                <span className="text-muted text-xs w-10 text-right">{h.sets} s{h.toFailure ? ' ·F' : ''}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function GroupBars({ data }: { data: { label: string; esta: number; pasada: number }[] }) {
  const max = Math.max(1, ...data.flatMap(d => [d.esta, d.pasada]))
  return (
    <div className="space-y-3.5">
      {data.map((d, i) => (
        <div key={d.label}>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="font-bold">{d.label}</span>
            <span className="tabular-nums text-muted text-xs font-bold"><b className="text-text text-sm">{d.esta}</b> / {d.pasada} series</span>
          </div>
          <div className="relative h-2.5 rounded-full bg-surface-2 overflow-hidden">
            <motion.div className="absolute inset-y-0 left-0 rounded-full bg-surface-3" initial={{ width: 0 }} animate={{ width: `${(d.pasada / max) * 100}%` }} transition={{ ...spring, delay: 0.1 + i * 0.05 }} />
            <motion.div className="absolute inset-y-0 left-0 rounded-full bg-accent" initial={{ width: 0 }} animate={{ width: `${(d.esta / max) * 100}%` }} transition={{ ...spring, delay: 0.2 + i * 0.05 }} />
          </div>
        </div>
      ))}
      <div className="flex items-center gap-4 text-[11px] text-muted font-bold pt-1">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent" />Esta semana</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-surface-3" />Semana pasada</span>
      </div>
    </div>
  )
}

function GeneralView() {
  const exercises = useExercises()
  const workouts = useWorkouts()
  const bodyweight = useLiveQuery(() => db.bodyweight.orderBy('date').toArray(), [], [] as BodyWeight[])

  const total = workouts.filter(w => w.finishedAt).length
  const perWeek = workoutsPerWeek(workouts, 8).map(w => ({ label: fmtDate(w.week), n: w.count }))
  const sets = setsPerMusclePerWeek(workouts, exercises, 8)
  const thisWeek = sets[sets.length - 1]?.sets ?? {}
  const lastWeek = sets[sets.length - 2]?.sets ?? {}
  const sum = (rec: Partial<Record<MuscleId, number>>, ids: MuscleId[]) => ids.reduce((a, m) => a + (rec[m] ?? 0), 0)
  const groupData = MUSCLE_GROUPS.map(g => ({ label: g.label, esta: Math.round(sum(thisWeek, g.ids)), pasada: Math.round(sum(lastWeek, g.ids)) }))
  const bwData = bodyweight.map(b => ({ label: fmtDate(b.date), kg: b.kg }))

  return (
    <div className="space-y-3">
      <div className="card p-5 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-52 h-52 rounded-full pointer-events-none" style={{ background: 'var(--color-accent)', filter: 'blur(70px)', opacity: 0.16 }} />
        <div className="label">Entrenamientos</div>
        <div className="text-[48px] font-extrabold leading-none tracking-tight mt-1">{total}</div>
        <div className="text-sm text-muted font-semibold mt-2">
          <b className="text-text">{perWeek[perWeek.length - 1]?.n ?? 0}</b> esta semana · {perWeek[perWeek.length - 2]?.n ?? 0} la pasada
        </div>
      </div>

      <div className="card p-4">
        <div className="text-[17px] font-extrabold mb-3">Por semana</div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={perWeek} margin={{ top: 5, right: 4, left: -26, bottom: 0 }}>
              <XAxis dataKey="label" {...axis} minTickGap={10} />
              <YAxis {...axis} allowDecimals={false} />
              <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} formatter={(v) => [`${v}`, '']} separator="" />
              <Bar dataKey="n" radius={[8, 8, 8, 8]} animationDuration={800}>
                {perWeek.map((_, i) => <Cell key={i} fill={i === perWeek.length - 1 ? 'var(--color-accent)' : 'var(--color-surface-3)'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-4">
        <div className="text-[17px] font-extrabold mb-4">Series por grupo</div>
        <GroupBars data={groupData} />
      </div>

      <div className="card p-4">
        <div className="text-[17px] font-extrabold mb-2">Peso corporal</div>
        {bwData.length > 1 ? <AreaTrend data={bwData} dataKey="kg" unit=" kg" height={170} /> : (
          <div className="text-muted text-sm py-4">Registrá tu peso desde Ajustes y acá vas a ver la curva.</div>
        )}
      </div>
    </div>
  )
}

export default function Progress() {
  const [mode, setMode] = useState<'exercise' | 'general'>('exercise')
  return (
    <Stagger className="space-y-5">
      <Item><Header title="Progreso" subtitle="Tu evolución" /></Item>
      <Item className="px-5">
        <Segmented value={mode} onChange={setMode} options={[{ value: 'exercise', label: 'Por ejercicio' }, { value: 'general', label: 'General' }]} />
      </Item>
      <Item className="px-5">
        <motion.div key={mode} initial={{ opacity: 0, x: mode === 'exercise' ? -16 : 16 }} animate={{ opacity: 1, x: 0 }} transition={spring}>
          {mode === 'exercise' ? <ExerciseView /> : <GeneralView />}
        </motion.div>
      </Item>
    </Stagger>
  )
}
