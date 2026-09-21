import { motion } from 'motion/react'

// Marca: "g." geométrica. Anillo + asta con cola, y un punto en el color del tema.
// Mismo trazo que scripts/icons.mjs (grilla de 100×100).
export const G_RING = { cx: 44, cy: 44, r: 15 }
export const G_STEM = 'M59 29 V60 C59 70 52 76 43 76 C37.5 76 33.5 74.5 30.5 71.5'
export const G_DOT = { cx: 72.5, cy: 71.5, r: 6 }
export const G_STROKE = 9.5

/** Logo estático o dibujándose (para la intro). */
export default function Logo({ size = 64, draw = false, delay = 0, color = 'var(--color-text)', dotColor = 'var(--color-accent)' }: {
  size?: number; draw?: boolean; delay?: number; color?: string; dotColor?: string
}) {
  const t = (d: number) => ({ delay: delay + d, duration: 0.55, ease: [0.65, 0, 0.35, 1] as const })
  return (
    <svg viewBox="22 20 60 64" width={size} height={size * (64 / 60)} fill="none" aria-label="Gym">
      <motion.circle cx={G_RING.cx} cy={G_RING.cy} r={G_RING.r} stroke={color} strokeWidth={G_STROKE} strokeLinecap="round"
        transform={`rotate(-90 ${G_RING.cx} ${G_RING.cy})`}
        initial={draw ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={t(0)} />
      <motion.path d={G_STEM} stroke={color} strokeWidth={G_STROKE} strokeLinecap="round" strokeLinejoin="round"
        initial={draw ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={t(0.28)} />
      <motion.circle cx={G_DOT.cx} cy={G_DOT.cy} r={G_DOT.r} fill={dotColor}
        initial={draw ? { y: -46, scale: 0.4, opacity: 0 } : false} animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={draw ? { delay: delay + 0.72, type: 'spring', stiffness: 520, damping: 13 } : undefined} />
    </svg>
  )
}
