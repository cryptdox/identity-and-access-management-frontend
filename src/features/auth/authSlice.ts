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
 * Which KEYS are even eligible is declared via `whitelist: ['refreshToken',
 * 'rememberDevice']` on the persistConfig in app/rootReducer.ts — redux-persist only
 * invokes this transform for those two keys to begin with. This transform only adds
 * the one thing whitelist can't express: the conditional (only persist when
 * rememberDevice && refreshToken are both truthy), using the 3rd argument
 * (the whole slice state) redux-persist passes alongside each key's own value.
 */
export const authPersistTransform = createTransform<unknown, unknown, AuthState>(
  (subState, _key, state) => {
    const shouldPersist = Boolean(state.rememberDevice && state.refreshToken)
    return shouldPersist ? subState : undefined
  },
  (subState) => subState,
)
