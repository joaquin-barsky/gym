import { AnimatePresence, motion } from 'motion/react'
import { elapsedOf, fmtClock, fmtCs, fmtShort, timer, useClock, useTimer, type TimerState } from '../lib/timer'
import { Segmented } from './ui'
import { Press, spring } from './motion'

const PRESETS = [30_000, 60_000, 90_000, 120_000, 180_000, 300_000]

const IconPlay = () => <svg viewBox="0 0 24 24" width="34" height="34" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" /></svg>
const IconPause = () => <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><rect x="6" y="5" width="4.2" height="14" rx="1.4" /><rect x="13.8" y="5" width="4.2" height="14" rx="1.4" /></svg>
const IconRestart = () => <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12a8 8 0 1 0 2.4-5.7" /><path d="M4 4v5h5" /></svg>
const IconSound = ({ on }: { on: boolean }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 5 6 9H3v6h3l5 4z" />{on ? <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /> : <path d="m16 9 5 6M21 9l-5 6" />}
  </svg>
)

/** Anillo con 60 marcas; en cuenta regresiva se vacía, en cronómetro barre cada minuto. */
function Dial({ s, now, size }: { s: TimerState; now: number; size: number }) {
  const elapsed = elapsedOf(s, now)
  const countdown = s.mode === 'countdown'
  const remaining = s.duration - elapsed
  const over = countdown && remaining <= 0
  const progress = countdown ? Math.max(0, remaining) / s.duration : (elapsed % 60_000) / 60_000
  const R = 44, C = 2 * Math.PI * R
  const headAngle = (countdown ? progress : progress) * 360 - 90
  const color = over ? 'var(--color-bad)' : 'var(--color-accent)'
  const urgent = countdown && !over && remaining <= 10_000 && s.running

  const big = countdown ? (over ? `+${fmtClock(-remaining)}` : fmtClock(remaining + 999)) : fmtClock(elapsed)

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <motion.div className="absolute inset-[10%] rounded-full" style={{ background: color, filter: 'blur(48px)' }}
        animate={{ opacity: s.running ? (over ? [0.35, 0.6, 0.35] : 0.22) : 0.08 }} transition={over ? { duration: 1, repeat: Infinity } : { duration: 0.6 }} />
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
        {Array.from({ length: 60 }, (_, i) => {
          const major = i % 5 === 0
          const a = (i / 60) * 2 * Math.PI
          const lit = countdown ? i / 60 < progress : i / 60 <= progress
          return (
            <line key={i} x1={50 + Math.sin(a) * (major ? 34.5 : 36)} y1={50 - Math.cos(a) * (major ? 34.5 : 36)}
              x2={50 + Math.sin(a) * 38.5} y2={50 - Math.cos(a) * 38.5}
              stroke={lit ? color : 'var(--color-surface-3)'} strokeWidth={major ? 1.1 : 0.6} strokeLinecap="round" />
          )
        })}
        <circle cx="50" cy="50" r={R} fill="none" stroke="var(--color-surface-2)" strokeWidth="3.2" />
        <circle cx="50" cy="50" r={R} fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - (over ? 1 : progress))} transform="rotate(-90 50 50)" />
        {!over && (
          <circle cx={50 + Math.cos((headAngle * Math.PI) / 180) * R} cy={50 + Math.sin((headAngle * Math.PI) / 180) * R} r="2.6"
            fill="var(--color-bg)" stroke={color} strokeWidth="1.6" />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="label mb-1">{countdown ? (over ? 'Tiempo cumplido' : s.running ? 'Descansando' : 'Descanso') : 'Cronómetro'}</div>
        <motion.div className={`font-extrabold tabular-nums leading-none tracking-tight ${over ? 'text-bad' : 'text-text'}`}
          style={{ fontSize: size * 0.22 }} animate={urgent ? { scale: [1, 1.05, 1] } : { scale: 1 }} transition={urgent ? { duration: 1, repeat: Infinity } : {}}>
          {big}
        </motion.div>
        {!countdown && <div className="text-muted font-bold tabular-nums mt-1" style={{ fontSize: size * 0.07 }}>.{fmtCs(elapsed)}</div>}
        {countdown && !over && <div className="text-muted text-xs font-semibold mt-2 tabular-nums">de {fmtClock(s.duration)}</div>}
        {over && <div className="text-bad text-sm font-extrabold mt-2">¡A la serie!</div>}
      </div>
    </div>
  )
}

function RoundBtn({ onClick, children, label, disabled }: { onClick: () => void; children: React.ReactNode; label: string; disabled?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <Press onClick={onClick} disabled={disabled} aria-label={label}
        className="w-16 h-16 rounded-full bg-surface-2 border border-border text-text flex items-center justify-center font-extrabold text-sm disabled:opacity-35">
        {children}
      </Press>
      <span className="text-[11px] text-muted font-bold">{label}</span>
    </div>
  )
}

