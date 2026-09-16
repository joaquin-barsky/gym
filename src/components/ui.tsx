import { useEffect, type ReactNode } from 'react'

export function Sheet({ open, onClose, title, children, full }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; full?: boolean }) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className={`relative bg-surface border-t border-border rounded-t-3xl safe-bottom flex flex-col ${full ? 'h-[94%]' : 'max-h-[88%]'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="w-10 h-1.5 rounded-full bg-border absolute left-1/2 -translate-x-1/2 top-2" />
          <h2 className="text-lg font-bold mt-2">{title}</h2>
          <button className="text-muted text-sm mt-2 px-2 py-1" onClick={onClose}>Cerrar</button>
        </div>
        <div className="overflow-y-auto px-5 pb-6 flex-1">{children}</div>
      </div>
    </div>
  )
}

export function Stepper({ value, onChange, step = 1, min = 0, label, suffix, big }: {
  value: number; onChange: (v: number) => void; step?: number; min?: number; label: string; suffix?: string; big?: boolean
}) {
  const round = (v: number) => Math.round(v * 100) / 100
  return (
    <div className="flex-1">
      <div className="label mb-1">{label}{suffix ? ` (${suffix})` : ''}</div>
      <div className="flex items-stretch bg-surface-2 border border-border rounded-xl overflow-hidden">
        <button className="px-2.5 text-xl text-muted active:bg-border" onClick={() => onChange(round(Math.max(min, value - step)))}>−</button>
        <div className="flex-1 flex items-center justify-center relative">
          <input
            type="number"
            inputMode="decimal"
            step={step}
            className={`w-full bg-transparent text-center outline-none py-2 ${big ? "text-xl" : "text-base"} font-bold`}
            value={Number.isNaN(value) ? '' : value}
            onChange={e => onChange(e.target.value === '' ? NaN : parseFloat(e.target.value))}
            onFocus={e => e.target.select()}
          />
                  </div>
        <button className="px-2.5 text-xl text-muted active:bg-border" onClick={() => onChange(round((Number.isNaN(value) ? 0 : value) + step))}>+</button>
      </div>
    </div>
  )
}

export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className="flex items-center gap-2">
      <span className={`w-11 h-6 rounded-full relative transition-colors ${value ? 'bg-bad' : 'bg-border'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${value ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
      <span className={`text-sm font-semibold ${value ? 'text-bad' : 'text-muted'}`}>{label}</span>
    </button>
  )
}

export function Chip({ active, onClick, children, color }: { active?: boolean; onClick?: () => void; children: ReactNode; color?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={active && color ? { background: color, borderColor: color, color: '#0b0f14' } : undefined}
      className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${active ? 'bg-accent border-accent text-white' : 'bg-surface-2 border-border text-muted'}`}
    >
      {children}
    </button>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="text-center text-muted text-sm py-10 px-6">{children}</div>
}

export function Header({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="flex items-end justify-between px-5 pt-3 pb-3">
      <div>
        {subtitle && <div className="text-muted text-sm">{subtitle}</div>}
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
      </div>
      {right}
    </div>
  )
}

export function confirmDlg(msg: string): boolean {
  return window.confirm(msg)
}
