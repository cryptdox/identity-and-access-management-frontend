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
 *
 * Persisted whenever there's a live refreshToken, regardless of rememberDevice — the
 * *durability* of that persistence (localStorage, surviving a full browser restart,
 * vs sessionStorage, surviving only a same-tab refresh) is decided separately by the
 * custom storage engine in app/rootReducer.ts, keyed off rememberDeviceFlag.ts. So an
 * unchecked "remember device" still survives a page refresh, just not a closed tab.
 *
 * Which KEYS are even eligible is declared via `whitelist: ['refreshToken',
 * 'rememberDevice']` on the persistConfig in app/rootReducer.ts — redux-persist only
 * invokes this transform for those two keys to begin with.
 */
export const authPersistTransform = createTransform<unknown, unknown, AuthState>(
  (subState, _key, state) => (state.refreshToken ? subState : undefined),
  (subState) => subState,
)
