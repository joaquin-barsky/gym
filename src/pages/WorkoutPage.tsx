import { useMemo, useState } from 'react'
import { db } from '../db'
import { useExercises, useNow, useWorkouts } from '../hooks'
import { bestFor, compareEntry, fmtKg, lastFor, relTime, type Compare } from '../lib/stats'
import BodyMap from '../components/BodyMap'
import ExercisePicker from '../components/ExercisePicker'
import { Sheet, Stepper, Toggle, confirmDlg } from '../components/ui'
import { MUSCLE_LABEL } from '../muscles'
import type { Exercise, MuscleId, SetEntry, Workout } from '../types'

const BADGE: Record<Compare, { text: string; cls: string }> = {
  pr: { text: '🏆 Récord', cls: 'bg-good/15 text-good' },
  up: { text: '↑ Más que la última vez', cls: 'bg-good/15 text-good' },
  same: { text: '= Igual que la última vez', cls: 'bg-surface-3 text-muted' },
  down: { text: '↓ Menos que la última vez', cls: 'bg-bad/15 text-bad' },
  first: { text: 'Primera vez', cls: 'bg-accent/15 text-accent' },
}

function EntryCard({ entry, exercise, workouts, workoutId, index, onChange, onRemove }: {
  entry: SetEntry; exercise?: Exercise; workouts: Workout[]; workoutId: string; index: number
  onChange: (e: SetEntry) => void; onRemove: () => void
}) {
  const now = useNow()
  const last = useMemo(() => lastFor(entry.exerciseId, workouts, workoutId), [entry.exerciseId, workouts, workoutId])
  const best = useMemo(() => bestFor(entry.exerciseId, workouts, workoutId).weight, [entry.exerciseId, workouts, workoutId])
  const filled = !Number.isNaN(entry.weight) && !Number.isNaN(entry.reps) && entry.reps > 0
  const cmp = filled ? compareEntry(entry, last, best) : null
  const badge = cmp ? BADGE[cmp] : null
  const ring = cmp === 'down' ? 'border-bad/40' : cmp === 'pr' ? 'border-good/40' : ''
  return (
    <div className={`card p-4 space-y-4 ${ring}`}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-surface-3 text-muted text-sm font-extrabold flex items-center justify-center shrink-0 mt-0.5">{index + 1}</div>
        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-[17px] leading-tight">{exercise?.name ?? 'Ejercicio'}</div>
          <div className="text-xs text-muted mt-0.5 truncate">{exercise?.muscles.map(m => MUSCLE_LABEL[m]).join(' · ')}{exercise?.bodyweight ? ' · peso corporal' : ''}</div>
        </div>
        <button className="text-muted w-8 h-8 rounded-xl flex items-center justify-center text-xl leading-none" onClick={onRemove}>×</button>
      </div>

      <div className="flex gap-2 text-sm">
        <div className="flex-1 bg-surface-2 rounded-2xl px-3.5 py-2.5">
          <div className="label">Última vez</div>
          {last ? (
            <div className="font-extrabold text-base leading-tight mt-0.5">{fmtKg(last.weight)} kg × {last.reps}
              <div className="text-muted font-medium text-[11px]">{last.sets} series · {relTime(last.date, now)}</div>
            </div>
          ) : <div className="text-muted mt-0.5">—</div>}
        </div>
        <div className="flex-1 bg-surface-2 rounded-2xl px-3.5 py-2.5">
          <div className="label">Mejor</div>
          {best ? (
            <div className="font-extrabold text-base leading-tight mt-0.5">{fmtKg(best.weight)} kg × {best.reps}
              <div className="text-muted font-medium text-[11px]">{relTime(best.date, now)}</div>
            </div>
          ) : <div className="text-muted mt-0.5">—</div>}
        </div>
      </div>

      <div className="flex gap-2">
        <Stepper label={exercise?.bodyweight ? 'Lastre' : 'Peso'} suffix="kg" value={entry.weight} step={2.5} onChange={v => onChange({ ...entry, weight: v })} big />
        <Stepper label="Reps" value={entry.reps} step={1} onChange={v => onChange({ ...entry, reps: v })} big />
        <Stepper label="Series" value={entry.sets} step={1} min={1} onChange={v => onChange({ ...entry, sets: v })} />
      </div>

      <div className="flex items-center justify-between gap-2">
        <Toggle value={entry.toFailure} onChange={v => onChange({ ...entry, toFailure: v })} label="Al fallo" />
        {badge && <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${badge.cls} ${cmp === 'pr' ? 'animate-pop' : ''}`}>{badge.text}</span>}
      </div>
    </div>
  )
}

export default function WorkoutPage({ workout, onClose }: { workout: Workout; onClose: () => void }) {
  const exercises = useExercises()
  const workouts = useWorkouts()
  const [picker, setPicker] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [selected, setSelected] = useState<Set<MuscleId>>(new Set())
  const [note, setNote] = useState('')
  const exMap = useMemo(() => new Map(exercises.map(e => [e.id, e])), [exercises])

  // Estado local como fuente de verdad para no perder teclas mientras la DB se actualiza.
  const [entries, setEntries] = useState<SetEntry[]>(workout.entries)
  const update = (fn: (prev: SetEntry[]) => SetEntry[]) => setEntries(prev => {
    const next = fn(prev)
    db.workouts.update(workout.id, { entries: next })
    return next
  })

  const validEntries = entries.filter(e => !Number.isNaN(e.weight) && !Number.isNaN(e.reps) && e.reps > 0)

  const openFinish = () => {
    const auto = new Set<MuscleId>()
    for (const e of validEntries) for (const m of exMap.get(e.exerciseId)?.muscles ?? []) auto.add(m)
    setSelected(auto)
    setFinishing(true)
  }

  const finish = async () => {
    const failure = new Set<MuscleId>()
    for (const e of validEntries) {
      if (!e.toFailure) continue
      for (const m of exMap.get(e.exerciseId)?.muscles ?? []) if (selected.has(m)) failure.add(m)
    }
    await db.workouts.update(workout.id, {
      finishedAt: Date.now(),
      entries: validEntries.map(e => ({ ...e, sets: e.sets || 1 })),
      muscles: [...selected],
      failureMuscles: [...failure],
      note: note.trim() || undefined,
    })
    onClose()
  }

  const cancel = async () => {
    if (!confirmDlg('¿Cancelar el entrenamiento? Se pierde lo cargado.')) return
    await db.workouts.delete(workout.id)
    onClose()
  }

  const selColors = Object.fromEntries([...selected].map(m => [m, '#ff4d5e']))
  const downs = validEntries.filter(e => compareEntry(e, lastFor(e.exerciseId, workouts, workout.id), bestFor(e.exerciseId, workouts, workout.id).weight) === 'down').length

  return (
    <div className="h-full flex flex-col">
      <div className="safe-top bg-surface" />
      <div className="bg-surface/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <button className="text-muted text-sm font-semibold w-20 text-left" onClick={onClose}>‹ Volver</button>
        <div className="text-center">
          <div className="font-extrabold text-[17px]">{workout.name}</div>
          <div className="text-[11px] text-muted font-semibold">{validEntries.length}/{entries.length} cargados</div>
        </div>
        <button className="text-bad text-sm font-semibold w-20 text-right" onClick={cancel}>Cancelar</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {entries.map((e, i) => (
          <EntryCard key={`${e.exerciseId}-${i}`} entry={e} index={i} exercise={exMap.get(e.exerciseId)} workouts={workouts} workoutId={workout.id}
            onChange={ne => update(prev => prev.map((x, j) => (j === i ? ne : x)))}
            onRemove={() => update(prev => prev.filter((_, j) => j !== i))} />
        ))}
        <button className="btn-ghost w-full border-dashed" onClick={() => setPicker(true)}>＋ Agregar ejercicio</button>
        <div className="h-4" />
      </div>

      <div className="safe-bottom bg-surface/95 backdrop-blur border-t border-border p-3">
        <button className="btn-primary w-full text-base" disabled={validEntries.length === 0} onClick={openFinish}>Terminar entrenamiento</button>
      </div>

      <ExercisePicker open={picker} onClose={() => setPicker(false)} exclude={entries.map(e => e.exerciseId)} onPick={ex => {
        const last = lastFor(ex.id, workouts, workout.id)
        update(prev => [...prev, { exerciseId: ex.id, weight: last?.weight ?? 0, reps: last?.reps ?? 0, sets: last?.sets ?? 3, toFailure: false }])
        setPicker(false)
      }} />

      <Sheet open={finishing} onClose={() => setFinishing(false)} title="¿Qué entrenaste?" full>
        <div className="space-y-4">
          <div className="text-muted text-sm">Tocá el muñequito para agregar o sacar músculos.</div>
          <BodyMap colors={selColors} selected={selected} className="h-72" onPick={m => {
            const s = new Set(selected)
            if (s.has(m)) s.delete(m); else s.add(m)
            setSelected(s)
          }} />
          <div className="flex flex-wrap gap-1.5 justify-center">
            {[...selected].map(m => <span key={m} className="text-xs bg-bad/15 text-bad font-bold rounded-full px-2.5 py-1">{MUSCLE_LABEL[m]}</span>)}
            {selected.size === 0 && <span className="text-xs text-muted">Ningún músculo marcado</span>}
          </div>
          {entries.length !== validEntries.length && (
            <div className="text-warn text-sm">Hay {entries.length - validEntries.length} ejercicio(s) sin cargar que se van a omitir.</div>
          )}
          {downs > 0 && <div className="text-bad text-sm">⚠️ En {downs} ejercicio(s) hiciste menos que la última vez. La próxima, a recuperarlo.</div>}
          <div>
            <div className="label mb-1.5">Nota (opcional)</div>
            <input className="input" placeholder="Cómo te sentiste, qué cambiar…" value={note} onChange={e => setNote(e.target.value)} />
          </div>
          <button className="btn-primary w-full text-base" onClick={finish} disabled={selected.size === 0}>Guardar entrenamiento</button>
        </div>
      </Sheet>
    </div>
  )
}
