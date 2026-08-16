/**
 * Backend error messages are plain hardcoded English strings, not i18n keys or
 * stable error codes (confirmed by reading auth.service.ts, realm.middlewares.ts,
 * etc.) — so this maps the known ones to friendlier copy by substring match. Only
 * covers messages actually observed in the backend source; anything unmatched falls
 * through to the raw backend message via getApiErrorMessage's fallback.
 */
const KNOWN_ERROR_SUBSTRINGS: Array<[string, string]> = [
  ['Invalid Realm', 'That realm doesn’t exist.'],
  ['Invalid credentials', 'Incorrect email or password.'],
  ['Token expired', 'Your session has expired — please sign in again.'],
  [
    'JWT secret not configured in Redis',
    'Your session has expired — please sign in again.',
  ],
  ['Session invalid or logged out', 'You’ve been signed out — please sign in again.'],
  ['A user with this username or email already exists', 'That username or email is already taken in this realm.'],
  ['User not found', 'This user no longer exists.'],
  ['Realm not found', 'This realm no longer exists.'],
  ['Role not found', 'This role no longer exists.'],
  ['Group not found', 'This group no longer exists.'],
  ['Client not found', 'This client no longer exists.'],
  ['Permissions not loaded', 'Your permissions are still loading — try again in a moment.'],
  ['Access denied', 'You don’t have permission to do that.'],
]

export function mapBackendErrorMessage(message: string): string {
  const match = KNOWN_ERROR_SUBSTRINGS.find(([substring]) => message.includes(substring))
  return match ? match[1] : message
}
