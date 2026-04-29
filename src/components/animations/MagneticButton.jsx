import { useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

export default function MagneticButton({ children, strength = 0.3, radius = 40 }) {
  const ref = useRef(null)

  const onMouseMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const maxDist = Math.max(rect.width, rect.height) / 2 + radius

    if (dist < maxDist) {
      const pull = (1 - dist / maxDist) * strength
      el.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`
    }
  }, [strength, radius])

  const onMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = ''
    el.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
    setTimeout(() => {
      if (el) el.style.transition = ''
    }, 400)
  }, [])

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return children
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ display: 'inline-block' }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.div>
  )
}
