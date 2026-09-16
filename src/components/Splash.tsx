import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

/*
  Intro cinematográfica: "cargar la barra".
  1. Franjas de cine y grano. Una línea de luz se abre y se convierte en la barra.
  2. Entran los discos de a pares, cada uno con destello y temblor de cámara; los kilos suben.
  3. La barra se levanta, un barrido de luz cruza la pantalla y aparece la marca.
  4. Se abren las franjas y la escena se funde hacia la app.
  Se cierra por tiempo (no depende de que termine una animación).
*/

// Distancia desde el centro, ancho y alto de cada disco (del más pesado al más liviano).
const PLATES = [
  { d: 64, w: 13, h: 118, kg: 25 },
  { d: 79, w: 12, h: 100, kg: 20 },
  { d: 93, w: 10, h: 80, kg: 15 },
  { d: 105, w: 9, h: 60, kg: 10 },
]
const T_BAR = 0.15
const T_PLATE0 = 0.62
const T_STEP = 0.19
const HIT = 0.16 // tiempo desde que arranca el disco hasta el golpe
const T_LIFT = T_PLATE0 + PLATES.length * T_STEP + 0.12
const T_BRAND = T_LIFT + 0.22
const T_OPEN = T_BRAND + 0.62
const T_DONE = T_OPEN + 0.12
const T_UNMOUNT = T_DONE + 0.55

const impacts = PLATES.map((_, i) => T_PLATE0 + i * T_STEP + HIT)
const totalKg = (n: number) => 20 + PLATES.slice(0, n).reduce((a, p) => a + p.kg * 2, 0)

function shakeKeyframes() {
  const end = T_LIFT
  const xs: number[] = [0], ys: number[] = [0], times: number[] = [0]
  impacts.forEach((t, i) => {
    const amp = 2.2 + i * 0.9
    const push = (dt: number, x: number, y: number) => { times.push((t + dt) / end); xs.push(x); ys.push(y) }
    push(0, 0, 0)
    push(0.025, amp, amp * 1.4)
    push(0.055, -amp * 0.7, -amp * 0.6)
    push(0.09, amp * 0.3, amp * 0.25)
    push(0.13, 0, 0)
  })
  times.push(1); xs.push(0); ys.push(0)
  return { xs, ys, times, duration: end }
}
const SHAKE = shakeKeyframes()

const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>")`

const ease = [0.16, 1, 0.3, 1] as const

function Plate({ side, i }: { side: -1 | 1; i: number }) {
  const p = PLATES[i]
  const start = T_PLATE0 + i * T_STEP
  const heavy = i === 0
  return (
    <div className="absolute top-1/2 left-1/2" style={{ transform: `translate(${side * p.d - p.w / 2}px, -50%)` }}>
      <motion.div
        className="rounded-[4px] relative overflow-hidden"
        style={{
          width: p.w, height: p.h,
          background: heavy
            ? 'linear-gradient(90deg, color-mix(in srgb, var(--color-accent) 70%, black) 0%, var(--color-accent) 45%, color-mix(in srgb, var(--color-accent) 60%, black) 100%)'
            : 'linear-gradient(90deg, #1b1c21 0%, #3a3b43 45%, #17181c 100%)',
          boxShadow: heavy ? '0 0 24px -4px var(--color-accent)' : 'inset 0 0 0 1px rgba(255,255,255,0.06)',
        }}
        initial={{ x: side * 140, opacity: 0, scaleY: 0.55, filter: 'blur(6px)' }}
        animate={{ x: 0, opacity: 1, scaleY: 1, filter: 'blur(0px)' }}
        transition={{ delay: start, duration: HIT, ease: [0.55, 0, 0.85, 0.35] }}
      >
        {!heavy && <div className="absolute inset-y-0 left-1/2 w-px bg-accent/40" />}
      </motion.div>
      {/* destello del golpe */}
      <motion.div className="absolute top-1/2 left-1/2 rounded-full pointer-events-none"
        style={{ width: 90, height: 90, marginLeft: -45, marginTop: -45, background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 65%)' }}
        initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: [0, 0.9, 0], scale: [0.3, 1.3, 1.6] }}
        transition={{ delay: start + HIT - 0.01, duration: 0.38, ease: 'easeOut' }} />
      {/* chispas */}
      {[0, 1, 2].map(k => (
        <motion.div key={k} className="absolute top-1/2 left-1/2 w-[3px] h-[3px] rounded-full bg-accent"
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], x: side * (18 + k * 10), y: (k - 1) * 26 }}
          transition={{ delay: start + HIT, duration: 0.35, ease: 'easeOut' }} />
      ))}
    </div>
  )
}

