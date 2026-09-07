import { FolderOpen, RotateCcw } from 'lucide-react'
import { Button } from './Button'
import { Robot } from './Robot'

export function ErrorState({
  message,
  canRetry,
  onRetry,
  onChooseAnother,
}: {
  message: string
  canRetry: boolean
  onRetry: () => void
  onChooseAnother: () => void
}) {
  return (
    <div className="panel" role="alert">
      <div className="robot-slot">
        <Robot mood="error" size="md" />
      </div>
      <p className="panel-kicker">Interrupted</p>
      <h1 className="panel-title">Unable to Process File</h1>
      <p className="panel-copy">{message || 'Something went wrong while processing your file.'}</p>
      <div className="btn-row" style={{ marginTop: 28 }}>
        {canRetry && (
          <Button size="lg" icon={<RotateCcw size={16} />} onClick={onRetry}>
            Try Again
          </Button>
        )}
        <Button variant={canRetry ? 'secondary' : 'primary'} icon={<FolderOpen size={16} />} onClick={onChooseAnother}>
          Choose Another File
        </Button>
      </div>
    </div>
  )
}
