import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, exportAll, importAll, uid, wipeAll } from '../db'
import { Header, confirmDlg } from '../components/ui'
import { fmtDate, fmtKg } from '../lib/stats'

export default function Settings() {
  const bw = useLiveQuery(() => db.bodyweight.orderBy('date').reverse().limit(5).toArray(), [], [])
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
    } catch { /* cancelado */ return }
    const url = URL.createObjectURL(file)
    const a = document.createElement('a'); a.href = url; a.download = name; a.click()
    URL.revokeObjectURL(url)
  }

  const doImport = async (f: File) => {
    try {
      if (!confirmDlg('Importar reemplaza TODOS los datos actuales. ¿Seguir?')) return
      await importAll(await f.text())
      setMsg('Backup importado ✅')
    } catch (e) { setMsg('Error: ' + (e as Error).message) }
  }

  return (
    <div className="space-y-5">
      <Header title="Ajustes" />

      <section className="px-4">
        <div className="label mb-2">Peso corporal</div>
        <div className="card p-3 space-y-3">
          <div className="flex gap-2">
            <input className="input" inputMode="decimal" placeholder="kg" value={kg} onChange={e => setKg(e.target.value)} />
            <button className="btn-primary" onClick={addBw}>Registrar</button>
          </div>
          {bw.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs text-muted">
              {bw.map(b => <span key={b.id} className="bg-surface-2 rounded-full px-2 py-1">{fmtDate(b.date)}: <b className="text-text">{fmtKg(b.kg)} kg</b> <button className="text-bad ml-1" onClick={() => db.bodyweight.delete(b.id)}>×</button></span>)}
            </div>
          )}
        </div>
      </section>

      <section className="px-4">
        <div className="label mb-2">Backup</div>
        <div className="card p-3 space-y-2">
          <div className="text-sm text-muted">Los datos viven solo en este teléfono. Exportá de vez en cuando por las dudas.</div>
          <button className="btn-ghost w-full" onClick={doExport}>📤 Exportar backup</button>
          <button className="btn-ghost w-full" onClick={() => fileRef.current?.click()}>📥 Importar backup</button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) doImport(f); e.target.value = '' }} />
          {msg && <div className="text-sm text-center text-accent">{msg}</div>}
        </div>
      </section>

      {!isStandalone && (
        <section className="px-4">
          <div className="label mb-2">Instalar como app</div>
          <div className="card p-3 text-sm space-y-1">
            <div className="font-semibold">iPhone (Safari)</div>
            <ol className="list-decimal pl-5 text-muted space-y-0.5">
              <li>Tocá el botón <b>Compartir</b> (el cuadrado con la flecha).</li>
              <li>Elegí <b>Agregar a pantalla de inicio</b>.</li>
              <li>Abrila desde el ícono: se ve a pantalla completa, sin barra del navegador.</li>
            </ol>
          </div>
        </section>
      )}

      <section className="px-4">
        <div className="label mb-2">Zona peligrosa</div>
        <button className="btn-danger w-full" onClick={async () => {
          if (!confirmDlg('¿Borrar TODO? Entrenamientos, rutina, ejercicios. No se puede deshacer.')) return
          if (!confirmDlg('¿Seguro seguro?')) return
          await wipeAll()
        }}>Borrar todos los datos</button>
      </section>

      <div className="text-center text-xs text-muted pb-4">Gym Tracker · v1.0</div>
    </div>
  )
}