function KgCounter() {
  const [n, setN] = useState(0)
  useEffect(() => {
    const ids = impacts.map((t, i) => setTimeout(() => setN(i + 1), t * 1000))
    return () => ids.forEach(clearTimeout)
  }, [])
  const kg = totalKg(n)
  return (
    <motion.div className="flex items-end justify-center gap-2 h-[64px]"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: T_PLATE0 - 0.1, duration: 0.4, ease }}>
      <div className="relative h-[64px] overflow-hidden min-w-[120px] flex justify-end">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={kg} className="block text-[60px] leading-[64px] font-extrabold tabular-nums tracking-tight text-text"
            initial={{ y: 40, opacity: 0, filter: 'blur(6px)' }} animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }} exit={{ y: -40, opacity: 0, filter: 'blur(6px)' }}
            transition={{ duration: 0.22, ease }}>
            {kg}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-accent font-extrabold text-lg tracking-[0.2em] pb-2.5">KG</span>
    </motion.div>
  )
}

function Barbell() {
  return (
    <div className="relative w-[250px] h-[130px]">
      {/* barra: una línea de luz que se abre desde el centro */}
      <motion.div className="absolute top-1/2 left-0 right-0 h-[5px] -mt-[2.5px] rounded-full origin-center"
        style={{ background: 'linear-gradient(90deg, transparent 0%, #6f707a 8%, #d9dae0 50%, #6f707a 92%, transparent 100%)' }}
        initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ delay: T_BAR, duration: 0.5, ease }} />
      <motion.div className="absolute top-1/2 left-1/2 h-[2px] -mt-[1px] rounded-full bg-accent"
        style={{ width: 250, marginLeft: -125, filter: 'blur(3px)' }}
        initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: [0, 1, 1], opacity: [0, 1, 0.25] }} transition={{ delay: T_BAR, duration: 0.8, ease }} />
      {/* agarre moleteado */}
      <motion.div className="absolute top-1/2 left-1/2 w-[70px] h-[7px] -mt-[3.5px] -ml-[35px] rounded-sm"
        style={{ background: 'repeating-linear-gradient(90deg, #9a9ba3 0 1px, #55565d 1px 3px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: T_BAR + 0.35, duration: 0.3 }} />
      {/* topes */}
      {([-1, 1] as const).map(side => (
        <motion.div key={side} className="absolute top-1/2 left-1/2 w-[7px] h-[24px] rounded-[2px] bg-[#8d8e96]"
          style={{ transform: `translate(${side * 54 - 3.5}px, -50%)` }}
          initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} transition={{ delay: T_BAR + 0.4, duration: 0.25, ease }} />
      ))}
      {PLATES.map((_, i) => ([-1, 1] as const).map(side => <Plate key={`${i}${side}`} side={side} i={i} />))}
    </div>
  )
}

