import { motion } from 'motion/react'

/** Fondo ambiental: manchas de color desenfocadas que flotan lento + trama de puntos. */
export default function Ambient() {
  const blob = 'absolute rounded-full will-change-transform'
  return (
    <div className="absolute inset-x-0 top-0 h-[760px] overflow-hidden pointer-events-none" aria-hidden>
      <motion.div className={blob} style={{ width: 440, height: 440, left: -160, top: -200, background: 'var(--color-accent)', filter: 'blur(90px)', opacity: 0.34 }}
        animate={{ x: [0, 50, -20, 0], y: [0, 40, 70, 0], scale: [1, 1.15, 0.95, 1] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className={blob} style={{ width: 380, height: 380, right: -180, top: 40, background: 'var(--color-accent)', filter: 'blur(100px) hue-rotate(70deg)', opacity: 0.22 }}
        animate={{ x: [0, -60, 20, 0], y: [0, 60, -30, 0], scale: [1, 0.9, 1.1, 1] }} transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />
      <motion.div className={blob} style={{ width: 300, height: 300, left: 60, top: 420, background: 'var(--color-accent)', filter: 'blur(110px) hue-rotate(-40deg)', opacity: 0.14 }}
        animate={{ x: [0, 40, -40, 0], y: [0, -50, 20, 0] }} transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 4 }} />
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1.2px)',
        backgroundSize: '22px 22px',
        maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.35) 45%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.35) 45%, transparent 100%)',
      }} />
      <div className="absolute inset-x-0 bottom-0 h-40" style={{ background: 'linear-gradient(180deg, transparent, var(--color-bg))' }} />
    </div>
  )
}
