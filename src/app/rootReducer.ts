import { combineReducers } from '@reduxjs/toolkit'
import { persistReducer, type Storage } from 'redux-persist'
import * as webStorage from 'redux-persist/lib/storage'
import * as webSessionStorage from 'redux-persist/lib/storage/session'
import authReducer, { authPersistTransform } from '@/features/auth/authSlice'
import { getRememberDevice } from '@/features/auth/rememberDeviceFlag'
import preferencesReducer from '@/app/preferencesSlice'
import { baseApi } from '@/api/baseApi'

/**
 * Vite's dev-time CJS interop double-wraps this particular package (its default
 * export resolves to `{ default: <realStorageEngine> }`, sometimes nested twice,
 * instead of the engine itself), so a plain `import storage from
 * 'redux-persist/lib/storage'` silently yields an object with no getItem/setItem.
 * This was confirmed empirically in this project (Vite 8.2.1) — the plain default
 * import throws `storage.getItem is not a function` at runtime; don't "simplify" this
 * back to a bare default import without re-testing against a live browser session.
 * Unwrap `.default` until we reach the actual storage engine rather than trusting
 * the bundler's interop shape.
 */
function unwrapDefault<T>(mod: unknown): T {
  let current = mod as { default?: unknown; getItem?: unknown }
  while (current && typeof current.getItem !== 'function' && current.default) {
    current = current.default as { default?: unknown; getItem?: unknown }
  }
  return current as T
}

const storage = unwrapDefault<Storage>(webStorage)
const sessionStorageEngine = unwrapDefault<Storage>(webSessionStorage)

/**
 * Auth-only: routes each read/write to localStorage (survives a full browser
 * restart) or sessionStorage (survives a same-tab refresh, gone once the tab closes)
 * based on rememberDeviceFlag.ts — set synchronously at login, outside redux-persist,
 * since the storage engine needs the answer before it can even write. Whichever tier
 * WASN'T used for a given write gets cleared, so a later "remember" choice can't leave
 * a stale copy sitting in the other tier for the current tab's lifetime.
 */
const authDualStorage: Storage = {
  getItem: (key) => (getRememberDevice() ? storage.getItem(key) : sessionStorageEngine.getItem(key)),
  setItem: async (key, value) => {
    if (getRememberDevice()) {
      await sessionStorageEngine.removeItem(key)
      return storage.setItem(key, value)
    }
    await storage.removeItem(key)
    return sessionStorageEngine.setItem(key, value)
  },
  removeItem: async (key) => {
    await Promise.all([storage.removeItem(key), sessionStorageEngine.removeItem(key)])
  },
}

const authPersistConfig = {
  key: 'auth',
  storage: authDualStorage,
  // Declares WHICH keys are even eligible for persistence; authPersistTransform adds
  // the one thing whitelist can't express — the "only when refreshToken exists" condition.
  whitelist: ['refreshToken', 'rememberDevice'],
  transforms: [authPersistTransform],
}

const preferencesPersistConfig = {
  key: 'preferences',
  storage,
}

/**
 * Note there is no top-level persistReducer here, and the `api` (RTK Query cache)
 * reducer is never wrapped in one — only `auth` and `preferences` opt in individually,
 * so cached list/detail data always refetches fresh on load.
 */
export const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  preferences: persistReducer(preferencesPersistConfig, preferencesReducer),
  [baseApi.reducerPath]: baseApi.reducer,
})
