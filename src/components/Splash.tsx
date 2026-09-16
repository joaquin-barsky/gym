import { useEffect } from 'react'
import { motion, useReducedMotion } from 'motion/react'

const LETTERS = ['G', 'Y', 'M']

/** Intro cinematográfica al abrir la app. */
export default function Splash({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion()
  useEffect(() => {
    const t = setTimeout(onDone, reduced ? 500 : 1900)
    return () => clearTimeout(t)
  }, [onDone, reduced])

  if (reduced) {
    return (
      <motion.div className="fixed inset-0 z-[60] bg-bg flex items-center justify-center" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.3 } }}>
        <Mark />
      </motion.div>
    )
  }

  return (
    <motion.div className="fixed inset-0 z-[60] bg-bg overflow-hidden flex flex-col items-center justify-center" exit={{ opacity: 0, scale: 1.06, filter: 'blur(6px)', transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } }}>
      {/* onda de energía */}
      <motion.div className="absolute rounded-full border-2 border-accent" style={{ width: 160, height: 160 }}
        initial={{ scale: 0.2, opacity: 0.9 }} animate={{ scale: 9, opacity: 0 }} transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.15 }} />
      <motion.div className="absolute rounded-full bg-accent" style={{ width: 160, height: 160, filter: 'blur(70px)' }}
        initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: [0.3, 2.2, 1.6], opacity: [0, 0.55, 0.25] }} transition={{ duration: 1.4, ease: 'easeOut', delay: 0.05 }} />

      <motion.div initial={{ scale: 0.35, rotate: -80, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}>
        <Mark />
      </motion.div>

      <div className="flex mt-7 gap-[2px]">
        {LETTERS.map((l, i) => (
          <motion.span key={l} className="text-[44px] font-extrabold tracking-[0.18em] text-text leading-none"
            initial={{ opacity: 0, y: 26, filter: 'blur(14px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.55 + i * 0.09 }}>{l}</motion.span>
        ))}
      </div>
      <motion.div className="label mt-2 text-accent" initial={{ opacity: 0, letterSpacing: '0.6em' }} animate={{ opacity: 1, letterSpacing: '0.3em' }} transition={{ duration: 0.7, delay: 0.95, ease: 'easeOut' }}>
        TRACKER
      </motion.div>

      <motion.div className="absolute bottom-[18%] h-[2px] bg-accent rounded-full" style={{ width: 120 }}
        initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: [0, 1, 1, 0] }} transition={{ duration: 1.1, delay: 0.7, ease: 'easeInOut' }} />
    </motion.div>
  )
}

function Mark() {
  return (
    <div className="relative w-[112px] h-[112px]">
      <div className="absolute inset-0 rounded-full bg-accent shadow-[0_0_60px_-10px_var(--color-accent)]" />
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
        <g transform="rotate(-35 50 50)" fill="var(--color-on-accent)">
          <rect x="31" y="46.5" width="38" height="7" rx="3.5" />
          <rect x="22" y="36" width="10" height="28" rx="4" /><rect x="68" y="36" width="10" height="28" rx="4" />
          <rect x="14" y="41" width="7" height="18" rx="3.5" /><rect x="79" y="41" width="7" height="18" rx="3.5" />
        </g>
      </svg>
    </div>
  )
}
