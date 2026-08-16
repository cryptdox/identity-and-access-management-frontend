import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setThemeMode } from '@/app/preferencesSlice'
import type { ThemeMode } from '@/theme/colors'

interface ThemeContextValue {
  mode: ThemeMode
  toggle: () => void
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useAppSelector((state) => state.preferences.themeMode)
  const dispatch = useAppDispatch()

  useEffect(() => {
    document.documentElement.dataset.theme = mode
  }, [mode])

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      toggle: () => dispatch(setThemeMode(mode === 'light' ? 'dark' : 'light')),
      setMode: (next) => dispatch(setThemeMode(next)),
    }),
    [mode, dispatch],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
