// Client-side file checks (design FD4). They give fast feedback before an upload and mirror the
// server's rules and order (R2, R3, R4); the server stays authoritative.

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const

/** The server's default limit (MAX_UPLOAD_MB). A server configured differently answers 413 anyway. */
export const MAX_UPLOAD_MB = 10
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024

/** For the picker's `accept` attribute: extensions for the OS dialog, MIME types for drag and drop. */
export const ACCEPT_ATTRIBUTE = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png'

export type FileProblem = 'unsupported' | 'empty' | 'too_large'

/** Null when the file can be sent. Type first, then empty, then size, like the server. */
export function validateFile(file: File): FileProblem | null {
  if (!(ACCEPTED_TYPES as readonly string[]).includes(file.type)) return 'unsupported'
  if (file.size === 0) return 'empty'
  if (file.size > MAX_UPLOAD_BYTES) return 'too_large'
  return null
}

export const isPdf = (file: File) => file.type === 'application/pdf'

export function fileTypeLabel(file: File): string {
  if (file.type === 'application/pdf') return 'PDF'
  if (file.type === 'image/jpeg') return 'JPEG'
  if (file.type === 'image/png') return 'PNG'
  return file.type
}
