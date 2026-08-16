import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import common_en from './locales/en/common.json'
import common_bn from './locales/bn/common.json'
import auth_en from './locales/en/auth.json'
import auth_bn from './locales/bn/auth.json'
import realms_en from './locales/en/realms.json'
import realms_bn from './locales/bn/realms.json'
import users_en from './locales/en/users.json'
import users_bn from './locales/bn/users.json'
import groups_en from './locales/en/groups.json'
import groups_bn from './locales/bn/groups.json'
import roles_en from './locales/en/roles.json'
import roles_bn from './locales/bn/roles.json'
import clients_en from './locales/en/clients.json'
import clients_bn from './locales/bn/clients.json'
import resources_en from './locales/en/resources.json'
import resources_bn from './locales/bn/resources.json'
import sessions_en from './locales/en/sessions.json'
import sessions_bn from './locales/bn/sessions.json'
import tokens_en from './locales/en/tokens.json'
import tokens_bn from './locales/bn/tokens.json'
import events_en from './locales/en/events.json'
import events_bn from './locales/bn/events.json'

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
      en: {
        common: common_en,
        auth: auth_en,
        realms: realms_en,
        users: users_en,
        groups: groups_en,
        roles: roles_en,
        clients: clients_en,
        resources: resources_en,
        sessions: sessions_en,
        tokens: tokens_en,
        events: events_en,
      },
      bn: {
        common: common_bn,
        auth: auth_bn,
        realms: realms_bn,
        users: users_bn,
        groups: groups_bn,
        roles: roles_bn,
        clients: clients_bn,
        resources: resources_bn,
        sessions: sessions_bn,
        tokens: tokens_bn,
        events: events_bn,
      },
    },
    lng: 'en',
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: [
      'common',
      'auth',
      'realms',
      'users',
      'groups',
      'roles',
      'clients',
      'resources',
      'sessions',
      'tokens',
      'events',
    ],
    interpolation: { escapeValue: false },
  })

export default i18n
