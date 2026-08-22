/** Mirrors backend `src/modules/user/user.dto.ts`. Note UpdateUserDto only supports
 * toggling `enabled` today (the service has a TODO acknowledging this) — username/
 * email edits and account locking aren't exposed via any endpoint yet. */
export interface User {
  userId: string
  realmId: string
  username: string
  email: string
  enabled: boolean
  emailVerified: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateUserDto {
  realmId: string
  username: string
  email: string
  password?: string
  enabled?: boolean
}

export interface UpdateUserDto {
  enabled?: boolean
}

/** Mirrors `src/modules/user-attribute/user-attribute.dto.ts`. */
export interface UserAttribute {
  userAttributeId: string
  userId: string
  name: string
  value: string
  createdAt?: string
  updatedAt?: string | null
}

export interface CreateUserAttributeDto {
  userId: string
  name: string
  value: string
}

export interface UpdateUserAttributeDto {
  name?: string
  value?: string
}

/** Mirrors `src/modules/credential/credential.dto.ts` — secretData/hash is never
 * returned by any endpoint. */
export type CredentialTypeValue = 'PASSWORD' | 'OTP' | 'WEB_AUTHN' | 'RECOVERY_CODE' | 'API_KEY'

export interface Credential {
  credentialId: string
  userId: string
  type: CredentialTypeValue
  createdAt?: string
  updatedAt?: string | null
}

export interface CreateCredentialDto {
  userId: string
  type: CredentialTypeValue
  password?: string
  secretData?: Record<string, unknown>
}

/** Mirrors `src/modules/user-session/user-session.dto.ts`. */
export interface UserSession {
  userSessionId: string
  realmId: string
  userId: string
  user?: { userId: string; name?: string; username: string; email: string }
  ipAddress?: string | null
  userAgent?: string | null
  startedAt: string
  lastAccess: string
  revoked: boolean
  createdAt?: string
  updatedAt?: string | null
}
