import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export default function LenisProvider({ children }) {
  const lenisRef = useRef(null)

  useEffect(() => {
    let lenis
    let rafId
    let cancelled = false
    let lastVelocity = 0

    function raf(time) {
      if (!lenis || cancelled) return
      lenis.raf(time)

      const velocity = Math.min(Math.abs(lenis.velocity) / 1000, 3)
      if (Math.abs(velocity - lastVelocity) > 0.01) {
        document.documentElement.style.setProperty('--scroll-velocity', velocity.toFixed(3))
        lastVelocity = velocity
      }

      rafId = requestAnimationFrame(raf)
    }

    function init() {
      if (cancelled) return
      lenis = new Lenis({ lerp: 0.1, duration: 1.2 })
      lenisRef.current = lenis
      rafId = requestAnimationFrame(raf)
    }

    // Defer Lenis init until the browser is idle, so it doesn't compete
    // with hydration / first paint.
    const ric = window.requestIdleCallback || ((cb) => setTimeout(cb, 1))
    const idleId = ric(init, { timeout: 2000 })

    return () => {
      cancelled = true
      if (rafId) cancelAnimationFrame(rafId)
      if (window.cancelIdleCallback && typeof idleId === 'number') {
        window.cancelIdleCallback(idleId)
      }
      if (lenis) {
        lenis.destroy()
        document.documentElement.style.setProperty('--scroll-velocity', '0')
      }
    }
  }, [])

  return children
}
