import { useState, Children, Fragment, isValidElement } from 'react'
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

function extractText(children) {
  let result = ''
  Children.forEach(children, (child) => {
    if (child == null || child === false || child === '') return
    if (typeof child === 'string') {
      result += child
      return
    }
    if (isValidElement(child)) {
      if (child.type === 'br') {
        result += '\n'
        return
      }
      result += extractText(child.props.children)
    }
  })
  return result
}

const SKIP_ATTR = { 'data-live-edit-skip': '' }

// Deterministic pseudo-random in [0, 1) — keeps jitter stable across renders
function tw_rand(i) {
  const x = Math.sin(i * 91.7 + 13.37) * 43758.5453
  return x - Math.floor(x)
}

const LIVE_KEYS = ['data-live-file', 'data-live-line', 'data-live-col']

function pickLiveAttrs(source) {
  const out = {}
  if (!source) return out
  for (const key of LIVE_KEYS) {
    if (source[key] != null) out[key] = source[key]
  }
  return out
}

function stripLiveAttrs(source) {
  if (!source) return source
  const out = { ...source }
  for (const key of LIVE_KEYS) delete out[key]
  return out
}

export function TypewriterReveal({
  children,
  as = 'h2',
  charStagger = 0.075,
  className = '',
  style,
  amount = 0.12,
  ...rest
}) {
  const [done, setDone] = useState(false)
  const [progress, setProgress] = useState(0)
  const Component = motion[as] || motion.h2
  const items = flattenChildren(children)
  const fullText = extractText(children)

  // Live-edit source location: prefer attrs on TypewriterReveal itself
  // (case: <TypewriterReveal>TEXT</TypewriterReveal>); otherwise inherit
  // from the first wrapping element's props (case: <TypewriterReveal><span>TEXT</span></TypewriterReveal>).
  let liveAttrs = pickLiveAttrs(rest)
  if (!liveAttrs['data-live-file']) {
    const firstWithLive = items.find(
      (it) => it.wrapperProps && it.wrapperProps['data-live-file']
    )
    if (firstWithLive) liveAttrs = pickLiveAttrs(firstWithLive.wrapperProps)
  }

  // Strip live-edit attrs from inner wrappers so the only clickable target
  // for the live-edit overlay is the outer Component (with full data-live-text).
  for (const item of items) {
    if (item.wrapperProps) item.wrapperProps = stripLiveAttrs(item.wrapperProps)
  }

  // Two-level grouping:
  // 1. Sections — consecutive items sharing the same wrapperType (or none).
  //    Each section becomes ONE wrapper element so styles like backgrounds
  //    apply continuously across words/spaces inside it. <br/> ends a section.
  // 2. Inside each section, chars are grouped into words. Each word is one
  //    inline-block span so characters can't be broken mid-word at line wrap.
  let charIdx = 0

  const sections = []
  let currentSection = null
  const flushSection = () => {
    if (currentSection) {
      sections.push(currentSection)
      currentSection = null
    }
  }
  for (const item of items) {
    if (item.type === 'br') {
      flushSection()
      sections.push({ type: 'br' })
      continue
    }
    const sameWrapper =
      currentSection &&
      currentSection.type === 'section' &&
      currentSection.wrapperType === item.wrapperType &&
      JSON.stringify(currentSection.wrapperProps) === JSON.stringify(item.wrapperProps)
    if (!sameWrapper) {
      flushSection()
      currentSection = {
        type: 'section',
        wrapperType: item.wrapperType,
        wrapperProps: item.wrapperProps,
        items: [],
      }
    }
    currentSection.items.push(item)
  }
  flushSection()

  const charDelay = (i) => {
    // Deterministic jitter: ±45% of charStagger around the linear schedule
    const jitter = (tw_rand(i) - 0.5) * charStagger * 0.9
    return Math.max(0, i * charStagger + jitter)
  }

  const renderChar = (c) => (
    <Fragment key={`ch-${c.index}`}>
      <motion.span
        {...SKIP_ATTR}
        variants={charVariants}
        transition={{ duration: 0.04, delay: charDelay(c.index) }}
        style={{ display: 'inline-block' }}
        onAnimationComplete={() =>
          setProgress((p) => (c.index + 1 > p ? c.index + 1 : p))
        }
      >
        {c.char}
      </motion.span>
      {!done && progress - 1 === c.index && (
        <span {...SKIP_ATTR} className="typewriter-cursor-anchor" aria-hidden="true">
          <span className="typewriter-cursor-bar" />
        </span>
      )}
    </Fragment>
  )

  const renderSectionContent = (sectionItems) => {
    const groups = []
    let word = null
    const flushWord = () => {
      if (word) {
        groups.push(word)
        word = null
      }
    }
    for (const item of sectionItems) {
      if (item.type === 'space') {
        flushWord()
        groups.push({ type: 'space', index: charIdx++ })
      } else {
        if (!word) word = { type: 'word', chars: [] }
        word.chars.push({ char: item.char, index: charIdx++ })
      }
    }
    flushWord()

    return groups.map((g, gi) => {
      if (g.type === 'space') {
        return <Fragment key={`sp-${g.index}`}>{' '}</Fragment>
      }
      return (
        <span
          key={`w-${gi}-${g.chars[0].index}`}
          {...SKIP_ATTR}
          style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
        >
          {g.chars.map(renderChar)}
        </span>
      )
    })
  }

  const rendered = sections.map((s, idx) => {
    if (s.type === 'br') {
      return <br key={`br-${idx}`} {...SKIP_ATTR} />
    }
    const content = renderSectionContent(s.items)
    if (s.wrapperType) {
      const Wrapper = s.wrapperType
      return (
        <Wrapper key={`sec-${idx}`} {...s.wrapperProps} {...SKIP_ATTR}>
          {content}
        </Wrapper>
      )
    }
    return content
  })

  return (
    <Component
      className={className}
      style={style}
      data-live-text={fullText}
      data-live-file={liveAttrs['data-live-file']}
      data-live-line={liveAttrs['data-live-line']}
      data-live-col={liveAttrs['data-live-col']}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={{ hidden: {}, visible: {} }}
      onAnimationComplete={() => {
        setTimeout(() => setDone(true), 1000)
      }}
    >
      {rendered}
    </Component>
  )
}