function Laps({ laps }: { laps: number[] }) {
  if (laps.length === 0) return null
  const splits = laps.map((t, i) => t - (laps[i - 1] ?? 0))
  const min = Math.min(...splits), max = Math.max(...splits)
  return (
    <div className="card divide-y divide-border overflow-hidden">
      <AnimatePresence initial={false}>
        {[...splits].map((sp, i) => ({ sp, i })).reverse().map(({ sp, i }) => {
          const tone = splits.length > 1 && sp === min ? 'text-good' : splits.length > 1 && sp === max ? 'text-bad' : 'text-text'
          return (
            <motion.div key={i} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={spring}
              className="px-4 h-12 flex items-center justify-between text-sm">
              <span className="text-muted font-bold">Vuelta {i + 1}</span>
              <span className={`font-extrabold tabular-nums ${tone}`}>{fmtClock(sp)}.{fmtCs(sp)}</span>
              <span className="text-muted tabular-nums text-xs w-14 text-right">{fmtClock(laps[i])}</span>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

function TodayRests({ s }: { s: TimerState }) {
  const start = new Date(); start.setHours(0, 0, 0, 0)
  const today = s.history.filter(r => r.at >= start.getTime())
  if (today.length === 0) return null
  const avg = today.reduce((a, r) => a + r.ms, 0) / today.length
  const last = today.slice(-14)
  const max = Math.max(...last.map(r => r.ms))
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="label">Descansos de hoy</div>
          <div className="text-[22px] font-extrabold leading-tight mt-1 tabular-nums">{fmtShort(avg)} <span className="text-sm text-muted font-bold">promedio</span></div>
        </div>
        <div className="text-right">
          <div className="text-[22px] font-extrabold leading-tight tabular-nums">{today.length}</div>
          <div className="text-[11px] text-muted font-bold">descansos</div>
        </div>
      </div>
      <div className="flex items-end gap-1.5 h-16 mt-3">
        {last.map((r, i) => (
          <div key={r.at} className="flex-1 h-full flex items-end">
            <motion.div className={`w-full rounded-md ${i === last.length - 1 ? 'bg-accent' : 'bg-surface-3'}`} style={{ originY: 1, height: `${Math.max(8, (r.ms / max) * 100)}%` }}
              initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ ...spring, delay: i * 0.03 }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TimerView({ compact }: { compact?: boolean }) {
  const s = useTimer()
  const now = useClock(s.running)
  const countdown = s.mode === 'countdown'
  const elapsed = elapsedOf(s, now)
  const over = countdown && s.duration - elapsed <= 0
  const idle = !s.running && elapsed === 0
  const size = Math.min(compact ? 280 : 310, (typeof window !== 'undefined' ? window.innerWidth : 375) - 70)

  const main = () => {
    if (countdown && over) timer.restart()
    else timer.toggle()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Segmented value={s.mode} onChange={timer.setMode} options={[{ value: 'stopwatch', label: 'Cronómetro' }, { value: 'countdown', label: 'Descanso' }]} />
        <Press onClick={timer.toggleSound} aria-pressed={s.sound} aria-label="Sonido"
          className={`w-11 h-11 rounded-full flex items-center justify-center border ${s.sound ? 'bg-accent/15 text-accent border-accent/30' : 'bg-surface-2 text-muted border-border'}`}>
          <IconSound on={s.sound} />
        </Press>
      </div>

      <Dial s={s} now={now} size={size} />

      {countdown && (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Press onClick={() => timer.addTime(-15_000)} className="h-10 px-4 rounded-full bg-surface-2 border border-border text-sm font-extrabold tabular-nums">−15s</Press>
            <div className="text-muted text-xs font-bold w-16 text-center tabular-nums">{fmtClock(s.duration)}</div>
            <Press onClick={() => timer.addTime(15_000)} className="h-10 px-4 rounded-full bg-surface-2 border border-border text-sm font-extrabold tabular-nums">+15s</Press>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
            {PRESETS.map(p => {
              const on = s.duration === p
              return (
                <Press key={p} onClick={() => timer.setDuration(p)} aria-pressed={on}
                  className={`relative shrink-0 h-10 px-4 rounded-full text-sm font-extrabold tabular-nums ${on ? 'text-on-accent' : 'text-muted bg-surface-2 border border-border'}`}>
                  {on && <motion.span layoutId={`preset-${compact ? 'c' : 'p'}`} className="absolute inset-0 rounded-full bg-accent" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
                  <span className="relative">{fmtShort(p)}</span>
                </Press>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex items-start justify-between px-2">
        <RoundBtn onClick={timer.reset} label="Reiniciar" disabled={idle}><IconRestart /></RoundBtn>
        <div className="flex flex-col items-center gap-1.5">
          <Press onClick={main} aria-label={s.running && !over ? 'Pausar' : 'Iniciar'}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-[0_18px_40px_-14px_var(--color-accent)] ${over ? 'bg-bad text-white' : 'bg-accent text-on-accent'}`}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={over ? 'r' : s.running ? 'p' : 's'} initial={{ scale: 0.5, opacity: 0, rotate: -45 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.5, opacity: 0 }} transition={spring}>
                {over ? <IconRestart /> : s.running ? <IconPause /> : <IconPlay />}
              </motion.span>
            </AnimatePresence>
          </Press>
          <span className="text-[11px] text-muted font-bold">{over ? 'Otra vez' : s.running ? 'Pausar' : elapsed > 0 ? 'Seguir' : 'Empezar'}</span>
        </div>
        {countdown ? (
          <RoundBtn onClick={() => timer.addTime(30_000)} label="Sumar 30s"><span className="text-base">+30</span></RoundBtn>
        ) : (
          <RoundBtn onClick={timer.lap} label="Vuelta" disabled={!s.running}><span className="text-base">+1</span></RoundBtn>
        )}
      </div>

      {!countdown && <Laps laps={s.laps} />}
      <TodayRests s={s} />
    </div>
  )
}
