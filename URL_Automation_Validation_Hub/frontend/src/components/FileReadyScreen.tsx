import { FileSpreadsheet, Play } from 'lucide-react'
import { Button } from './Button'
import { Robot } from './Robot'
import { formatBytes } from '../lib/format'
import type { SelectedFile } from '../types'

export function FileReadyScreen({
  file,
  busy,
  onChangeFile,
  onProcess,
}: {
  file: SelectedFile
  busy?: boolean
  onChangeFile: () => void
  onProcess: () => void
}) {
  return (
    <div className="panel">
      <div className="robot-slot">
        <Robot mood="ready" size="md" />
      </div>
      <p className="panel-kicker">Workbook received</p>
      <h1 className="panel-title">File Ready</h1>
      <p className="panel-copy">The workbook is queued. Start validation when you are ready.</p>

      <div className="file-card">
        <div className="file-icon" aria-hidden="true">
          <FileSpreadsheet size={24} />
        </div>
        <div className="file-meta">
          <p className="file-name">{file.name}</p>
          <p className="file-sub">{formatBytes(file.size)}</p>
        </div>
        <span className="file-badge">Ready to process</span>
      </div>

      <div className="btn-row">
        <Button variant="ghost" onClick={onChangeFile} disabled={busy}>
          Change File
        </Button>
        <Button size="lg" icon={<Play size={18} />} onClick={onProcess} disabled={busy}>
          Process File
        </Button>
      </div>
    </div>
  )
}
