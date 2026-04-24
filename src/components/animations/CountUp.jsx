import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

export default function CountUp({ value, prefix = '', suffix = '', duration = 1.5, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return

    const num = parseFloat(value)
    if (isNaN(num)) {
      setDisplay(value)
      return
    }

    const start = performance.now()
    const dur = duration * 1000

    function tick(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / dur, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(num * eased))

      if (progress < 1) {
        requestAnimationFrame(tick)
      } else {
        setDisplay(num)
      }
    }

    requestAnimationFrame(tick)
  }, [inView, value, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}{display}{suffix}
    </span>
  )
}
