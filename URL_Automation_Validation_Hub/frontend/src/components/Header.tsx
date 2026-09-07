import { Moon, Sun } from 'lucide-react'
import type { AppPhase } from '../types'
import type { Theme } from '../hooks/useTheme'
import { cn } from '../lib/format'

const STATUS: Record<AppPhase, { label: string; live?: boolean; error?: boolean }> = {
  idle: { label: 'Automation Ready' },
  fileSelected: { label: 'Automation Ready' },
  uploading: { label: 'Uploading', live: true },
  processing: { label: 'Processing', live: true },
  completed: { label: 'Complete' },
  error: { label: 'Needs attention', error: true },
}

export function Header({
  phase,
  theme,
  onToggleTheme,
}: {
  phase: AppPhase
  theme: Theme
  onToggleTheme: () => void
}) {
  const status = STATUS[phase]
  const darkChrome = theme === 'dark' || phase === 'processing'
  const nextMode = theme === 'dark' ? 'light' : 'dark'

  return (
    <header className="header">
      <div className="header-bar">
        <div className="brand">
          <img
            src={darkChrome ? '/logo-dark.svg' : '/logo.svg'}
            alt="Synchrony"
            className="brand-logo"
          />
        </div>
        <p className="brand-title">URL Automation Validation Hub</p>
        <div className="header-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={`Switch to ${nextMode} mode`}
            title={`Switch to ${nextMode} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div
            className={cn('status-pill', status.live && 'is-live', status.error && 'is-error')}
            role="status"
          >
            <span className="status-dot" aria-hidden="true" />
            <span>{status.label}</span>
          </div>
        </div>
      </div>
      <div className="header-stripes" aria-hidden="true">
        <span className="header-stripe header-stripe--yellow" />
        <span className="header-stripe header-stripe--blue" />
      </div>
    </header>
  )
}
