import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, exportAll, importAll, uid, wipeAll } from '../db'
import { useSetting } from '../hooks'
import { DEFAULT_THEME, THEMES } from '../themes'
import { Header, confirmDlg } from '../components/ui'
import { Item, Stagger, spring } from '../components/motion'
import { IconCheck } from '../components/icons'
import { fmtDate, fmtKg } from '../lib/stats'
import type { BodyWeight } from '../types'

function ThemeSwatch({ id, name, vars, active, onPick }: { id: string; name: string; vars: Record<string, string>; active: boolean; onPick: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.95 }} transition={spring} onClick={onPick} className="text-left" aria-label={`Tema ${name}`} aria-pressed={active}>
      <div className={`rounded-[20px] p-3 border-2 transition-colors ${active ? 'border-accent' : 'border-border'}`} style={{ background: vars.bg }}>
        <div className="rounded-xl p-2.5 space-y-2" style={{ background: vars.surface }}>
          <div className="flex items-center justify-between">
            <div className="h-2 w-10 rounded-full" style={{ background: vars.text, opacity: 0.9 }} />
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: vars.accent, color: vars['on-accent'] }}>{active && <IconCheck size={12} />}</div>
          </div>
          <div className="h-2 w-16 rounded-full" style={{ background: vars.muted, opacity: 0.6 }} />
          <div className="h-6 rounded-full" style={{ background: vars.accent }} />
        </div>
      </div>
      <div className={`text-sm font-bold mt-2 ml-1 ${active ? 'text-text' : 'text-muted'}`} data-theme-id={id}>{name}</div>
    </motion.button>
  )
}

export default function Settings() {
  const bw = useLiveQuery(() => db.bodyweight.orderBy('date').reverse().limit(5).toArray(), [], [] as BodyWeight[])
  const theme = useSetting<string>('theme', DEFAULT_THEME)
  const goal = useSetting<number>('week_goal', 4)
  const [kg, setKg] = useState('')
  const [msg, setMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true

  const addBw = async () => {
    const v = parseFloat(kg.replace(',', '.'))
    if (!v) return
    await db.bodyweight.add({ id: uid(), date: Date.now(), kg: v })
    setKg('')
  }

  const doExport = async () => {
    const json = await exportAll()
    const name = `gym-backup-${new Date().toISOString().slice(0, 10)}.json`
    const file = new File([json], name, { type: 'application/json' })
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Backup Gym Tracker' })
        return
      }
    } catch { return }
    const url = URL.createObjectURL(file)
    const a = document.createElement('a'); a.href = url; a.download = name; a.click()
    URL.revokeObjectURL(url)
  }

  const doImport = async (f: File) => {
    try {
      if (!confirmDlg('Importar reemplaza TODOS los datos actuales. ¿Seguir?')) return
      await importAll(await f.text())
      setMsg('Backup importado')
    } catch (e) { setMsg('Error: ' + (e as Error).message) }
  }

  return (
    <Stagger className="space-y-7">
      <Item><Header title="Ajustes" /></Item>

      <Item className="px-5">
        <div className="text-[17px] font-extrabold mb-1">Tema</div>
        <div className="text-muted text-sm mb-4">Tocá uno y se aplica al instante.</div>
        <div className="grid grid-cols-2 gap-3">
          {THEMES.map(t => (
            <ThemeSwatch key={t.id} id={t.id} name={t.name} vars={t.vars} active={theme === t.id} onPick={() => db.settings.put({ key: 'theme', value: t.id })} />
          ))}
        </div>
      </Item>

      <Item className="px-5">
        <div className="text-[17px] font-extrabold mb-1">Meta semanal</div>
        <div className="text-muted text-sm mb-3">Cuántos entrenamientos querés hacer por semana. Es lo que marca el anillo de Inicio.</div>
        <div className="card p-2 flex gap-1">
          {[2, 3, 4, 5, 6, 7].map(n => (
            <motion.button key={n} whileTap={{ scale: 0.92 }} transition={spring} onClick={() => db.settings.put({ key: 'week_goal', value: n })}
              className={`relative flex-1 h-12 rounded-full font-extrabold text-base tabular-nums ${goal === n ? 'text-on-accent' : 'text-muted'}`} aria-pressed={goal === n}>
              {goal === n && <motion.span layoutId="goal-pill" className="absolute inset-0 rounded-full bg-accent" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
              <span className="relative">{n}</span>
            </motion.button>
          ))}
        </div>
      </Item>

      <Item className="px-5">
        <div className="text-[17px] font-extrabold mb-3">Peso corporal</div>
        <div className="card p-3 space-y-3">
          <div className="flex gap-2">
            <input className="input" inputMode="decimal" placeholder="kg" value={kg} onChange={e => setKg(e.target.value)} />
            <button className="btn-primary shrink-0" onClick={addBw}>Registrar</button>
          </div>
          {bw.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs text-muted">
              {bw.map(b => <span key={b.id} className="bg-surface-2 rounded-full px-3 py-1.5">{fmtDate(b.date)}: <b className="text-text">{fmtKg(b.kg)} kg</b> <button className="text-bad ml-1" onClick={() => db.bodyweight.delete(b.id)}>×</button></span>)}
            </div>
          )}
        </div>
      </Item>

      <Item className="px-5">
        <div className="text-[17px] font-extrabold mb-3">Backup</div>
        <div className="card p-3 space-y-2">
          <div className="text-sm text-muted px-1 pb-1">Los datos viven solo en este teléfono. Exportá de vez en cuando por las dudas.</div>
          <button className="btn-ghost w-full" onClick={doExport}>Exportar backup</button>
          <button className="btn-ghost w-full" onClick={() => fileRef.current?.click()}>Importar backup</button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) doImport(f); e.target.value = '' }} />
          {msg && <div className="text-sm text-center text-accent">{msg}</div>}
        </div>
      </Item>

      {!isStandalone && (
        <Item className="px-5">
          <div className="text-[17px] font-extrabold mb-3">Instalar como app</div>
          <div className="card p-4 text-sm space-y-1">
            <div className="font-bold">iPhone (Safari)</div>
            <ol className="list-decimal pl-5 text-muted space-y-0.5">
              <li>Tocá el botón <b>Compartir</b> (el cuadrado con la flecha).</li>
              <li>Elegí <b>Agregar a pantalla de inicio</b>.</li>
              <li>Abrila desde el ícono: se ve a pantalla completa, sin barra del navegador.</li>
            </ol>
          </div>
        </Item>
      )}

      <Item className="px-5">
        <div className="text-[17px] font-extrabold mb-3">Zona peligrosa</div>
        <button className="btn-danger w-full" onClick={async () => {
          if (!confirmDlg('¿Borrar TODO? Entrenamientos, rutina, ejercicios. No se puede deshacer.')) return
          if (!confirmDlg('¿Seguro seguro?')) return
          await wipeAll()
        }}>Borrar todos los datos</button>
      </Item>

      <Item className="text-center text-xs text-muted pb-2">Gym Tracker · v1.1</Item>
    </Stagger>
  )
}
