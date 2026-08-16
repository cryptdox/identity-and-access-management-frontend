import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { createTransform } from 'redux-persist'
import type { GroupSummary, RoleWithPermissions, UserProfileDto } from './auth.types'

export type AuthStatus = 'idle' | 'authenticated' | 'unauthenticated'

export interface AuthState {
  refreshToken: string | null
  rememberDevice: boolean
  user: UserProfileDto | null
  permissions: string[]
  roles: RoleWithPermissions[]
  groups: GroupSummary[]
  status: AuthStatus
}

const initialState: AuthState = {
  refreshToken: null,
  rememberDevice: false,
  user: null,
  permissions: [],
  roles: [],
  groups: [],
  status: 'idle',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    credentialsReceived(
      state,
      action: PayloadAction<{ refreshToken: string; rememberDevice: boolean }>,
    ) {
      state.refreshToken = action.payload.refreshToken
      state.rememberDevice = action.payload.rememberDevice
    },
    tokensRotated(state, action: PayloadAction<{ refreshToken: string }>) {
      state.refreshToken = action.payload.refreshToken
    },
    profileLoaded(
      state,
      action: PayloadAction<{
        user: UserProfileDto
        permissions: string[]
        roles: RoleWithPermissions[]
        groups: GroupSummary[]
      }>,
    ) {
      state.user = action.payload.user
      state.permissions = action.payload.permissions
      state.roles = action.payload.roles
      state.groups = action.payload.groups
      state.status = 'authenticated'
    },
    sessionExpired(state) {
      state.refreshToken = null
      state.user = null
      state.permissions = []
      state.roles = []
      state.groups = []
      state.status = 'unauthenticated'
    },
    loggedOut(state) {
      state.refreshToken = null
      state.rememberDevice = false
      state.user = null
      state.permissions = []
      state.roles = []
      state.groups = []
      state.status = 'unauthenticated'
    },
  },
})

export const authActions = authSlice.actions
export default authSlice.reducer

/**
 * Persist only the opaque refresh token + the remember-device flag — never the
 * access token (it's never even in redux, see api/tokenManager.ts), never the
 * user/permissions/roles/groups (always refetched fresh from /auth/me on boot).
 * When rememberDevice is false, nothing is written at all: a reload forces re-login.
 *
 * redux-persist calls the inbound/outbound functions once PER TOP-LEVEL KEY of the
 * slice's state (not once with the whole state object) — `key` is that field's name
 * and the 3rd argument is the whole slice state, which is what we actually need here
 * to decide, key by key, whether to keep or blank a field.
 */
const PERSISTED_KEYS = new Set(['refreshToken', 'rememberDevice'])

export const authPersistTransform = createTransform<unknown, unknown, AuthState>(
  (subState, key, state) => {
    const shouldPersist = Boolean(state.rememberDevice && state.refreshToken)
    if (!shouldPersist || !PERSISTED_KEYS.has(key as string)) return undefined
    return subState
  },
  (subState) => subState,
)
