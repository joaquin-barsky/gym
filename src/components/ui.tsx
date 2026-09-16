import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useDragControls } from 'motion/react'
import { softSpring } from './motion'

export function Sheet({ open, onClose, title, children, full }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; full?: boolean }) {
  const drag = useDragControls()
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" key="sheet">
          <motion.div
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.18 } }}
            onClick={onClose}
          />
          <motion.div
            className={`relative bg-surface border-t border-white/8 rounded-t-[28px] flex flex-col shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.8)] ${full ? 'h-[92dvh]' : 'max-h-[88dvh]'}`}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%', transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
            transition={softSpring}
            drag="y" dragControls={drag} dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => { if (info.offset.y > 110 || info.velocity.y > 600) onClose() }}
          >
            <div className="pt-2.5 pb-1 px-5 cursor-grab touch-none" onPointerDown={e => drag.start(e)}>
              <div className="w-10 h-1.5 rounded-full bg-white/15 mx-auto" />
              <div className="flex items-center justify-between mt-3">
                <h2 className="text-[22px] font-extrabold tracking-tight">{title}</h2>
                <button className="text-muted text-sm font-semibold px-3 py-2 -mr-3 rounded-xl" onClick={onClose}>Cerrar</button>
              </div>
            </div>
            <div className="overflow-y-auto px-5 pb-8 pt-2 flex-1 safe-bottom">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export function Stepper({ value, onChange, step = 1, min = 0, label, suffix, big }: {
  value: number; onChange: (v: number) => void; step?: number; min?: number; label: string; suffix?: string; big?: boolean
}) {
  const round = (v: number) => Math.round(v * 100) / 100
  const btn = 'w-10 shrink-0 text-xl text-muted active:bg-white/5 active:text-text transition-colors'
  return (
    <div className="flex-1 min-w-0">
      <div className="label mb-1.5">{label}{suffix ? ` ${suffix}` : ''}</div>
      <div className="flex items-stretch bg-surface-2 border border-border rounded-2xl overflow-hidden h-14">
        <button className={btn} onClick={() => onChange(round(Math.max(min, (Number.isNaN(value) ? 0 : value) - step)))} aria-label="Menos">−</button>
        <input
          type="number"
          inputMode="decimal"
          step={step}
          className={`flex-1 min-w-0 bg-transparent text-center outline-none ${big ? 'text-[22px]' : 'text-lg'} font-extrabold tabular-nums`}
          value={Number.isNaN(value) ? '' : value}
          onChange={e => onChange(e.target.value === '' ? NaN : parseFloat(e.target.value))}
          onFocus={e => e.target.select()}
        />
        <button className={btn} onClick={() => onChange(round((Number.isNaN(value) ? 0 : value) + step))} aria-label="Más">+</button>
      </div>
    </div>
  )
}

export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className="flex items-center gap-2.5 py-1 -my-1">
      <span className={`w-12 h-7 rounded-full relative transition-colors duration-200 ${value ? 'bg-bad' : 'bg-surface-3'}`}>
        <motion.span layout transition={{ type: 'spring', stiffness: 600, damping: 35 }} className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow ${value ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
      <span className={`text-sm font-bold ${value ? 'text-bad' : 'text-muted'}`}>{label}</span>
    </button>
  )
}

export function Chip({ active, onClick, children, color }: { active?: boolean; onClick?: () => void; children: ReactNode; color?: string }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      style={active && color ? { background: color, borderColor: color, color: '#0b0f14' } : undefined}
      className={`px-4 h-10 rounded-full text-sm font-bold border transition-colors ${active ? 'bg-accent border-accent text-white' : 'bg-surface-2 border-border text-muted'}`}
    >
      {children}
    </motion.button>
  )
}

/** Control segmentado con indicador que se desliza. */
export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="inline-flex bg-surface-2 border border-border rounded-2xl p-1 gap-0.5 relative">
      {options.map(o => {
        const on = o.value === value
        return (
          <button key={o.value} onClick={() => onChange(o.value)} className={`relative px-4 h-9 rounded-xl text-sm font-bold transition-colors ${on ? 'text-text' : 'text-muted'}`}>
            {on && <motion.span layoutId="seg-pill" className="absolute inset-0 rounded-xl bg-surface-3 shadow" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
            <span className="relative">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="text-center text-muted text-sm py-12 px-6 leading-relaxed">{children}</div>
}

export function Header({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="flex items-end justify-between px-5 pt-4 pb-4">
      <div>
        {subtitle && <div className="label">{subtitle}</div>}
        <h1 className="text-[32px] leading-tight font-extrabold tracking-tight">{title}</h1>
      </div>
      {right}
    </div>
  )
}

export function confirmDlg(msg: string): boolean {
  return window.confirm(msg)
}
