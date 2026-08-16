import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ThemeMode } from '@/theme/colors'

export type Language = 'en' | 'bn'

export interface PreferencesState {
  themeMode: ThemeMode
  language: Language
  sidebarCollapsed: boolean
  lastRealmId: string | null
}

const initialState: PreferencesState = {
  themeMode: 'light',
  language: 'en',
  sidebarCollapsed: false,
  lastRealmId: null,
}

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.themeMode = action.payload
    },
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload
    },
    setLastRealmId(state, action: PayloadAction<string | null>) {
      state.lastRealmId = action.payload
    },
  },
})

export const { setThemeMode, setLanguage, setSidebarCollapsed, setLastRealmId } =
  preferencesSlice.actions
export default preferencesSlice.reducer
