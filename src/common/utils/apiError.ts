import { mapBackendErrorMessage } from './errorMessageMap'

/** RTK Query's `.unwrap()` rejects with the raw ApiError object from axiosBaseQuery
 * (`{ success: false, status, message }`), never a real `Error` instance — so
 * `err instanceof Error` is always false for a failed mutation/query. Callers should
 * use this instead of assuming either shape. Known backend error strings are mapped
 * to friendlier copy via errorMessageMap; anything else passes through as-is. */
export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return mapBackendErrorMessage(err.message)
  }
  return fallback
}
