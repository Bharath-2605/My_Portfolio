import { Download, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import type { JobResults } from '../types'
import { AnimatedNumber } from './AnimatedNumber'
import { Button } from './Button'
import { Robot } from './Robot'
import { formatDuration } from '../lib/format'

export function ResultsSummary({ results }: { results: JobResults }) {
  const cards = [
    { label: 'Total URLs', value: results.totalUrls },
    { label: 'Working', value: results.workingUrls },
    { label: 'Not Working', value: results.notWorking },
  ]
  return (
    <div className="summary-grid">
      {cards.map((card) => (
        <div className="summary-card" key={card.label}>
          <span>{card.label}</span>
          <strong>
            <AnimatedNumber value={card.value} />
          </strong>
        </div>
      ))}
      <div className="summary-card">
        <span>Processing Time</span>
        <strong>{formatDuration(results.processingTimeSeconds)}</strong>
      </div>
    </div>
  )
}

export function CompletedScreen({
  results,
  downloading,
  downloadStarted,
  onDownload,
  onReset,
}: {
  results: JobResults
  downloading?: boolean
  downloadStarted?: boolean
  onDownload: () => void
  onReset: () => void
}) {
  return (
    <div className="panel celebrate">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.span
          key={i}
          className="confetti"
          style={{ left: `${18 + i * 12}%`, top: 24 }}
          initial={{ opacity: 0, y: 0, scale: 0.6 }}
          animate={{ opacity: [0, 1, 0], y: [0, -28 - i * 4, -48], rotate: 40 }}
          transition={{ duration: 1.4, delay: 0.08 * i }}
        />
      ))}
      <div className="robot-slot">
        <Robot mood="done" size="md" />
      </div>
      <p className="panel-kicker">All set</p>
      <h1 className="panel-title">Processing Complete</h1>
      <p className="panel-copy">Your URL validation file is ready.</p>
      <ResultsSummary results={results} />
      <div className="btn-row">
        <Button
          size="lg"
          icon={<Download size={18} />}
          onClick={onDownload}
          disabled={downloading}
        >
          Download Processed File
        </Button>
        <Button variant="secondary" icon={<RotateCcw size={16} />} onClick={onReset}>
          Process Another File
        </Button>
      </div>
      <p id="download-status" className="download-note" role="status" aria-live="polite">
        {downloadStarted ? 'Download started ✓' : '\u00a0'}
      </p>
    </div>
  )
}
