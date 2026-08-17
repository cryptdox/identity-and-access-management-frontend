const FLAG_KEY = 'iam.auth.rememberDevice'

/**
 * Lives outside redux-persist entirely — it's read synchronously by the custom
 * storage engine in app/rootReducer.ts to decide, per read/write, whether the auth
 * slice's persisted blob (refreshToken + rememberDevice) belongs in localStorage
 * (survives a full browser restart) or sessionStorage (survives a page refresh in
 * this tab only, gone once the tab closes). A plain in-memory cache backed by one
 * localStorage key so the choice itself is remembered across a reload without
 * needing to rehydrate the whole redux store first.
 */
let remembered = typeof localStorage !== 'undefined' && localStorage.getItem(FLAG_KEY) === 'true'

export function getRememberDevice(): boolean {
  return remembered
}

export function setRememberDevice(value: boolean): void {
  remembered = value
  if (value) localStorage.setItem(FLAG_KEY, 'true')
  else localStorage.removeItem(FLAG_KEY)
}
