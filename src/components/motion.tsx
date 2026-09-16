import { motion, type HTMLMotionProps, type Variants } from 'motion/react'
import type { ReactNode } from 'react'

export const spring = { type: 'spring', stiffness: 420, damping: 32, mass: 0.8 } as const
export const softSpring = { type: 'spring', stiffness: 260, damping: 28 } as const
export const easeOut = [0.16, 1, 0.3, 1] as const

export const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.02 } },
}
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: easeOut } },
}

/** Botón/tarjeta con feedback de presión tipo iOS. */
export function Press({ children, className = '', ...rest }: HTMLMotionProps<'button'> & { children: ReactNode }) {
  return (
    <motion.button whileTap={{ scale: 0.965 }} transition={spring} className={className} {...rest}>
      {children}
    </motion.button>
  )
}

export function Stagger({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={listVariants} initial="hidden" animate="show" className={className}>
      {children}
    </motion.div>
  )
}

export function Item({ children, className = '', ...rest }: HTMLMotionProps<'div'> & { children: ReactNode }) {
  return (
    <motion.div variants={itemVariants} className={className} {...rest}>
      {children}
    </motion.div>
  )
}

/** Anillo de progreso animado. */
export function Ring({ value, size = 52, stroke = 5, color = 'var(--color-accent)', children }: {
  value: number; size?: number; stroke?: number; color?: string; children?: ReactNode
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.min(1, Math.max(0, value))
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--color-surface-3)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - v) }}
          transition={{ duration: 0.9, ease: easeOut, delay: 0.15 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}
