import { animate, useMotionValue, useMotionValueEvent } from 'framer-motion'
import { useEffect, useState } from 'react'

export function AnimatedNumber({ value }: { value: number }) {
  const motionValue = useMotionValue(0)
  const [text, setText] = useState('0')

  useMotionValueEvent(motionValue, 'change', (latest) => {
    setText(Math.round(latest).toLocaleString())
  })

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.45, ease: 'easeOut' })
    return () => controls.stop()
  }, [motionValue, value])

  return <span>{text}</span>
}
