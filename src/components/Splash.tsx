import { useEffect, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import Logo from './Logo'

/*
  Intro: cuenta regresiva de película.
  1. Cola de película: círculos, mira y un barrido que gira mientras cuenta 3 · 2 · 1, con parpadeo de proyector.
  2. Destello, la "g." se dibuja sola y cae el punto con rebote.
  3. Se abre un iris desde el centro y aparece la app.
  Se cierra por tiempo (no depende de que termine una animación).
*/

const STEP = 0.36
const NUMS = [3, 2, 1]
const T_FLASH = 0.12 + STEP * NUMS.length
const T_LOGO = T_FLASH + 0.1
const T_WORD = T_LOGO + 0.72
const T_IRIS = T_WORD + 0.55
const IRIS_DUR = 0.6
const T_DONE = T_IRIS + 0.05
const T_UNMOUNT = T_IRIS + IRIS_DUR + 0.05

const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>")`

function Leader() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const ids = NUMS.map((_, k) => setTimeout(() => setI(k), (0.12 + k * STEP) * 1000))
    return () => ids.forEach(clearTimeout)
  }, [])
  const C = 2 * Math.PI * 50
  return (
    <motion.div className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0.82, 1, 0.9, 1, 0.85, 1, 0], scale: [1.04, 1, 1, 1, 1, 1, 1, 1, 1.25] }}
      transition={{ duration: T_FLASH + 0.08, times: [0, 0.08, 0.2, 0.3, 0.45, 0.6, 0.72, 0.88, 1], ease: 'linear' }}>
      {/* mira */}
      <div className="absolute left-0 right-0 top-1/2 h-px bg-white/15" />
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/15" />
      <div className="relative w-[250px] h-[250px]">
        <svg viewBox="0 0 250 250" className="absolute inset-0 w-full h-full">
          <circle cx="125" cy="125" r="122" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2" />
          <circle cx="125" cy="125" r="100" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" />
          {/* barrido tipo cola de película */}
          <motion.circle key={i} cx="125" cy="125" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="100"
            strokeDasharray={C} transform="rotate(-90 125 125)"
            initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: 0 }} transition={{ duration: STEP, ease: 'linear' }} />
          <motion.circle key={`r${i}`} cx="125" cy="125" r="100" fill="none" stroke="var(--color-accent)" strokeWidth="3"
            initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} transition={{ duration: 0.3 }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={NUMS[i]} className="text-[132px] font-extrabold leading-none text-text tabular-nums"
              initial={{ scale: 1.35, opacity: 0, filter: 'blur(8px)' }} animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.08 } }} transition={{ duration: 0.16, ease: 'easeOut' }}>
              {NUMS[i]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
      {/* marcas de cuadro */}
      {[0, 1, 2, 3].map(k => (
        <div key={k} className="absolute w-5 h-5 border-white/30"
          style={{
            top: k < 2 ? '14%' : undefined, bottom: k >= 2 ? '14%' : undefined,
            left: k % 2 === 0 ? '10%' : undefined, right: k % 2 === 1 ? '10%' : undefined,
            borderTopWidth: k < 2 ? 2 : 0, borderBottomWidth: k >= 2 ? 2 : 0,
            borderLeftWidth: k % 2 === 0 ? 2 : 0, borderRightWidth: k % 2 === 1 ? 2 : 0,
          }} />
      ))}
    </motion.div>
  )
}

export default function Splash({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion()
  const [done, setDone] = useState(false)
  const iris = useMotionValue(0)
  const mask = useTransform(iris, r => `radial-gradient(circle at 50% 50%, transparent ${r}%, #000 ${r + 0.6}%)`)
  // El radio del gradiente (farthest-corner) es la media diagonal; el anillo mide 100vmax de diámetro.
  const diag = Math.hypot(window.innerWidth / 2, window.innerHeight / 2)
  const base = Math.max(window.innerWidth, window.innerHeight) / 2
  const ringScale = useTransform(iris, r => (r / 100) * diag / base)

  useEffect(() => {
    const t1 = setTimeout(() => setDone(true), (reduced ? 0.5 : T_DONE) * 1000)
    const t2 = setTimeout(onDone, (reduced ? 0.9 : T_UNMOUNT) * 1000)
    const a = reduced ? null : animate(iris, 110, { delay: T_IRIS, duration: IRIS_DUR, ease: [0.76, 0, 0.24, 1] })
    return () => { clearTimeout(t1); clearTimeout(t2); a?.stop() }
  }, [onDone, reduced, iris])

  if (reduced) {
    return (
      <motion.div className={`fixed inset-0 z-[60] bg-bg flex items-center justify-center ${done ? 'pointer-events-none' : ''}`}
        animate={{ opacity: done ? 0 : 1 }} transition={{ duration: 0.3 }}>
        <Logo size={96} />
      </motion.div>
    )
  }

  return (
    <div className={`fixed inset-0 z-[60] ${done ? 'pointer-events-none' : ''}`}>
      {/* capa negra con el agujero del iris */}
      <motion.div className="absolute inset-0 bg-[#050506] overflow-hidden" style={{ maskImage: mask, WebkitMaskImage: mask }}>
        <Leader />

        {/* destello */}
        <motion.div className="absolute inset-0 bg-white pointer-events-none"
          initial={{ opacity: 0 }} animate={{ opacity: [0, 0.85, 0] }} transition={{ delay: T_FLASH, duration: 0.28, times: [0, 0.2, 1] }} />
        <motion.div className="absolute left-1/2 top-1/2 w-[420px] h-[420px] -ml-[210px] -mt-[210px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 60%)', filter: 'blur(40px)' }}
          initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: [0, 0.45, 0.2], scale: [0.3, 1.2, 1] }} transition={{ delay: T_FLASH, duration: 1.2, ease: 'easeOut' }} />

        {/* marca */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div initial={{ opacity: 0, scale: 1.25 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: T_LOGO, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            <Logo size={118} draw delay={T_LOGO} />
          </motion.div>
          <motion.div className="mt-6 text-[15px] font-extrabold text-text/90 lowercase"
            initial={{ opacity: 0, letterSpacing: '0.9em', filter: 'blur(6px)' }} animate={{ opacity: 1, letterSpacing: '0.42em', filter: 'blur(0px)' }}
            transition={{ delay: T_WORD, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
            gym tracker
          </motion.div>
        </div>

        {/* grano y viñeta */}
        <motion.div className="absolute inset-[-50%] pointer-events-none opacity-[0.09] mix-blend-overlay"
          style={{ backgroundImage: GRAIN, backgroundSize: '140px 140px' }}
          animate={{ x: [0, -24, 18, -8, 0], y: [0, 16, -22, 12, 0] }} transition={{ duration: 0.4, repeat: Infinity, ease: 'linear' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 100%)' }} />
      </motion.div>

      {/* borde luminoso del iris */}
      <motion.div className="absolute left-1/2 top-1/2 w-[100vmax] h-[100vmax] -ml-[50vmax] -mt-[50vmax] rounded-full border-[3px] border-accent pointer-events-none"
        style={{ scale: ringScale, boxShadow: '0 0 40px var(--color-accent)' }}
        initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ delay: T_IRIS, duration: IRIS_DUR, times: [0, 0.2, 1] }} />
    </div>
  )
}
