import { useState } from 'react'
import { Reorder, useDragControls } from 'motion/react'
import { db, uid } from '../db'
import { useDays, useExercises, useWorkouts } from '../hooks'
import ExercisePicker, { ExerciseForm } from '../components/ExercisePicker'
import { Header, Sheet, confirmDlg } from '../components/ui'
import { Item, Press, Stagger } from '../components/motion'
import { IconChevron, IconGrip, IconPlus, IconX } from '../components/icons'
import { MUSCLE_LABEL } from '../muscles'
import type { Exercise, RoutineDay } from '../types'

const EMOJIS = ['🔥', '🧲', '🦵', '💪', '🏋️', '⚡', '🎯', '🦍', '🫁', '🧠']

function Row({ id, name, muscles, onRemove }: { id: string; name: string; muscles: string; onRemove: () => void }) {
  const controls = useDragControls()
  return (
    <Reorder.Item value={id} dragListener={false} dragControls={controls} className="card px-2 py-2 flex items-center gap-1 select-none">
      <button className="w-10 h-10 flex items-center justify-center text-muted cursor-grab touch-none" onPointerDown={e => controls.start(e)} aria-label="Reordenar"><IconGrip /></button>
      <div className="flex-1 min-w-0">
        <div className="font-bold truncate">{name}</div>
        <div className="text-xs text-muted truncate">{muscles}</div>
      </div>
      <button className="w-10 h-10 flex items-center justify-center text-muted" onClick={onRemove} aria-label="Quitar"><IconX size={16} /></button>
    </Reorder.Item>
  )
}

function DayEditor({ day, onClose }: { day: RoutineDay; onClose: () => void }) {
  const exercises = useExercises()
  const [picker, setPicker] = useState(false)
  const exMap = new Map(exercises.map(e => [e.id, e]))
  const set = (patch: Partial<RoutineDay>) => db.days.update(day.id, patch)
  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <div className="w-24">
          <div className="label mb-1.5">Ícono</div>
          <select className="input text-center text-xl h-[54px] py-0" value={day.emoji} onChange={e => set({ emoji: e.target.value })}>
            {[...new Set([day.emoji, ...EMOJIS])].map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <div className="label mb-1.5">Nombre</div>
          <input className="input h-[54px]" value={day.name} onChange={e => set({ name: e.target.value })} />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="label">Ejercicios</div>
          <div className="text-[11px] text-muted">Arrastrá para ordenar</div>
        </div>
        <Reorder.Group axis="y" values={day.exerciseIds} onReorder={ids => set({ exerciseIds: ids })} className="space-y-2">
          {day.exerciseIds.map(id => {
            const ex = exMap.get(id)
            return <Row key={id} id={id} name={ex?.name ?? '—'} muscles={ex?.muscles.map(m => MUSCLE_LABEL[m]).join(', ') ?? ''} onRemove={() => set({ exerciseIds: day.exerciseIds.filter(x => x !== id) })} />
          })}
        </Reorder.Group>
        <Press className="btn-ghost w-full mt-2 border-dashed" onClick={() => setPicker(true)}><IconPlus size={18} /> Agregar ejercicio</Press>
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
        <button className="text-accent text-sm font-bold mb-3 h-9" onClick={() => setEditing(null)}>‹ Volver a la lista</button>
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
      <Press className="btn-primary w-full" onClick={() => setEditing('new')}><IconPlus size={18} /> Crear ejercicio</Press>
      <div className="card divide-y divide-border">
        {list.map(e => (
          <button key={e.id} className="w-full text-left px-4 py-3 flex justify-between items-center gap-2 min-h-14" onClick={() => setEditing(e)}>
            <div className="min-w-0">
              <div className="font-bold truncate">{e.name}</div>
              <div className="text-xs text-muted truncate">{e.muscles.map(m => MUSCLE_LABEL[m]).join(', ')}{e.secondary.length ? ` (+${e.secondary.map(m => MUSCLE_LABEL[m]).join(', ')})` : ''}</div>
            </div>
            <div className="text-[11px] text-muted shrink-0 flex items-center gap-1">{inDay.has(e.id) ? 'en rutina' : ''}<IconChevron size={16} /></div>
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
    <Stagger>
      <Item><Header title="Rutina" subtitle="Tus días de entrenamiento" right={<button className="text-accent text-sm font-bold h-10 px-2" onClick={() => setLib(true)}>Ejercicios</button>} /></Item>
      <div className="px-5 space-y-2.5">
        {days.map(d => (
          <Item key={d.id}>
            <Press className="card w-full p-4 text-left flex items-center gap-3.5" onClick={() => setEditId(d.id)}>
              <div className="w-12 h-12 rounded-2xl bg-surface-3 flex items-center justify-center text-2xl shrink-0">{d.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-[17px]">{d.name}</div>
                <div className="text-muted text-xs">{d.exerciseIds.length} ejercicios</div>
              </div>
              <IconChevron className="text-muted" />
            </Press>
          </Item>
        ))}
        <Item><Press className="btn-ghost w-full border-dashed" onClick={addDay}><IconPlus size={18} /> Nuevo día</Press></Item>
      </div>
      <Sheet open={!!day} onClose={() => setEditId(null)} title="Editar día" full>
        {day && <DayEditor day={day} onClose={() => setEditId(null)} />}
      </Sheet>
      <Sheet open={lib} onClose={() => setLib(false)} title="Ejercicios" full>
        <Library onClose={() => setLib(false)} />
      </Sheet>
    </Stagger>
  )
}
