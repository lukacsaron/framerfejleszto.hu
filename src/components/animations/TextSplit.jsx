import { motion } from 'framer-motion'

export default function TextSplit({ text, stagger = 0.03, className = '', as = 'span' }) {
  const words = text.split(' ')
  const Component = motion[as] || motion.span

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
      style={{ display: 'inline' }}
    >
      {words.map((word, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden' }}>
          <motion.span
            style={{ display: 'inline-block' }}
            variants={{
              hidden: { y: '100%', opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && '\u00A0'}
        </span>
      ))}
    </Component>
  )
}
