import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function Stage({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.section
      className={className ? `stage ${className}` : 'stage'}
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -14, scale: 0.985 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      aria-live="polite"
    >
      {children}
    </motion.section>
  )
}
