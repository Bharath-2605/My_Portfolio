import type { JobSnapshot, ProcessResponse, UploadResponse } from '../types'
import { endpoints, USE_MOCK } from './endpoints'
import {
  mockDownload,
  mockOutputName,
  mockProcess,
  mockReset,
  mockStatus,
  mockUpload,
  toValidatedName,
} from './mock'

async function parseError(response: Response): Promise<Error> {
  try {
    const data = (await response.json()) as { error?: string; message?: string }
    return new Error(data.error || data.message || `Request failed (${response.status})`)
  } catch {
    return new Error(`Request failed (${response.status})`)
  }
}

export async function uploadFile(file: File): Promise<UploadResponse> {
  if (USE_MOCK) return mockUpload(file)

  const body = new FormData()
  body.append('file', file)
  const response = await fetch(endpoints.upload, { method: 'POST', body })
  if (!response.ok) throw await parseError(response)
  return response.json() as Promise<UploadResponse>
}

export async function startProcess(jobId: string): Promise<ProcessResponse> {
  if (USE_MOCK) return mockProcess(jobId)

  const response = await fetch(endpoints.process, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id: jobId }),
  })
  if (!response.ok) throw await parseError(response)
  return response.json() as Promise<ProcessResponse>
}

export async function fetchStatus(jobId: string): Promise<JobSnapshot> {
  if (USE_MOCK) return mockStatus(jobId)

  const response = await fetch(endpoints.status(jobId))
  if (!response.ok) throw await parseError(response)
  return response.json() as Promise<JobSnapshot>
}

export async function downloadResult(jobId: string, fallbackName: string): Promise<void> {
  const filename = USE_MOCK ? mockOutputName(jobId) : toValidatedName(fallbackName)
  const blob = USE_MOCK
    ? await mockDownload(jobId)
    : await (async () => {
        const response = await fetch(endpoints.download(jobId))
        if (!response.ok) throw await parseError(response)
        return response.blob()
      })()

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export function resetJob(jobId?: string): void {
  if (USE_MOCK) mockReset(jobId)
}

/** Documented integration aliases — swap the mock branch above when the API is live. */
export const processFile = startProcess
export const getProcessingStatus = fetchStatus
export const downloadProcessedFile = downloadResult
