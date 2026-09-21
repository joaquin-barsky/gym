import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import Logo from './Logo'

/*
  Intro corta y minimalista:
  1. La "g." aparece con un glitch de color (copias cian y magenta que tiemblan y se juntan).
  2. Un brillo lima cruza el logo.
  3. La cámara se mete dentro del punto: la pantalla se vuelve del color del tema y se disuelve hacia la app.
  Se cierra por tiempo (no depende de que termine una animación).
*/

const SIZE = 132
const T_IN = 0.12
const T_SHINE = 0.78
const T_ZOOM = 1.18
const ZOOM_DUR = 0.55
const T_DONE = T_ZOOM + ZOOM_DUR - 0.05
const T_UNMOUNT = T_DONE + 0.45

// Centro del punto dentro del logo (viewBox "22 20 60 64", punto en 72.5, 71.5).
const DOT_ORIGIN = `${((72.5 - 22) / 60) * 100}% ${((71.5 - 20) / 64) * 100}%`

const jitter = (amp: number) => [0, -amp, amp * 0.7, -amp * 0.4, amp * 0.25, 0]
const glitchTimes = [0, 0.2, 0.4, 0.6, 0.8, 1]

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
      <motion.div className={`fixed inset-0 z-[60] bg-bg flex items-center justify-center ${done ? 'pointer-events-none' : ''}`}
        animate={{ opacity: done ? 0 : 1 }} transition={{ duration: 0.3 }}>
        <Logo size={96} />
      </motion.div>
    )
  }

  const glitch = { delay: T_IN, duration: 0.55, times: glitchTimes, ease: 'linear' as const }

  return (
    <motion.div className={`fixed inset-0 z-[60] bg-[#050506] overflow-hidden flex items-center justify-center ${done ? 'pointer-events-none' : ''}`}
      animate={{ opacity: done ? 0 : 1 }} transition={{ duration: 0.45, ease: 'easeOut' }}>

      {/* resplandor suave detrás */}
      <motion.div className="absolute w-[360px] h-[360px] rounded-full"
        style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 65%)', filter: 'blur(50px)' }}
        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: [0, 0.18, 0.12], scale: [0.5, 1.1, 1] }}
        transition={{ delay: T_IN + 0.3, duration: 1, ease: 'easeOut' }} />

      {/* logo: se mete dentro del punto al final */}
      <motion.div className="relative" style={{ width: SIZE, height: SIZE * (64 / 60), transformOrigin: DOT_ORIGIN }}
        initial={{ scale: 1 }} animate={{ scale: [1, 1, 1.06, 60] }}
        transition={{ duration: T_ZOOM + ZOOM_DUR, times: [0, (T_ZOOM - 0.25) / (T_ZOOM + ZOOM_DUR), T_ZOOM / (T_ZOOM + ZOOM_DUR), 1], ease: [0.2, 0, 0.2, 1] }}>

        {/* copias de color del glitch */}
        <motion.div className="absolute inset-0 mix-blend-screen"
          initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.8, 1, 0.6, 0], x: jitter(9).map(v => v - 3), y: jitter(3) }} transition={glitch}>
          <Logo size={SIZE} color="#00e5ff" dotColor="#00e5ff" />
        </motion.div>
        <motion.div className="absolute inset-0 mix-blend-screen"
          initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.8, 1, 0.6, 0], x: jitter(9).map(v => -v + 3), y: jitter(3).map(v => -v) }} transition={glitch}>
          <Logo size={SIZE} color="#ff2d6f" dotColor="#ff2d6f" />
        </motion.div>

        {/* logo principal con parpadeo y corte horizontal */}
        <motion.div className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.9, 0.2, 1, 0.7, 1],
            skewX: [0, -12, 6, -3, 0, 0],
            clipPath: ['inset(0 0 100% 0)', 'inset(30% 0 40% 0)', 'inset(0 0 55% 0)', 'inset(45% 0 0 0)', 'inset(0 0 0 0)', 'inset(0 0 0 0)'],
          }}
          transition={glitch}>
          <Logo size={SIZE} />
        </motion.div>

        {/* brillo que cruza el logo (solo tiñe lo blanco) */}
        <div className="absolute inset-0 overflow-hidden mix-blend-multiply pointer-events-none">
          <motion.div className="absolute inset-y-[-20%] w-[55%]"
            style={{ background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)', rotate: 18 }}
            initial={{ x: '-140%' }} animate={{ x: '260%' }} transition={{ delay: T_SHINE, duration: 0.55, ease: [0.45, 0, 0.2, 1] }} />
        </div>
      </motion.div>

      {/* nombre, abajo */}
      <motion.div className="absolute left-0 right-0 text-center text-[13px] font-extrabold text-text/70 lowercase tracking-[0.45em] pl-[0.45em]"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 56px)' }}
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: [0, 1, 1, 0], y: [8, 0, 0, 0] }}
        transition={{ delay: T_IN + 0.45, duration: T_ZOOM - T_IN - 0.25, times: [0, 0.35, 0.8, 1] }}>
        gym tracker
      </motion.div>

      {/* líneas de escaneo sutiles durante el glitch */}
      <motion.div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 3px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ delay: T_IN, duration: 0.7 }} />
    </motion.div>
  )
}
