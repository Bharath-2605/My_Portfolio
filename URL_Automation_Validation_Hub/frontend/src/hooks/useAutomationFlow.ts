import { useCallback, useEffect, useState } from 'react'
import {
  downloadProcessedFile,
  getProcessingStatus,
  processFile,
  resetJob,
  uploadFile,
} from '../api/client'
import { isExcelFile, MAX_UPLOAD_BYTES } from '../lib/format'
import {
  EMPTY_STATS,
  type AppPhase,
  type ErrorKind,
  type JobSnapshot,
  type SelectedFile,
} from '../types'

function toUserMessage(error: unknown, fallback: string): string {
  const raw = error instanceof Error ? error.message : fallback
  if (/job not found|request failed|failed to fetch/i.test(raw)) return fallback
  return raw || fallback
}

export function useAutomationFlow() {
  const [phase, setPhase] = useState<AppPhase>('idle')
  const [selected, setSelected] = useState<SelectedFile | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [snapshot, setSnapshot] = useState<JobSnapshot | null>(null)
  const [errorKind, setErrorKind] = useState<ErrorKind>('processing_failed')
  const [errorMessage, setErrorMessage] = useState('Something went wrong while processing your file.')
  const [busy, setBusy] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadStarted, setDownloadStarted] = useState(false)

  const fail = (kind: ErrorKind, message: string) => {
    setErrorKind(kind)
    setErrorMessage(message)
    setPhase('error')
    setBusy(false)
  }

  const selectFile = (file: File) => {
    if (!isExcelFile(file)) {
      fail('invalid_format', 'Please upload an Excel workbook (.xlsx or .xls).')
      return
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      fail('file_too_large', 'That file is larger than 50 MB. Please choose a smaller workbook.')
      return
    }
    setSelected({ file, name: file.name, size: file.size })
    setErrorMessage('Something went wrong while processing your file.')
    setPhase('fileSelected')
  }

  const reset = useCallback(() => {
    resetJob(jobId ?? undefined)
    setPhase('idle')
    setSelected(null)
    setJobId(null)
    setSnapshot(null)
    setBusy(false)
    setDownloading(false)
    setDownloadStarted(false)
  }, [jobId])

  const start = useCallback(async () => {
    if (!selected) return
    setBusy(true)
    setDownloadStarted(false)
    resetJob(jobId ?? undefined)
    setJobId(null)
    setPhase('processing')
    setSnapshot({
      job_id: jobId ?? '',
      status: 'queued',
      progress: 0,
      message: 'Reading Excel file...',
      stats: { ...EMPTY_STATS },
      recentUrls: [],
    })
    try {
      const uploaded = await uploadFile(selected.file)
      setJobId(uploaded.job_id)
      await processFile(uploaded.job_id)
    } catch (error) {
      fail(
        'upload_failed',
        toUserMessage(error, 'The file could not be uploaded. Please try again.'),
      )
    } finally {
      setBusy(false)
    }
  }, [jobId, selected])

  useEffect(() => {
    if (phase !== 'processing' || !jobId) return
    let cancelled = false

    const poll = async () => {
      try {
        const next = await getProcessingStatus(jobId)
        if (cancelled) return
        setSnapshot(next)
        if (next.status === 'completed') setPhase('completed')
        if (next.status === 'failed') {
          fail('processing_failed', next.error || 'Something went wrong while processing your file.')
        }
      } catch (error) {
        if (cancelled) return
        fail('processing_failed', toUserMessage(error, 'Unable to read processing status.'))
      }
    }

    void poll()
    const timer = window.setInterval(() => void poll(), 220)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [jobId, phase])

  const download = async () => {
    if (!jobId || !selected) return
    setDownloading(true)
    try {
      await downloadProcessedFile(jobId, selected.name)
      setDownloadStarted(true)
    } catch (error) {
      fail(
        'processing_failed',
        toUserMessage(error, 'The processed file could not be downloaded. Please try again.'),
      )
    } finally {
      setDownloading(false)
    }
  }

  return {
    phase,
    selected,
    snapshot,
    errorKind,
    errorMessage,
    busy,
    downloading,
    downloadStarted,
    selectFile,
    start,
    reset,
    download,
  }
}
