import moment from 'moment'

/** Single swap point for date formatting across list/detail pages — table columns
 * (createdAt, updatedAt, expiresAt, etc.) should go through this rather than each
 * inventing its own native Date/toLocaleDateString call. */
export function formatDate(value: string | Date | null | undefined, format = 'MMM D, YYYY'): string {
  if (!value) return '—'
  return moment(value).format(format)
}

export function formatDateTime(value: string | Date | null | undefined): string {
  return formatDate(value, 'MMM D, YYYY h:mm A')
}

export function formatRelativeTime(value: string | Date | null | undefined): string {
  if (!value) return '—'
  return moment(value).fromNow()
}
