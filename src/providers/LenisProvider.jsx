import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export default function LenisProvider({ children }) {
  const lenisRef = useRef(null)

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
    })
    lenisRef.current = lenis

    let lastVelocity = 0

    function raf(time) {
      lenis.raf(time)

      const velocity = Math.min(Math.abs(lenis.velocity) / 1000, 3)
      if (Math.abs(velocity - lastVelocity) > 0.01) {
        document.documentElement.style.setProperty('--scroll-velocity', velocity.toFixed(3))
        lastVelocity = velocity
      }

      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
      document.documentElement.style.setProperty('--scroll-velocity', '0')
    }
  }, [])

  return children
}
