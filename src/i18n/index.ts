import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import common_en from './locales/en/common.json'
import common_bn from './locales/bn/common.json'

/**
 * Language preference is owned by redux (preferences.language, persisted) rather than
 * browser detection — see i18n/I18nSync.tsx, which calls i18n.changeLanguage whenever
 * that preference changes. This keeps one single source of truth for the active
 * language instead of racing a detector plugin against the persisted store.
 */
void i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: common_en },
      bn: { common: common_bn },
    },
    lng: 'en',
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common'],
    interpolation: { escapeValue: false },
  })

export default i18n
