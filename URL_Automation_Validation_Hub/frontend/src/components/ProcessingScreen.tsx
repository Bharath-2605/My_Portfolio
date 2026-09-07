import { Check, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { JobStats, LiveUrl } from '../types'
import { AnimatedNumber } from './AnimatedNumber'
import { Robot } from './Robot'

const PIPELINE = ['Excel File', 'Robot', 'URL Checking', 'Validation', 'Results'] as const

function activeIndex(progress: number): number {
  if (progress < 12) return 0
  if (progress < 28) return 1
  if (progress < 62) return 2
  if (progress < 86) return 3
  return 4
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className="progress-block">
      <div className="progress-row">
        <span>{label}</span>
        <span aria-hidden="true">{clamped}%</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-label={`Processing ${clamped} percent`}
      >
        <div className="progress-fill" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  )
}

export function ProcessingStats({ stats }: { stats: JobStats }) {
  const items = [
    { label: 'URLs Found', value: stats.urlsFound },
    { label: 'Checked', value: stats.checked },
    { label: 'Working', value: stats.working },
    { label: 'Not Working', value: stats.notWorking },
    { label: 'Remaining', value: stats.remaining },
  ]
  return (
    <div className="stats-grid">
      {items.map((item) => (
        <div className="stat-card" key={item.label}>
          <span>{item.label}</span>
          <strong>
            <AnimatedNumber value={item.value} />
          </strong>
        </div>
      ))}
    </div>
  )
}

export function URLActivity({ urls }: { urls: LiveUrl[] }) {
  return (
    <div className="url-rail" aria-label="Live URL checks">
      <AnimatePresence initial={false}>
        {urls.map((item) => (
          <motion.div
            key={item.id}
            className={`url-chip url-chip--${item.result}`}
            initial={{ opacity: 0, x: 18, filter: 'blur(6px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
            layout
          >
            <span className="url-chip__host">{item.url}</span>
            <span className="url-chip__state">
              {item.result === 'working' ? <Check size={13} /> : <X size={13} />}
              {item.result === 'working' ? 'Working' : 'Not Working'}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function Pipeline({ progress }: { progress: number }) {
  const current = activeIndex(progress)
  return (
    <div className="pipeline" aria-hidden="true">
      {PIPELINE.map((label, index) => (
        <div className={`pipeline-step ${index <= current ? 'is-active' : ''}`} key={label}>
          <div className="pipeline-rail">
            <span className="pipeline-dot" />
            {index < PIPELINE.length - 1 && (
              <span className="pipeline-line">{index <= current && <span className="pipeline-packet" />}</span>
            )}
          </div>
          <span className="pipeline-label">{label}</span>
        </div>
      ))}
    </div>
  )
}

const PARTICLES = [
  { left: '18%', top: '22%', delay: 0 },
  { left: '78%', top: '18%', delay: 0.4 },
  { left: '14%', top: '62%', delay: 0.8 },
  { left: '82%', top: '58%', delay: 1.1 },
  { left: '28%', top: '78%', delay: 0.2 },
  { left: '70%', top: '80%', delay: 0.6 },
]

export function ProcessingScreen({
  message,
  progress,
  stats,
  urls,
}: {
  message: string
  progress: number
  stats: JobStats
  urls: LiveUrl[]
}) {
  return (
    <div className="process-shell">
      <div className="process-heading">
        <h1>Processing Your File...</h1>
        <p>{message}</p>
      </div>
      <ProgressBar value={progress} label="Processing..." />
      <div className="process-layout">
        <Pipeline progress={progress} />
        <div className="robot-arena">
          <div className="scan-beam" />
          {PARTICLES.map((particle, index) => (
            <motion.span
              key={index}
              className="particle"
              style={{ left: particle.left, top: particle.top }}
              animate={{ y: [0, -18, 0], opacity: [0.25, 1, 0.25], scale: [0.8, 1.15, 0.8] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: particle.delay }}
            />
          ))}
          <Robot mood="working" />
        </div>
        <URLActivity urls={urls} />
      </div>
      <ProcessingStats stats={stats} />
    </div>
  )
}
