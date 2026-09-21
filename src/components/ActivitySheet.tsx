import { useEffect, useState } from 'react'
import { db, uid } from '../db'
import { LEGS } from '../muscles'
import type { Activity, MuscleId } from '../types'
import { Chip, Sheet } from './ui'
import { IconBall, IconGrip } from './icons'

export type ActivityKind = 'football' | 'forearm'

/** Configuración de cada actividad extra al gym. */
export const ACTIVITY: Record<ActivityKind, {
  name: string; title: string; muscles: MuscleId[]; levels: [string, string, string]; note: string; tone: string
}> = {
  football: {
    name: 'Fútbol', title: 'Registrar fútbol', muscles: [...LEGS, 'abs'],
    levels: ['Tranqui', 'Normal', 'A morir'],
    note: 'Marca piernas y core como entrenados, con una recuperación más corta que la del gym.',
    tone: 'bg-good/15 text-good',
  },
  forearm: {
    name: 'Antebrazo', title: 'Registrar antebrazo', muscles: ['forearms'],
    levels: ['Suave', 'Normal', 'Al fallo'],
    note: 'Para el ejercitador de mano o de muñeca. Marca los antebrazos como entrenados.',
    tone: 'bg-warn/15 text-warn',
  },
}

export function ActivityIcon({ type, size = 16 }: { type: Activity['type']; size?: number }) {
  return type === 'forearm' ? <IconGrip size={size} className="text-warn" /> : <IconBall size={size} className="text-good" />
}

export function activityLevel(a: Activity): string {
  const cfg = a.type === 'forearm' ? ACTIVITY.forearm : ACTIVITY.football
  return cfg.levels[a.intensity - 1]?.toLowerCase() ?? ''
}

export default function ActivitySheet({ kind, onClose }: { kind: ActivityKind | null; onClose: () => void }) {
  const [intensity, setIntensity] = useState<1 | 2 | 3>(2)
  const [when, setWhen] = useState<'now' | 'yesterday'>('now')
  useEffect(() => { if (kind) { setIntensity(2); setWhen('now') } }, [kind])
  const cfg = kind ? ACTIVITY[kind] : null

  const save = async () => {
    if (!kind || !cfg) return
    const date = when === 'now' ? Date.now() : Date.now() - 20 * 3_600_000
    await db.activities.add({ id: uid(), type: kind, name: cfg.name, date, muscles: [...cfg.muscles], intensity })
    onClose()
  }

  return (
    <Sheet open={!!kind} onClose={onClose} title={cfg?.title}>
      {cfg && (
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
              {cfg.levels.map((l, i) => (
                <Chip key={l} active={intensity === i + 1} onClick={() => setIntensity((i + 1) as 1 | 2 | 3)}>{l}</Chip>
              ))}
            </div>
          </div>
          <div className="text-muted text-sm">{cfg.note}</div>
          <button className="btn-primary w-full" onClick={save}>Guardar</button>
        </div>
      )}
    </Sheet>
  )
}
