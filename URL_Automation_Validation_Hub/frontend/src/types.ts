export type AppPhase =
  | 'idle'
  | 'fileSelected'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'error'

export type RobotMood =
  | 'idle'
  | 'hover'
  | 'drop'
  | 'ready'
  | 'uploading'
  | 'working'
  | 'done'
  | 'error'

export type ErrorKind = 'invalid_format' | 'file_too_large' | 'upload_failed' | 'processing_failed'

export type UrlResult = 'working' | 'not_working' | 'pending'

export interface LiveUrl {
  id: string
  url: string
  result: UrlResult
}

export interface JobStats {
  urlsFound: number
  checked: number
  working: number
  notWorking: number
  remaining: number
}

export interface JobResults {
  totalUrls: number
  workingUrls: number
  notWorking: number
  processingTimeSeconds: number
  downloadFilename: string
}

export type JobStatus = 'queued' | 'running' | 'completed' | 'failed'

export interface JobSnapshot {
  job_id: string
  status: JobStatus
  progress: number
  message: string
  stats: JobStats
  recentUrls: LiveUrl[]
  results?: JobResults
  error?: string
}

export interface UploadResponse {
  job_id: string
  filename: string
  size: number
}

export interface ProcessResponse {
  job_id: string
}

export interface SelectedFile {
  file: File
  name: string
  size: number
}

export const EMPTY_STATS: JobStats = {
  urlsFound: 0,
  checked: 0,
  working: 0,
  notWorking: 0,
  remaining: 0,
}
