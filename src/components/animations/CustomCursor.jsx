import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const CURSOR_STATES = {
  default:   { size: 12, label: null, blend: 'difference' },
  link:      { size: 48, label: null, blend: 'difference' },
  portfolio: { size: 80, label: 'Megnézem', blend: 'exclusion' },
  slider:    { size: 40, label: '↔', blend: 'difference' },
  image:     { size: 60, label: '⌕', blend: 'difference' },
  faq:       { size: 40, label: '+', blend: 'difference' },
  text:      { size: 6, label: null, blend: 'difference', isLine: true },
  cta:       { size: 48, label: null, blend: 'difference', pulse: true },
  dark:      { size: 12, label: null, blend: 'difference', isDark: true },
}

export default function CustomCursor() {
  const [state, setState] = useState('default')
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const springX = useSpring(cursorX, { damping: 25, stiffness: 300 })
  const springY = useSpring(cursorY, { damping: 25, stiffness: 300 })
  const isTouch = useRef(false)

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)')
    isTouch.current = mq.matches
    if (isTouch.current) return

    document.body.classList.add('cursor-active')

    function onMouseMove(e) {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }

    function onMouseOver(e) {
      const target = e.target.closest('[data-cursor]')
      if (target) {
        setState(target.dataset.cursor)
      } else {
        const section = e.target.closest('.ff-section.dark, .ff-hero-wrap')
        setState(section ? 'dark' : 'default')
      }
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('mouseover', onMouseOver, { passive: true })

    return () => {
      document.body.classList.remove('cursor-active')
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseover', onMouseOver)
    }
  }, [cursorX, cursorY])

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null
  }

  const cur = CURSOR_STATES[state] || CURSOR_STATES.default

  return (
    <motion.div
      className="ff-custom-cursor"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        x: springX,
        y: springY,
        pointerEvents: 'none',
        zIndex: 9999,
        mixBlendMode: cur.blend,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        translateX: '-50%',
        translateY: '-50%',
      }}
      animate={{
        width: cur.isLine ? 2 : cur.size,
        height: cur.isLine ? 24 : cur.size,
        borderRadius: cur.isLine ? 1 : cur.size / 2,
      }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
    >
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          backgroundColor: 'white',
        }}
      />

      {cur.pulse && (
        <motion.div
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            border: '1px solid white',
            animation: 'cursor-pulse 1.5s ease-in-out infinite',
          }}
        />
      )}

      {cur.label && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          style={{
            position: 'relative',
            zIndex: 1,
            color: state === 'portfolio' ? 'white' : 'black',
            fontSize: state === 'portfolio' ? 12 : 14,
            fontWeight: 700,
            fontFamily: 'var(--ff-body)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            userSelect: 'none',
          }}
        >
          {cur.label}
        </motion.span>
      )}
    </motion.div>
  )
}
