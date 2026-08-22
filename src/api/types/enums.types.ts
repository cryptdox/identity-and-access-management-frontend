/**
 * Mirrors backend `src/utils/consts.ts` and the DTO-local string unions.
 * Plain `as const` objects, not TS `enum` — this project's tsconfig sets
 * `erasableSyntaxOnly`, which forbids non-erasable syntax like real enums.
 */
export const TypeAction = {
  CREATE: 'CREATE',
  READ: 'READ',
  READ_ALL: 'READ_ALL',
  UPDATE: 'UPDATE',
  UPDATE_ALL: 'UPDATE_ALL',
  DELETE: 'DELETE',
  DELETE_ALL: 'DELETE_ALL',
} as const
export type TypeAction = (typeof TypeAction)[keyof typeof TypeAction]

export const ResourceName = {
  COMMON: 'COMMON',
  REALM: 'REALM',
  USER: 'USER',
  USER_ATTRIBUTE: 'USER_ATTRIBUTE',
  CREDENTIAL: 'CREDENTIAL',
  GROUP: 'GROUP',
  GROUP_ROLE: 'GROUP_ROLE',
  USER_GROUP: 'USER_GROUP',
  USER_ROLE: 'USER_ROLE',
  ROLE: 'ROLE',
  ROLE_COMPOSITE: 'ROLE_COMPOSITE',
  CLIENT: 'CLIENT',
  CLIENT_ROLE: 'CLIENT_ROLE',
  SESSION: 'SESSION',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  RESOURCE: 'RESOURCE',
  PERMISSION: 'PERMISSION',
  EVENT: 'EVENT',
  PACKAGE: 'PACKAGE',
} as const
export type ResourceName = (typeof ResourceName)[keyof typeof ResourceName]

export const TypeResource = {
  API_ENDPOINT: 'API_ENDPOINT',
  UI_PAGE: 'UI_PAGE',
  FILE: 'FILE',
  SERVICE: 'SERVICE',
  DATASET: 'DATASET',
} as const
export type TypeResource = (typeof TypeResource)[keyof typeof TypeResource]

export const CredentialType = {
  PASSWORD: 'PASSWORD',
  OTP: 'OTP',
  WEB_AUTHN: 'WEB_AUTHN',
  RECOVERY_CODE: 'RECOVERY_CODE',
  API_KEY: 'API_KEY',
} as const
export type CredentialType = (typeof CredentialType)[keyof typeof CredentialType]

export const TypeEvent = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  PERMISSION_GRANTED: 'PERMISSION_GRANTED',
  PERMISSION_REVOKED: 'PERMISSION_REVOKED',
  RESOURCE_ACCESSED: 'RESOURCE_ACCESSED',
  TOKEN_REFRESHED: 'TOKEN_REFRESHED',
  CLIENT_CREATED: 'CLIENT_CREATED',
} as const
export type TypeEvent = (typeof TypeEvent)[keyof typeof TypeEvent]
