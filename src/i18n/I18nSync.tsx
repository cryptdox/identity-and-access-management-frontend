import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '@/app/hooks'

/** Keeps i18next's active language following redux's persisted `preferences.language` —
 * the single source of truth for language (see i18n/index.ts). */
export function I18nSync() {
  const language = useAppSelector((state) => state.preferences.language)
  const { i18n } = useTranslation()

  useEffect(() => {
    if (i18n.language !== language) void i18n.changeLanguage(language)
  }, [language, i18n])

  return null
}
