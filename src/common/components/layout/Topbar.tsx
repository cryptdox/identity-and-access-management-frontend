import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Sun, Moon, ChevronDown, LogOut, User as UserIcon, Languages } from 'lucide-react'
import { useTheme } from '@/theme/ThemeProvider'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setLanguage, type Language } from '@/app/preferencesSlice'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { useLogout } from '@/features/auth/hooks/useLogout'

function useClickOutside(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onOutside])
  return ref
}

export function Topbar() {
  const { mode, toggle } = useTheme()
  const { i18n } = useTranslation()
  const dispatch = useAppDispatch()
  const language = useAppSelector((state) => state.preferences.language)
  const { user } = useCurrentUser()
  const { logout } = useLogout()

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useClickOutside(() => setMenuOpen(false))

  function changeLanguage(next: Language) {
    dispatch(setLanguage(next))
    void i18n.changeLanguage(next)
  }

  return (
    <header className="flex h-16 items-center justify-end gap-2 border-b border-border bg-surface px-6">
      <button
        type="button"
        onClick={() => changeLanguage(language === 'en' ? 'bn' : 'en')}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-alt"
        aria-label="Toggle language"
      >
        <Languages className="size-4" />
        {language.toUpperCase()}
      </button>

      <button
        type="button"
        onClick={toggle}
        className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-alt"
        aria-label="Toggle theme"
      >
        {mode === 'light' ? <Moon className="size-4.5" /> : <Sun className="size-4.5" />}
      </button>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-alt"
        >
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserIcon className="size-4" />
          </div>
          <span className="max-w-32 truncate text-sm font-medium text-text">
            {user?.name ?? user?.email ?? 'Account'}
          </span>
          <ChevronDown className="size-3.5 text-text-secondary" />
        </button>

        {menuOpen && (
          <div className="animate-fade-in absolute right-0 top-12 w-48 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-lg">
            <button
              type="button"
              onClick={() => void logout()}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger transition-colors hover:bg-surface-alt"
            >
              <LogOut className="size-4" />
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
