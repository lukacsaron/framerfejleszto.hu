import { motion } from 'framer-motion'

const variants = {
  fadeUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
  maskReveal: {
    hidden: { y: '100%' },
    visible: { y: 0 },
  },
  eyebrow: {
    hidden: { opacity: 0, letterSpacing: '0.3em' },
    visible: { opacity: 1, letterSpacing: '0.1em' },
  },
  slideRight: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
}

export function Reveal({
  children,
  variant = 'fadeUp',
  delay = 0,
  duration = 0.6,
  amount = 0.12,
  className = '',
  style,
  as = 'div',
}) {
  const Component = motion[as] || motion.div
  const v = variants[variant] || variants.fadeUp

  return (
    <Component
      className={`ff-velocity-skew ${className}`}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={v}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </Component>
  )
}

export function MaskReveal({ children, delay = 0, className = '', as = 'div' }) {
  const Component = motion[as] || motion.div
  return (
    <div style={{ overflow: 'hidden' }} className={className}>
      <Component
        initial={{ y: '100%' }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{
          duration: 0.6,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </Component>
    </div>
  )
}

export function RevealGroup({
  children,
  stagger = 0.08,
  className = '',
  style,
  amount = 0.12,
}) {
  return (
    <motion.div
      className={`ff-velocity-skew ${className}`}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export function RevealChild({ children, variant = 'fadeUp', className = '', style }) {
  const v = variants[variant] || variants.fadeUp
  return (
    <motion.div
      className={className}
      style={style}
      variants={v}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
