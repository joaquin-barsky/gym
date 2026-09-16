import { useState } from 'react'
import { db, uid } from '../db'
import { LEGS } from '../muscles'
import { Chip, Sheet } from './ui'

export default function FootballSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [intensity, setIntensity] = useState<1 | 2 | 3>(2)
  const [when, setWhen] = useState<'now' | 'yesterday'>('now')
  const save = async () => {
    const date = when === 'now' ? Date.now() : Date.now() - 20 * 3_600_000
    await db.activities.add({ id: uid(), type: 'football', name: 'Fútbol', date, muscles: [...LEGS, 'abs'], intensity })
    onClose()
  }
  return (
    <Sheet open={open} onClose={onClose} title="Registrar fútbol ⚽">
      <div className="space-y-4">
        <div>
          <div className="label mb-2">¿Cuándo?</div>
          <div className="flex gap-2">
            <Chip active={when === 'now'} onClick={() => setWhen('now')}>Hoy</Chip>
            <Chip active={when === 'yesterday'} onClick={() => setWhen('yesterday')}>Ayer</Chip>
          </div>
        </div>
        <div>
          <div className="label mb-2">Intensidad</div>
          <div className="flex gap-2">
            <Chip active={intensity === 1} onClick={() => setIntensity(1)}>Tranqui</Chip>
            <Chip active={intensity === 2} onClick={() => setIntensity(2)}>Normal</Chip>
            <Chip active={intensity === 3} onClick={() => setIntensity(3)}>A morir</Chip>
          </div>
        </div>
        <div className="text-muted text-sm">Marca piernas y core como entrenados, con una recuperación más corta que la del gym.</div>
        <button className="btn-primary w-full" onClick={save}>Guardar</button>
      </div>
    </Sheet>
  )
}
