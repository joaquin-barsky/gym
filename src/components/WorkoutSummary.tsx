import { useMemo } from 'react'
import { motion } from 'motion/react'
import { fmtKg } from '../lib/stats'
import { CountUp, Press, easeOut, spring } from './motion'
import { IconCheck, IconTrophy, IconUp } from './icons'

export interface Summary {
  name: string
  durationMs: number
  volume: number
  prevVolume?: number
  exercises: number
  sets: number
  prs: { name: string; weight: number; reps: number }[]
  ups: number
}

const COLORS = ['var(--color-accent)', '#ffffff', 'var(--color-good)', 'var(--color-warn)']

function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 46 }, (_, i) => {
    const angle = (Math.random() - 0.5) * Math.PI * 1.1 - Math.PI / 2
    const dist = 180 + Math.random() * 260
    return {
      i,
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      fall: 260 + Math.random() * 380,
      rot: (Math.random() - 0.5) * 900,
      w: 5 + Math.random() * 6,
      h: 8 + Math.random() * 10,
      color: COLORS[i % COLORS.length],
      delay: 0.25 + Math.random() * 0.2,
      round: Math.random() > 0.6,
    }
  }), [])
  return (
    <div className="absolute left-1/2 top-[30%] pointer-events-none" aria-hidden>
      {pieces.map(p => (
        <motion.span key={p.i} className="absolute" style={{ width: p.w, height: p.round ? p.w : p.h, background: p.color, borderRadius: p.round ? 999 : 2 }}
          initial={{ x: 0, y: 0, opacity: 0, rotate: 0, scale: 0.4 }}
          animate={{ x: [0, p.x, p.x * 1.05], y: [0, p.y, p.y + p.fall], opacity: [0, 1, 1, 0], rotate: p.rot, scale: 1 }}
          transition={{ duration: 2.4, delay: p.delay, times: [0, 0.3, 1], ease: [0.2, 0.7, 0.4, 1] }} />
      ))}
    </div>
  )
}

export default function WorkoutSummary({ s, onClose }: { s: Summary; onClose: () => void }) {
  const delta = s.prevVolume && s.prevVolume > 0 ? Math.round(((s.volume - s.prevVolume) / s.prevVolume) * 100) : null
  const headline = s.prs.length > 0 ? 'Nuevo récord' : delta !== null && delta > 0 ? 'Mejor que la última' : 'Entrenamiento hecho'

  const item = (i: number) => ({
    initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: easeOut, delay: 0.55 + i * 0.07 },
  })

  return (
    <motion.div className="fixed inset-0 z-[55] bg-bg overflow-y-auto"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.25 } }}>
      <div className="absolute inset-x-0 top-0 h-[70vh] pointer-events-none"
        style={{ background: 'radial-gradient(70% 55% at 50% 18%, var(--color-glow) 0%, transparent 70%)' }} />
      <Confetti />

      <div className="relative min-h-full flex flex-col px-5" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 40px)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)' }}>
        <div className="flex flex-col items-center text-center">
          <motion.div className="w-24 h-24 rounded-full bg-accent text-on-accent flex items-center justify-center shadow-[0_20px_60px_-12px_var(--color-accent)]"
            initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}>
            {s.prs.length > 0 ? <IconTrophy size={44} /> : <IconCheck size={46} />}
          </motion.div>
          <motion.div className="label mt-6" {...item(0)}>{s.name}</motion.div>
          <motion.h1 className="text-[34px] font-extrabold tracking-tight leading-tight mt-1" {...item(1)}>{headline}</motion.h1>
        </div>

        <motion.div className="card p-5 mt-7" {...item(2)}>
          <div className="label">Volumen total</div>
          <div className="flex items-end justify-between mt-1">
            <div className="text-[44px] font-extrabold leading-none tracking-tight">
              <CountUp value={s.volume} delay={0.7} duration={1.2} format={v => fmtKg(Math.round(v))} /> <span className="text-lg text-muted">kg</span>
            </div>
            {delta !== null && (
              <span className={`text-sm font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1 ${delta >= 0 ? 'bg-good/15 text-good' : 'bg-bad/15 text-bad'}`}>
                <IconUp size={14} className={delta >= 0 ? '' : 'rotate-180'} />{delta >= 0 ? '+' : ''}{delta}%
              </span>
            )}
          </div>
          {s.prevVolume ? <div className="text-xs text-muted mt-2">La última vez: {fmtKg(Math.round(s.prevVolume))} kg</div> : null}
        </motion.div>

        <motion.div className="grid grid-cols-3 gap-2.5 mt-2.5" {...item(3)}>
          {[
            { v: s.exercises, l: 'ejercicios' },
            { v: s.sets, l: 'series' },
            { v: Math.max(1, Math.round(s.durationMs / 60_000)), l: 'minutos' },
          ].map((x, i) => (
            <div key={i} className="card p-3.5">
              <div className="text-[24px] font-extrabold leading-none"><CountUp value={x.v} delay={0.8 + i * 0.1} /></div>
              <div className="text-[11px] text-muted font-bold mt-1.5">{x.l}</div>
            </div>
          ))}
        </motion.div>

        {s.prs.length > 0 && (
          <motion.div className="card p-4 mt-2.5" {...item(4)}>
            <div className="text-[17px] font-extrabold flex items-center gap-2 mb-3"><IconTrophy size={18} className="text-accent" /> Récords de hoy</div>
            <div className="space-y-2.5">
              {s.prs.map((p, i) => (
                <motion.div key={p.name} className="flex items-center justify-between gap-3"
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 1 + i * 0.1 }}>
                  <span className="font-bold truncate">{p.name}</span>
                  <span className="font-extrabold tabular-nums text-accent shrink-0">{fmtKg(p.weight)} kg × {p.reps}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {s.ups > 0 && (
          <motion.div className="text-center text-sm text-muted mt-4" {...item(5)}>
            Subiste en <b className="text-text">{s.ups}</b> ejercicio{s.ups === 1 ? '' : 's'} respecto a la última vez.
          </motion.div>
        )}

        <div className="flex-1 min-h-6" />
        <motion.div {...item(6)}>
          <Press className="btn-primary w-full h-14 text-base mt-6" onClick={onClose}>Listo</Press>
        </motion.div>
      </div>
    </motion.div>
  )
}
