export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  const value = bytes / 1024 ** index
  return `${value >= 10 || index === 0 ? Math.round(value) : value.toFixed(1)} ${units[index]}`
}

export function formatDuration(seconds: number): string {
  return `${seconds.toFixed(1)} seconds`
}

const EXCEL_EXTENSION = /\.(xlsx|xls)$/i
const EXCEL_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
])

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024

export function isExcelFile(file: File): boolean {
  return EXCEL_EXTENSION.test(file.name) || EXCEL_TYPES.has(file.type)
}
