import { useState } from 'react'
import { db, uid } from '../db'
import { useDays, useExercises, useWorkouts } from '../hooks'
import ExercisePicker, { ExerciseForm } from '../components/ExercisePicker'
import { Header, Sheet, confirmDlg } from '../components/ui'
import { MUSCLE_LABEL } from '../muscles'
import type { Exercise, RoutineDay } from '../types'

const EMOJIS = ['🔥', '🧲', '🦵', '💪', '🏋️', '⚡', '🎯', '🦍', '🫁', '🧠']

function DayEditor({ day, onClose }: { day: RoutineDay; onClose: () => void }) {
  const exercises = useExercises()
  const [picker, setPicker] = useState(false)
  const exMap = new Map(exercises.map(e => [e.id, e]))
  const set = (patch: Partial<RoutineDay>) => db.days.update(day.id, patch)
  const move = (i: number, dir: -1 | 1) => {
    const ids = [...day.exerciseIds]
    const j = i + dir
    if (j < 0 || j >= ids.length) return
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
    set({ exerciseIds: ids })
  }
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="w-20">
          <div className="label mb-1">Ícono</div>
          <select className="input text-center text-xl" value={day.emoji} onChange={e => set({ emoji: e.target.value })}>
            {[...new Set([day.emoji, ...EMOJIS])].map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <div className="label mb-1">Nombre</div>
          <input className="input" value={day.name} onChange={e => set({ name: e.target.value })} />
        </div>
      </div>
      <div>
        <div className="label mb-2">Ejercicios</div>
        <div className="space-y-2">
          {day.exerciseIds.map((id, i) => {
            const ex = exMap.get(id)
            return (
              <div key={id} className="card px-3 py-2 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{ex?.name ?? '—'}</div>
                  <div className="text-xs text-muted truncate">{ex?.muscles.map(m => MUSCLE_LABEL[m]).join(', ')}</div>
                </div>
                <button className="text-muted px-2 py-1 disabled:opacity-20" disabled={i === 0} onClick={() => move(i, -1)}>▲</button>
                <button className="text-muted px-2 py-1 disabled:opacity-20" disabled={i === day.exerciseIds.length - 1} onClick={() => move(i, 1)}>▼</button>
                <button className="text-bad px-2 py-1" onClick={() => set({ exerciseIds: day.exerciseIds.filter(x => x !== id) })}>×</button>
              </div>
            )
          })}
        </div>
        <button className="btn-ghost w-full mt-2 border-dashed" onClick={() => setPicker(true)}>＋ Agregar ejercicio</button>
      </div>
      <button className="btn-danger w-full" onClick={async () => {
        if (!confirmDlg(`¿Borrar el día "${day.name}"?`)) return
        await db.days.delete(day.id); onClose()
      }}>Borrar día</button>
      <ExercisePicker open={picker} onClose={() => setPicker(false)} exclude={day.exerciseIds} onPick={ex => { set({ exerciseIds: [...day.exerciseIds, ex.id] }); setPicker(false) }} />
    </div>
  )
}

function Library({ onClose }: { onClose: () => void }) {
  const exercises = useExercises()
  const workouts = useWorkouts()
  const days = useDays()
  const [editing, setEditing] = useState<Exercise | null | 'new'>(null)
  const [q, setQ] = useState('')
  const used = new Set<string>()
  for (const w of workouts) for (const e of w.entries) used.add(e.exerciseId)
  const inDay = new Set(days.flatMap(d => d.exerciseIds))
  const list = exercises.filter(e => !q || e.name.toLowerCase().includes(q.toLowerCase()))
  if (editing) {
    return (
      <div>
        <button className="text-accent text-sm mb-3" onClick={() => setEditing(null)}>‹ Volver a la lista</button>
        <ExerciseForm initial={editing === 'new' ? undefined : editing} onDone={() => setEditing(null)} />
        {editing !== 'new' && !used.has(editing.id) && (
          <button className="btn-danger w-full mt-4" onClick={async () => {
            if (!confirmDlg('¿Borrar este ejercicio?')) return
            await db.exercises.delete(editing.id)
            for (const d of days) if (d.exerciseIds.includes(editing.id)) await db.days.update(d.id, { exerciseIds: d.exerciseIds.filter(x => x !== editing.id) })
            setEditing(null)
          }}>Borrar ejercicio</button>
        )}
        {editing !== 'new' && used.has(editing.id) && <div className="text-muted text-xs mt-3 text-center">No se puede borrar porque tiene historial.</div>}
      </div>
    )
  }
  return (
    <div className="space-y-3">
      <input className="input" placeholder="Buscar…" value={q} onChange={e => setQ(e.target.value)} />
      <button className="btn-primary w-full" onClick={() => setEditing('new')}>＋ Crear ejercicio</button>
      <div className="divide-y divide-border">
        {list.map(e => (
          <button key={e.id} className="w-full text-left py-3 flex justify-between items-center gap-2" onClick={() => setEditing(e)}>
            <div className="min-w-0">
              <div className="font-semibold truncate">{e.name}</div>
              <div className="text-xs text-muted truncate">{e.muscles.map(m => MUSCLE_LABEL[m]).join(', ')}{e.secondary.length ? ` (+${e.secondary.map(m => MUSCLE_LABEL[m]).join(', ')})` : ''}</div>
            </div>
            <div className="text-xs text-muted shrink-0">{inDay.has(e.id) ? 'en rutina' : ''}</div>
          </button>
        ))}
      </div>
      <button className="btn-ghost w-full" onClick={onClose}>Cerrar</button>
    </div>
  )
}

export default function Routine() {
  const days = useDays()
  const [editId, setEditId] = useState<string | null>(null)
  const [lib, setLib] = useState(false)
  const day = days.find(d => d.id === editId)

  const addDay = async () => {
    const id = 'day_' + uid()
    await db.days.add({ id, name: 'Nuevo día', emoji: '💪', order: (days.at(-1)?.order ?? -1) + 1, exerciseIds: [] })
    setEditId(id)
  }

  return (
    <div>
      <Header title="Rutina" subtitle="Tus días de entrenamiento" right={<button className="text-accent text-sm font-semibold" onClick={() => setLib(true)}>Ejercicios</button>} />
      <div className="px-4 space-y-2">
        {days.map(d => (
          <button key={d.id} className="card w-full p-4 text-left flex items-center gap-3" onClick={() => setEditId(d.id)}>
            <div className="text-3xl">{d.emoji}</div>
            <div className="flex-1">
              <div className="font-bold text-lg">{d.name}</div>
              <div className="text-muted text-xs">{d.exerciseIds.length} ejercicios</div>
            </div>
            <div className="text-muted">›</div>
          </button>
        ))}
        <button className="btn-ghost w-full border-dashed" onClick={addDay}>＋ Nuevo día</button>
      </div>
      <Sheet open={!!day} onClose={() => setEditId(null)} title="Editar día" full>
        {day && <DayEditor day={day} onClose={() => setEditId(null)} />}
      </Sheet>
      <Sheet open={lib} onClose={() => setLib(false)} title="Biblioteca de ejercicios" full>
        <Library onClose={() => setLib(false)} />
      </Sheet>
    </div>
  )
}