export default function Splash({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion()
  const [done, setDone] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setDone(true), (reduced ? 0.5 : T_DONE) * 1000)
    const t2 = setTimeout(onDone, (reduced ? 0.9 : T_UNMOUNT) * 1000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone, reduced])

  if (reduced) {
    return (
      <motion.div className={`fixed inset-0 z-[60] bg-bg flex flex-col items-center justify-center ${done ? 'pointer-events-none' : ''}`}
        animate={{ opacity: done ? 0 : 1 }} transition={{ duration: 0.3 }}>
        <div className="text-[56px] font-extrabold tracking-[0.3em] pl-[0.3em]">GYM</div>
        <div className="label text-accent tracking-[0.5em] pl-[0.5em]">TRACKER</div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={`fixed inset-0 z-[60] overflow-hidden bg-[#050506] ${done ? 'pointer-events-none' : ''}`}
      animate={done ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* escena con cámara que tiembla, se acerca despacio y al final vuela hacia adelante */}
      <motion.div className="absolute inset-0"
        initial={{ scale: 1.08 }}
        animate={done ? { scale: 1.35, filter: 'blur(10px)' } : { scale: 1 }}
        transition={done ? { duration: 0.55, ease: [0.7, 0, 0.84, 0] } : { duration: T_OPEN, ease: 'linear' }}>
        <motion.div className="absolute inset-0 flex flex-col items-center justify-center"
          animate={{ x: SHAKE.xs, y: SHAKE.ys }} transition={{ duration: SHAKE.duration, times: SHAKE.times, ease: 'linear' }}>

          {/* luz de piso */}
          <motion.div className="absolute left-1/2 top-1/2 w-[520px] h-[520px] -ml-[260px] -mt-[260px] rounded-full"
            style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 62%)', filter: 'blur(30px)' }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 0.08, 0.1, 0.22, 0.34, 0.26], scale: [0.4, 0.6, 0.7, 0.85, 1, 1.1] }}
            transition={{ duration: T_OPEN, times: [0, 0.2, 0.4, 0.6, 0.8, 1], ease: 'easeOut' }} />

          <motion.div className="relative flex flex-col items-center"
            animate={{ y: [0, 0, -54] }} transition={{ duration: T_LIFT + 0.5, times: [0, T_LIFT / (T_LIFT + 0.5), 1], ease: [0.3, 0, 0.1, 1] }}>
            <motion.div animate={{ opacity: [1, 1, 0], y: [0, 0, -20] }} transition={{ duration: T_BRAND + 0.2, times: [0, T_LIFT / (T_BRAND + 0.2), 1] }}>
              <KgCounter />
            </motion.div>
            <motion.div className="mt-6" animate={{ scale: [1, 1, 0.82] }} transition={{ duration: T_LIFT + 0.5, times: [0, T_LIFT / (T_LIFT + 0.5), 1], ease }}>
              <Barbell />
            </motion.div>
          </motion.div>

          {/* marca */}
          <div className="absolute left-0 right-0 flex flex-col items-center" style={{ top: 'calc(50% + 70px)' }}>
            <div className="flex">
              {'GYM'.split('').map((l, i) => (
                <span key={l} className="overflow-hidden inline-block px-[0.12em]">
                  <motion.span className="inline-block text-[64px] leading-[0.95] font-extrabold text-text"
                    initial={{ y: '105%', rotate: 8 }} animate={{ y: '0%', rotate: 0 }}
                    transition={{ delay: T_BRAND + i * 0.07, duration: 0.55, ease }}>{l}</motion.span>
                </span>
              ))}
            </div>
            <motion.div className="h-[3px] w-[150px] bg-accent rounded-full mt-3 origin-left"
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: T_BRAND + 0.22, duration: 0.45, ease }} />
            <motion.div className="label text-muted mt-3" initial={{ opacity: 0, letterSpacing: '1em' }} animate={{ opacity: 1, letterSpacing: '0.45em' }}
              transition={{ delay: T_BRAND + 0.3, duration: 0.6, ease }}>TRACKER</motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* barrido de luz */}
      <motion.div className="absolute inset-y-[-20%] w-[45%] pointer-events-none mix-blend-screen"
        style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-accent) 55%, white) 50%, transparent)', rotate: 16, filter: 'blur(18px)' }}
        initial={{ x: '-120vw', opacity: 0 }} animate={{ x: '160vw', opacity: [0, 0.5, 0.5, 0] }}
        transition={{ delay: T_LIFT, duration: 0.8, ease: [0.45, 0, 0.2, 1] }} />

      {/* grano + viñeta */}
      <motion.div className="absolute inset-[-50%] pointer-events-none opacity-[0.07] mix-blend-overlay"
        style={{ backgroundImage: GRAIN, backgroundSize: '160px 160px' }}
        animate={{ x: [0, -30, 20, -10, 0], y: [0, 20, -25, 15, 0] }} transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.85) 100%)' }} />

      {/* franjas de cine */}
      <motion.div className="absolute top-0 left-0 right-0 bg-black origin-top" style={{ height: '14vh' }}
        initial={{ scaleY: 1.6 }} animate={{ scaleY: [1.6, 1, 1, 0] }} transition={{ duration: T_DONE, times: [0, 0.12, T_OPEN / T_DONE, 1], ease: [0.7, 0, 0.3, 1] }} />
      <motion.div className="absolute bottom-0 left-0 right-0 bg-black origin-bottom" style={{ height: '14vh' }}
        initial={{ scaleY: 1.6 }} animate={{ scaleY: [1.6, 1, 1, 0] }} transition={{ duration: T_DONE, times: [0, 0.12, T_OPEN / T_DONE, 1], ease: [0.7, 0, 0.3, 1] }} />
      <motion.div className="absolute left-5 bottom-[4.5vh] text-[10px] font-bold tracking-[0.3em] text-white/35 tabular-nums"
        initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: T_OPEN, times: [0, 0.15, 0.85, 1] }}>
        REC ● {new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
      </motion.div>
    </motion.div>
  )
}
