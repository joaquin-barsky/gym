import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { useExercises, useWorkouts } from '../hooks'
import { bestFor, fmtDate, fmtKg, historyFor, setsPerMusclePerWeek, workoutsPerWeek } from '../lib/stats'
import { Chip, Empty, Header } from '../components/ui'
import { MUSCLE_GROUPS } from '../muscles'
import type { BodyWeight, MuscleId } from '../types'

const tooltipStyle = {
  contentStyle: { background: '#1c2430', border: '1px solid #263040', borderRadius: 12, fontSize: 12 },
  labelStyle: { color: '#8a96a6' },
}

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-3">
      <div className="label">{label}</div>
      <div className="text-xl font-extrabold">{value}</div>
      {sub && <div className="text-xs text-muted">{sub}</div>}
    </div>
  )
}

function Chart({ title, data, dataKey, color, unit = '', bar }: { title: string; data: Record<string, unknown>[]; dataKey: string; color: string; unit?: string; bar?: boolean }) {
  const axis = { tick: { fill: '#8a96a6', fontSize: 10 }, axisLine: false, tickLine: false }
  return (
    <div className="card p-3">
      <div className="label mb-2">{title}</div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          {bar ? (
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#263040" vertical={false} />
              <XAxis dataKey="label" {...axis} />
              <YAxis {...axis} allowDecimals={false} />
              <Tooltip {...tooltipStyle} formatter={(v) => [`${v}${unit}`, title]} />
              <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#263040" vertical={false} />
              <XAxis dataKey="label" {...axis} />
              <YAxis {...axis} domain={['auto', 'auto']} />
              <Tooltip {...tooltipStyle} formatter={(v) => [`${v}${unit}`, title]} />
              <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: color, strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default function Progress() {
  const exercises = useExercises()
  const workouts = useWorkouts()
  const bodyweight = useLiveQuery(() => db.bodyweight.orderBy('date').toArray(), [], [] as BodyWeight[])
  const [mode, setMode] = useState<'exercise' | 'general'>('exercise')

  const withHistory = useMemo(() => {
    const lastDate = new Map<string, number>()
    for (const w of workouts) {
      if (!w.finishedAt) continue
      for (const e of w.entries) lastDate.set(e.exerciseId, Math.max(lastDate.get(e.exerciseId) ?? 0, w.finishedAt))
    }
    return exercises.filter(e => lastDate.has(e.id)).sort((a, b) => lastDate.get(b.id)! - lastDate.get(a.id)!)
  }, [exercises, workouts])

  const [exId, setExId] = useState<string>('')
  const current = withHistory.find(e => e.id === exId) ?? withHistory[0]
  const history = useMemo(() => (current ? historyFor(current.id, workouts) : []), [current, workouts])
  const best = current ? bestFor(current.id, workouts) : {}
  const data = history.map(h => ({ label: fmtDate(h.date), peso: h.weight, reps: h.reps, rm: Math.round(h.e1rm * 10) / 10, vol: h.volume }))

  const perWeek = workoutsPerWeek(workouts, 8).map(w => ({ label: fmtDate(w.week), n: w.count }))
  const sets = setsPerMusclePerWeek(workouts, exercises, 8)
  const thisWeek = sets[sets.length - 1]?.sets ?? {}
  const lastWeek = sets[sets.length - 2]?.sets ?? {}
  const sum = (rec: Partial<Record<MuscleId, number>>, ids: MuscleId[]) => ids.reduce((a, m) => a + (rec[m] ?? 0), 0)
  const groupData = MUSCLE_GROUPS.map(g => ({ label: g.label, esta: Math.round(sum(thisWeek, g.ids)), pasada: Math.round(sum(lastWeek, g.ids)) }))
  const bwData = bodyweight.map(b => ({ label: fmtDate(b.date), kg: b.kg }))

  const first = history[0]
  const last = history[history.length - 1]
  const delta = first && last && history.length > 1 ? last.weight - first.weight : null
  const deltaText = delta === null ? undefined : `${delta >= 0 ? '+' : ''}${fmtKg(delta)} kg desde la primera`

  return (
    <div className="space-y-4">
      <Header title="Progreso" />
      <div className="px-4 flex gap-2">
        <Chip active={mode === 'exercise'} onClick={() => setMode('exercise')}>Por ejercicio</Chip>
        <Chip active={mode === 'general'} onClick={() => setMode('general')}>General</Chip>
      </div>

      {mode === 'exercise' && (
        <div className="px-4 space-y-3">
          {withHistory.length === 0 ? <Empty>Cuando termines tu primer entrenamiento vas a ver acá tu evolución por ejercicio.</Empty> : (
            <>
              <select className="input font-semibold" value={current?.id ?? ''} onChange={e => setExId(e.target.value)}>
                {withHistory.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <Tile label="Último" value={last ? `${fmtKg(last.weight)} kg × ${last.reps}` : '—'} sub={last ? fmtDate(last.date) : undefined} />
                <Tile label="Mejor peso" value={best.weight ? `${fmtKg(best.weight.weight)} kg × ${best.weight.reps}` : '—'} sub={best.weight ? fmtDate(best.weight.date) : undefined} />
                <Tile label="1RM estimado" value={best.e1rm ? `${fmtKg(Math.round(best.e1rm.e1rm * 2) / 2)} kg` : '—'} sub="fórmula de Epley" />
                <Tile label="Sesiones" value={String(history.length)} sub={deltaText} />
              </div>
              <Chart title="Peso (kg)" data={data} dataKey="peso" color="#4f8cff" unit=" kg" />
              <Chart title="Repeticiones" data={data} dataKey="reps" color="#7c5cff" />
              <Chart title="1RM estimado (kg)" data={data} dataKey="rm" color="#2fd27a" unit=" kg" />
              <Chart title="Volumen por sesión (kg)" data={data} dataKey="vol" color="#ffc233" unit=" kg" bar />
              <div className="card divide-y divide-border">
                <div className="label px-3 pt-3 pb-1">Historial</div>
                {[...history].reverse().map(h => (
                  <div key={h.workoutId} className="px-3 py-2 flex justify-between text-sm">
                    <span className="text-muted">{fmtDate(h.date)}</span>
                    <span className="font-semibold">{fmtKg(h.weight)} kg × {h.reps} · {h.sets} s {h.toFailure && <span className="text-bad">· fallo</span>}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {mode === 'general' && (
        <div className="px-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Tile label="Entrenamientos" value={String(workouts.filter(w => w.finishedAt).length)} sub="en total" />
            <Tile label="Esta semana" value={String(perWeek[perWeek.length - 1]?.n ?? 0)} sub={`${perWeek[perWeek.length - 2]?.n ?? 0} la semana pasada`} />
          </div>
          <Chart title="Entrenamientos por semana" data={perWeek} dataKey="n" color="#4f8cff" bar />
          <div className="card p-3">
            <div className="label mb-2">Series por grupo muscular (esta semana vs pasada)</div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groupData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#263040" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#8a96a6', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8a96a6', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="pasada" name="Semana pasada" fill="#3a4656" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="esta" name="Esta semana" fill="#4f8cff" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {bwData.length > 0 ? <Chart title="Peso corporal (kg)" data={bwData} dataKey="kg" color="#ff4d5e" unit=" kg" /> : (
            <div className="text-muted text-xs text-center">Podés registrar tu peso corporal desde Ajustes.</div>
          )}
        </div>
      )}
    </div>
  )
}
