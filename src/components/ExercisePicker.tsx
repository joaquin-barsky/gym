import { useMemo, useState } from 'react'
import { db, uid } from '../db'
import { useExercises } from '../hooks'
import { MUSCLES, MUSCLE_GROUPS, MUSCLE_LABEL } from '../muscles'
import type { Exercise, MuscleId } from '../types'
import { Chip, Sheet } from './ui'

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export function ExerciseForm({ initial, onDone }: { initial?: Exercise; onDone: (ex: Exercise) => void }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [muscles, setMuscles] = useState<MuscleId[]>(initial?.muscles ?? [])
  const [secondary, setSecondary] = useState<MuscleId[]>(initial?.secondary ?? [])
  const [bodyweight, setBodyweight] = useState(!!initial?.bodyweight)

  const toggle = (list: MuscleId[], set: (v: MuscleId[]) => void, other: MuscleId[], setOther: (v: MuscleId[]) => void, m: MuscleId) => {
    if (list.includes(m)) set(list.filter(x => x !== m))
    else { set([...list, m]); if (other.includes(m)) setOther(other.filter(x => x !== m)) }
  }

  const save = async () => {
    if (!name.trim() || muscles.length === 0) return
    const ex: Exercise = {
      id: initial?.id ?? 'ex_' + uid(),
      name: name.trim(), muscles, secondary, bodyweight,
      createdAt: initial?.createdAt ?? Date.now(),
    }
    await db.exercises.put(ex)
    onDone(ex)
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="label mb-1">Nombre</div>
        <input className="input" placeholder="Ej: Press inclinado en máquina" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <div className="label mb-2">Músculos principales</div>
        <div className="flex flex-wrap gap-2">
          {MUSCLES.map(m => <Chip key={m.id} active={muscles.includes(m.id)} onClick={() => toggle(muscles, setMuscles, secondary, setSecondary, m.id)}>{m.label}</Chip>)}
        </div>
      </div>
      <div>
        <div className="label mb-2">Secundarios (opcional)</div>
        <div className="flex flex-wrap gap-2">
          {MUSCLES.map(m => <Chip key={m.id} active={secondary.includes(m.id)} onClick={() => toggle(secondary, setSecondary, muscles, setMuscles, m.id)}>{m.label}</Chip>)}
        </div>
      </div>
      <label className="flex items-center gap-3 py-1">
        <input type="checkbox" className="w-5 h-5" checked={bodyweight} onChange={e => setBodyweight(e.target.checked)} />
        <span className="text-sm">Peso corporal (el peso que cargás es el lastre)</span>
      </label>
      <button className="btn-primary w-full" disabled={!name.trim() || muscles.length === 0} onClick={save}>
        {initial ? 'Guardar cambios' : 'Crear ejercicio'}
      </button>
    </div>
  )
}

export default function ExercisePicker({ open, onClose, onPick, exclude = [] }: {
  open: boolean; onClose: () => void; onPick: (ex: Exercise) => void; exclude?: string[]
}) {
  const exercises = useExercises()
  const [q, setQ] = useState('')
  const [creating, setCreating] = useState(false)
  const [group, setGroup] = useState<string | null>(null)

  const list = useMemo(() => {
    const nq = norm(q)
    const ids = group ? MUSCLE_GROUPS.find(g => g.label === group)!.ids : null
    return exercises.filter(e =>
      !exclude.includes(e.id) &&
      (!nq || norm(e.name).includes(nq)) &&
      (!ids || e.muscles.some(m => ids.includes(m))),
    )
  }, [exercises, q, group, exclude])

  return (
    <Sheet open={open} onClose={() => { setCreating(false); onClose() }} title={creating ? 'Nuevo ejercicio' : 'Agregar ejercicio'} full>
      {creating ? (
        <ExerciseForm onDone={ex => { setCreating(false); onPick(ex) }} />
      ) : (
        <div className="space-y-3">
          <input className="input" placeholder="Buscar…" value={q} onChange={e => setQ(e.target.value)} />
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <Chip active={group === null} onClick={() => setGroup(null)}>Todos</Chip>
            {MUSCLE_GROUPS.map(g => <Chip key={g.label} active={group === g.label} onClick={() => setGroup(g.label)}>{g.label}</Chip>)}
          </div>
          <button className="btn-ghost w-full" onClick={() => setCreating(true)}>＋ Crear ejercicio nuevo</button>
          <div className="divide-y divide-border">
            {list.map(e => (
              <button key={e.id} className="w-full text-left py-3 flex items-center justify-between gap-3" onClick={() => onPick(e)}>
                <div>
                  <div className="font-semibold">{e.name}</div>
                  <div className="text-xs text-muted">{e.muscles.map(m => MUSCLE_LABEL[m]).join(', ')}</div>
                </div>
                <span className="text-accent text-xl">＋</span>
              </button>
            ))}
            {list.length === 0 && <div className="text-muted text-sm py-6 text-center">Sin resultados</div>}
          </div>
        </div>
      )}
    </Sheet>
  )
}
