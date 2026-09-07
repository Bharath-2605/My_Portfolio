/**
 * Backend integration points.
 *
 * Replace these paths (or set VITE_API_BASE) when the Python automation API is ready.
 *
 * POST /upload              -> UploadResponse { job_id, filename, size }
 * POST /process             -> { job_id }          body: { job_id }
 * GET  /status/{job_id}     -> JobSnapshot
 * GET  /download/{job_id}   -> binary Excel file
 */
const BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')

export const endpoints = {
  upload: `${BASE}/upload`,
  process: `${BASE}/process`,
  status: (jobId: string) => `${BASE}/status/${encodeURIComponent(jobId)}`,
  download: (jobId: string) => `${BASE}/download/${encodeURIComponent(jobId)}`,
} as const

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
