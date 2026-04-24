import { useState, Children, isValidElement } from 'react'
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

/* ── Typewriter helpers ── */

const charVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

function flattenChildren(children) {
  const result = []
  Children.forEach(children, (child) => {
    if (child == null || child === false || child === '') return

    if (typeof child === 'string') {
      for (const ch of child) {
        if (ch === ' ') {
          result.push({ type: 'space' })
        } else {
          result.push({ type: 'char', char: ch })
        }
      }
      return
    }

    if (isValidElement(child)) {
      if (child.type === 'br') {
        result.push({ type: 'br' })
        return
      }

      const innerItems = flattenChildren(child.props.children)
      const wrapperProps = { ...child.props }
      delete wrapperProps.children
      const wrapperType = child.type

      for (const item of innerItems) {
        result.push({ ...item, wrapperType, wrapperProps })
      }
    }
  })
  return result
}

export function TypewriterReveal({
  children,
  as = 'h2',
  charStagger = 0.03,
  className = '',
  style,
  amount = 0.12,
}) {
  const [done, setDone] = useState(false)
  const Component = motion[as] || motion.h2
  const items = flattenChildren(children)

  const rendered = []
  let i = 0
  while (i < items.length) {
    const item = items[i]

    if (item.type === 'br') {
      rendered.push(<br key={`br-${i}`} />)
      i++
      continue
    }

    if (item.type === 'space') {
      const space = (
        <motion.span
          key={`sp-${i}`}
          variants={charVariants}
          transition={{ duration: 0.02 }}
          style={{ display: 'inline-block', width: '0.3em' }}
        >
          {'\u00A0'}
        </motion.span>
      )
      if (item.wrapperType) {
        const Wrapper = item.wrapperType
        rendered.push(
          <Wrapper key={`sp-w-${i}`} {...item.wrapperProps}>
            {space}
          </Wrapper>
        )
      } else {
        rendered.push(space)
      }
      i++
      continue
    }

    // item.type === 'char'
    if (item.wrapperType) {
      const Wrapper = item.wrapperType
      const wp = item.wrapperProps
      const group = []
      while (
        i < items.length &&
        items[i].wrapperType === Wrapper &&
        JSON.stringify(items[i].wrapperProps) === JSON.stringify(wp)
      ) {
        const it = items[i]
        if (it.type === 'br') break
        if (it.type === 'space') {
          group.push(
            <motion.span
              key={`sp-${i}`}
              variants={charVariants}
              transition={{ duration: 0.02 }}
              style={{ display: 'inline-block', width: '0.3em' }}
            >
              {'\u00A0'}
            </motion.span>
          )
        } else {
          group.push(
            <motion.span
              key={`ch-${i}`}
              variants={charVariants}
              transition={{ duration: 0.02 }}
              style={{ display: 'inline-block' }}
            >
              {it.char}
            </motion.span>
          )
        }
        i++
      }
      rendered.push(
        <Wrapper key={`wrap-${i}`} {...wp}>
          {group}
        </Wrapper>
      )
    } else {
      rendered.push(
        <motion.span
          key={`ch-${i}`}
          variants={charVariants}
          transition={{ duration: 0.02 }}
          style={{ display: 'inline-block' }}
        >
          {item.char}
        </motion.span>
      )
      i++
    }
  }

  return (
    <Component
      className={`typewriter-cursor ${done ? 'typewriter-cursor--done' : ''} ${className}`}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: charStagger } },
      }}
      onAnimationComplete={() => {
        setTimeout(() => setDone(true), 1000)
      }}
    >
      {rendered}
    </Component>
  )
}
