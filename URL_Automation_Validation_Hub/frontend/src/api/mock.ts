import type {
  JobSnapshot,
  JobStats,
  LiveUrl,
  ProcessResponse,
  UploadResponse,
} from '../types'
import { EMPTY_STATS } from '../types'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

interface MockJob {
  snapshot: JobSnapshot
  file: File
  startedAt: number
  totalUrls: number
  timer?: number
  shouldFail: boolean
}

const jobs = new Map<string, MockJob>()

/** Include "fail" or "error" in the filename to demo the error screen. */

const SAMPLE_URLS = [
  'https://example.com',
  'https://example.org/docs',
  'https://status.company.com',
  'https://invalid-site.com',
  'https://api.partners.io/v2',
  'https://cdn.assets.net/app',
  'https://broken-link.internal',
  'https://portal.finance.com',
  'https://help.example.net',
  'https://offline.legacy.local',
  'https://www.example.com/login',
  'https://reports.analytics.io',
]

const STATUS_BY_PROGRESS: Array<{ until: number; message: string }> = [
  { until: 8, message: 'Reading Excel file...' },
  { until: 18, message: 'Extracting URLs...' },
  { until: 32, message: 'Fetching URL data...' },
  { until: 68, message: 'Checking URL status...' },
  { until: 82, message: 'Validating responses...' },
  { until: 93, message: 'Processing results...' },
  { until: 100, message: 'Preparing output file...' },
]

function messageFor(progress: number): string {
  return STATUS_BY_PROGRESS.find((item) => progress <= item.until)?.message ?? 'Processing your file...'
}

function hashName(name: string): number {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return hash
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `job_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export async function mockUpload(file: File): Promise<UploadResponse> {
  await delay(720)
  const job_id = makeId()
  const entropy = hashName(file.name)
  const totalUrls = 860 + (entropy % 720)
  const shouldFail = /fail|error/i.test(file.name)
  jobs.set(job_id, {
    file,
    startedAt: 0,
    totalUrls,
    shouldFail,
    snapshot: {
      job_id,
      status: 'queued',
      progress: 0,
      message: 'File ready',
      stats: { ...EMPTY_STATS },
      recentUrls: [],
    },
  })
  return { job_id, filename: file.name, size: file.size }
}

export async function mockProcess(jobId: string): Promise<ProcessResponse> {
  await delay(280)
  const job = jobs.get(jobId)
  if (!job) throw new Error('Job not found')
  job.startedAt = performance.now()
  job.snapshot.status = 'running'
  job.snapshot.message = 'Processing your file...'
  startTicker(job)
  return { job_id: jobId }
}

function startTicker(job: MockJob): void {
  window.clearInterval(job.timer)
  job.timer = window.setInterval(() => {
    const elapsed = (performance.now() - job.startedAt) / 1000
    const duration = 12
    let progress = Math.min(100, Math.round((elapsed / duration) * 100))

    if (job.shouldFail && progress >= 38) {
      window.clearInterval(job.timer)
      job.snapshot = {
        ...job.snapshot,
        status: 'failed',
        progress,
        message: 'Something went wrong',
        error: "We couldn't complete the URL validation. Please try again.",
      }
      return
    }

    const found = progress < 12 ? Math.round(job.totalUrls * (progress / 12)) : job.totalUrls
    const checked = progress < 18 ? 0 : Math.round(found * Math.min(1, (progress - 18) / 70))
    const working = Math.round(checked * 0.887)
    const notWorking = checked - working
    const remaining = Math.max(0, found - checked)
    const recentUrls = nextUrls(job.snapshot.recentUrls, progress, elapsed)

    const snapshot: JobSnapshot = {
      ...job.snapshot,
      progress,
      message: messageFor(progress),
      stats: { urlsFound: found, checked, working, notWorking, remaining },
      recentUrls,
    }

    if (progress >= 100) {
      window.clearInterval(job.timer)
      const processingTimeSeconds = Number(elapsed.toFixed(1))
      snapshot.status = 'completed'
      snapshot.message = 'Processing complete'
      snapshot.results = {
        totalUrls: found,
        workingUrls: working,
        notWorking,
        processingTimeSeconds,
        downloadFilename: toValidatedName(job.file.name),
      }
    }

    job.snapshot = snapshot
  }, 180)
}

function nextUrls(current: LiveUrl[], progress: number, elapsed: number): LiveUrl[] {
  if (progress < 20) return current.slice(0, 4)
  const index = Math.floor(elapsed * 1.6)
  const url = SAMPLE_URLS[index % SAMPLE_URLS.length]
  const broken = /invalid|broken|offline|legacy/.test(url)
  const item: LiveUrl = {
    id: `${index}-${url}`,
    url,
    result: broken ? 'not_working' : 'working',
  }
  const withoutDup = current.filter((entry) => entry.url !== url)
  return [item, ...withoutDup].slice(0, 6)
}

export async function mockStatus(jobId: string): Promise<JobSnapshot> {
  const job = jobs.get(jobId)
  if (!job) throw new Error('Job not found')
  return structuredClone(job.snapshot)
}

export async function mockDownload(jobId: string): Promise<Blob> {
  const job = jobs.get(jobId)
  const source =
    job?.file ??
    new Blob(['URL validation demo file'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
  return source.slice(0, source.size, source.type)
}

export function mockOutputName(jobId: string): string {
  const job = jobs.get(jobId)
  return job ? toValidatedName(job.file.name) : 'validated.xlsx'
}

export function toValidatedName(filename: string): string {
  const dot = filename.lastIndexOf('.')
  if (dot === -1) return `${filename}_validated.xlsx`
  return `${filename.slice(0, dot)}_validated${filename.slice(dot)}`
}

export function mockReset(jobId?: string): void {
  if (!jobId) return
  const job = jobs.get(jobId)
  if (job?.timer) window.clearInterval(job.timer)
  jobs.delete(jobId)
}

export type { JobStats }
