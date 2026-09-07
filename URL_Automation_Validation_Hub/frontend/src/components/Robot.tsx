import { motion } from 'framer-motion'
import { useId } from 'react'
import type { RobotMood } from '../types'
import { cn } from '../lib/format'

type Pointer = { x: number; y: number }

const ARM_RIGHT: Record<RobotMood, number | number[]> = {
  idle: 12,
  hover: -8,
  drop: -38,
  ready: -14,
  uploading: [-10, 8, -10],
  working: [-18, 10, -18],
  done: -118,
  error: 22,
}

const ARM_LEFT: Record<RobotMood, number | number[]> = {
  idle: -10,
  hover: 6,
  drop: 36,
  ready: 8,
  uploading: [8, -6, 8],
  working: [16, -8, 16],
  done: -8,
  error: -24,
}

const armTransition = (mood: RobotMood) =>
  mood === 'working' || mood === 'uploading'
    ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' as const }
    : { type: 'spring' as const, stiffness: 160, damping: 16 }

export function Robot({
  mood,
  size = 'lg',
  pointer,
}: {
  mood: RobotMood
  size?: 'md' | 'lg'
  pointer?: Pointer
}) {
  const uid = useId().replace(/:/g, '')
  const body = `${uid}-body`
  const visor = `${uid}-visor`
  const glow = `${uid}-glow`
  const shadow = `${uid}-shadow`

  const working = mood === 'working' || mood === 'uploading'
  const done = mood === 'done'
  const error = mood === 'error'

  return (
    <motion.div
      className={cn('robot-float', working && 'is-working', error && 'is-error')}
      animate={{
        rotateX: (pointer?.y ?? 0) * -7,
        rotateY: (pointer?.x ?? 0) * 10,
        scale: mood === 'drop' ? 1.04 : 1,
      }}
      transition={{ type: 'spring', stiffness: 180, damping: 18 }}
      style={{ perspective: 800 }}
    >
      <svg
        className={cn('robot', size === 'md' && 'robot--md')}
        viewBox="0 0 220 270"
        fill="none"
        role="img"
        aria-label={`Automation assistant, ${mood}`}
      >
        <defs>
          <linearGradient id={body} x1="70" y1="40" x2="170" y2="230" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4a4c55" />
            <stop offset="1" stopColor="#2d2e35" />
          </linearGradient>
          <linearGradient id={visor} x1="78" y1="70" x2="142" y2="108" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1b1c21" />
            <stop offset="1" stopColor="#111217" />
          </linearGradient>
          <radialGradient id={glow} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(110 88) rotate(90) scale(28 48)">
            <stop stopColor="#FFB700" stopOpacity="0.55" />
            <stop offset="1" stopColor="#FFB700" stopOpacity="0" />
          </radialGradient>
          <filter id={shadow} x="-20%" y="-10%" width="140%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#2D2E35" floodOpacity="0.28" />
          </filter>
        </defs>

        <ellipse cx="110" cy="248" rx="62" ry="10" fill="#FFB700" opacity={working ? 0.28 : 0.14} className="robot-glow" />

        <g filter={`url(#${shadow})`} className="robot-wrap">
          <g className="robot-antenna">
            <path d="M110 28v22" stroke="#3B3D44" strokeWidth="3" strokeLinecap="round" />
            <circle cx="110" cy="24" r="7" fill="#FFB700" />
            <circle cx="110" cy="24" r="3.2" fill="#fff3c2" />
            {!error && <circle cx="110" cy="24" r="11" fill="#FFB700" opacity="0.22" className="robot-glow" />}
          </g>

          <rect x="68" y="46" width="84" height="78" rx="26" fill={`url(#${body})`} />
          <rect x="62" y="72" width="8" height="22" rx="4" fill="#3B3D44" />
          <rect x="150" y="72" width="8" height="22" rx="4" fill="#3B3D44" />
          <rect x="78" y="68" width="64" height="38" rx="19" fill={`url(#${visor})`} />
          <ellipse cx="110" cy="87" rx="34" ry="22" fill={`url(#${glow})`} />

          {!done && (
            <g className="robot-eyes">
              <motion.ellipse
                cx="94"
                cy="86"
                rx={error ? 5.5 : 6.5}
                ry={error ? 5 : 7.5}
                fill="#FFB700"
                initial={false}
                animate={working ? { opacity: [0.65, 1, 0.65] } : { opacity: error ? 0.55 : 1 }}
                transition={working ? { duration: 1.1, repeat: Infinity } : { duration: 0.2 }}
              />
              <motion.ellipse
                cx="126"
                cy="86"
                rx={error ? 5.5 : 6.5}
                ry={error ? 5 : 7.5}
                fill="#FFB700"
                initial={false}
                animate={working ? { opacity: [0.65, 1, 0.65] } : { opacity: error ? 0.55 : 1 }}
                transition={working ? { duration: 1.1, repeat: Infinity, delay: 0.15 } : { duration: 0.2 }}
              />
              <circle cx="92.5" cy="83.5" r="1.6" fill="#fff" opacity="0.85" />
              <circle cx="124.5" cy="83.5" r="1.6" fill="#fff" opacity="0.85" />
            </g>
          )}

          {error && (
            <g stroke="#FFB700" strokeWidth="2.4" strokeLinecap="round" opacity="0.85">
              <path d="M84 70l14 6" />
              <path d="M136 70l-14 6" />
            </g>
          )}

          {working && <rect x="86" y="74" width="48" height="3" rx="1.5" fill="#FFB700" opacity="0.75" className="robot-scan" />}

          {done && (
            <motion.path
              d="M96 86.5l6 6 12-13"
              stroke="#FFB700"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            />
          )}

          <rect x="100" y="122" width="20" height="12" rx="4" fill="#3B3D44" />

          <g transform="translate(58 142)">
            <motion.g
              animate={{ rotate: ARM_LEFT[mood] }}
              transition={armTransition(mood)}
              style={{ originX: '0px', originY: '8px' }}
            >
              <rect x="-8" y="2" width="16" height="46" rx="8" fill="#3B3D44" />
              <rect x="-11" y="42" width="22" height="16" rx="8" fill="#2D2E35" />
            </motion.g>
          </g>

          <g transform="translate(162 142)">
            <motion.g
              animate={{ rotate: ARM_RIGHT[mood] }}
              transition={armTransition(mood)}
              style={{ originX: '0px', originY: '8px' }}
            >
              <rect x="-8" y="2" width="16" height="46" rx="8" fill="#3B3D44" />
              {done ? (
                <g>
                  <rect x="-10" y="40" width="20" height="14" rx="7" fill="#2D2E35" />
                  <rect x="4" y="28" width="8" height="16" rx="4" fill="#2D2E35" />
                </g>
              ) : (
                <rect x="-11" y="42" width="22" height="16" rx="8" fill="#2D2E35" />
              )}
            </motion.g>
          </g>

          <rect x="70" y="132" width="80" height="86" rx="24" fill={`url(#${body})`} />
          <rect x="88" y="150" width="44" height="30" rx="10" fill="#1b1c21" />

          {working ? (
            <g>
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.rect
                  key={i}
                  x={94 + i * 5.2}
                  y={168}
                  width="3.4"
                  rx="1"
                  fill="#FFB700"
                  animate={{ height: [5, 14, 7, 12, 5], y: [168, 159, 166, 161, 168] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.08 }}
                />
              ))}
            </g>
          ) : done ? (
            <path d="M102 165l6 6 12-12" stroke="#FFB700" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          ) : error ? (
            <g fill="#FFB700">
              <rect x="108" y="156" width="4" height="12" rx="1.5" />
              <circle cx="110" cy="174" r="2.2" />
            </g>
          ) : (
            <g fill="#FFB700">
              <circle cx="102" cy="165" r="2.4" opacity="0.45" />
              <circle cx="110" cy="165" r="2.4" />
              <circle cx="118" cy="165" r="2.4" opacity="0.45" />
            </g>
          )}

          <circle cx="86" cy="196" r="3" fill="#FFB700" opacity={working ? 1 : 0.55} className="robot-glow" />
          <circle cx="134" cy="196" r="3" fill="#FFB700" opacity="0.4" />
          <rect x="98" y="208" width="10" height="14" rx="3" fill="#3B3D44" />
          <rect x="112" y="208" width="10" height="14" rx="3" fill="#3B3D44" />
        </g>
      </svg>
    </motion.div>
  )
}
