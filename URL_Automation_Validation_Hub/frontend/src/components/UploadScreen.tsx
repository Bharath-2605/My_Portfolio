import { FileSpreadsheet, Upload } from 'lucide-react'
import { useRef, useState, type DragEvent, type KeyboardEvent } from 'react'
import { Button } from './Button'
import { Robot } from './Robot'
import { cn } from '../lib/format'
import type { RobotMood } from '../types'

export function UploadScreen({ onFile }: { onFile: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [pointer, setPointer] = useState({ x: 0, y: 0 })
  const dragDepth = useRef(0)

  const mood: RobotMood = dragging ? 'drop' : hovering ? 'hover' : 'idle'

  const openPicker = () => inputRef.current?.click()

  const onDragEnter = (event: DragEvent) => {
    event.preventDefault()
    dragDepth.current += 1
    setDragging(true)
  }

  const onDragLeave = (event: DragEvent) => {
    event.preventDefault()
    dragDepth.current -= 1
    if (dragDepth.current <= 0) {
      dragDepth.current = 0
      setDragging(false)
    }
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    dragDepth.current = 0
    setDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) onFile(file)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openPicker()
    }
  }

  return (
    <div
      className={cn('panel dropzone', dragging && 'is-dragging')}
      onDragEnter={onDragEnter}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => {
        setHovering(false)
        setPointer({ x: 0, y: 0 })
      }}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        setPointer({
          x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
          y: ((event.clientY - rect.top) / rect.height) * 2 - 1,
        })
      }}
      onClick={openPicker}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Upload Excel file. Supported formats: xlsx and xls. You can also drop a file here."
    >
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onFile(file)
          event.target.value = ''
        }}
      />
      <div className="robot-slot">
        <Robot mood={mood} pointer={hovering || dragging ? pointer : undefined} />
      </div>
      <p className="panel-kicker">Intelligent URL assistant</p>
      <h1 className="panel-title">{dragging ? 'Drop your Excel file here' : 'Automate Your URL Checks'}</h1>
      <p className="panel-copy">
        {dragging
          ? 'Release to hand the workbook to the automation assistant.'
          : 'Upload your Excel file and let the automation validate your URLs.'}
      </p>
      <div style={{ marginTop: 28 }} onClick={(event) => event.stopPropagation()}>
        <Button size="lg" icon={<Upload size={18} />} onClick={openPicker}>
          Upload Excel File
        </Button>
      </div>
      <p className="hint">
        <FileSpreadsheet size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
        Supported formats: .xlsx, .xls
      </p>
    </div>
  )
}
