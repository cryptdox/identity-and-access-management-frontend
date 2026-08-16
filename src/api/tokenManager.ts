/**
 * In-memory-only holder for the short-lived (1h) JWT access token. Deliberately never
 * persisted (not in redux, not in redux-persist) — only the opaque, rotate-on-use
 * refresh token is ever written to storage, and only when the user opts into
 * "remember this device". See auth.slice.ts / axiosInstance.ts for the refresh flow.
 */
let accessToken: string | null = null

export const tokenManager = {
  get: () => accessToken,
  set: (token: string | null) => {
    accessToken = token
  },
  clear: () => {
    accessToken = null
  },
}
