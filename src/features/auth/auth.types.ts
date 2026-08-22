import type { ResourceName, TypeAction, TypeResource } from '@/api/types/enums.types'

/** Mirrors backend `src/modules/auth/auth.dto.ts` — the request BODY only. The
 * client+realm pair is identified separately via the `x-cr-access-code` header
 * (see auth.api.ts, which pulls `crAccessCode` off the request type below and sends
 * it as that header instead of a body field). The portal's client is fixed
 * (iam-client), but any realm's users log in through it, so this code varies per
 * realm/tenant and must come from the user at login time — it can't be a single
 * static value. */
export interface LoginDto {
  clientSecret?: string
  email: string
  password: string
}

export interface LoginRequest extends LoginDto {
  crAccessCode: string
  captchaToken: string
}

export interface RegisterDto {
  email: string
  password: string
  name?: string
}

export interface RegisterRequest extends RegisterDto {
  crAccessCode: string
}

export interface RefreshTokenDto {
  refreshToken: string
}

export interface UserProfileDto {
  userId: string
  email: string
  name?: string
  isEmailVerified: boolean
  isMasterRealmUser?: boolean
  /** The realm this user's own account belongs to (not necessarily the realm
   * currently being viewed/managed) — needed so non-master users can be routed
   * straight to their own realm, since they can't list/browse other realms. */
  realmId?: string
  realmName?: string
}

/** Nested under roles[].permissions[] in the real GET /auth/me response — there is
 * no flat permission-string array from the backend, so the frontend derives its own
 * `CLIENTID:RESOURCE:ACTION:RESOURCETYPE` strings from this via
 * common/utils/permissionString.ts::derivePermissionStrings. */
export interface PermissionGrant {
  permissionId: string
  resourceId: string
  resource: {
    resourceId: string
    name: ResourceName
    type: TypeResource
    clientId: string
  }
  action: TypeAction
}

export interface RoleWithPermissions {
  roleId: string
  name: string
  description?: string
  permissions: PermissionGrant[]
}

export interface GroupSummary {
  groupId: string
  realmId: string
  name: string
  parentId?: string | null
}

export interface CredentialSummary {
  credentialId: string
  userId: string
  type: string
  createdAt: string
  updatedAt?: string | null
}

export interface SessionSummary {
  userSessionId: string
  ipAddress?: string | null
  userAgent?: string | null
  startedAt: string
  lastAccess: string
  revoked: boolean
  isCurrent?: boolean
}

export interface UserProfileDetailsDto extends UserProfileDto {
  username: string
  enabled: boolean
  createdAt: string
  updatedAt: string
  realm: {
    realmId: string
    name: string
    enabled: boolean
    settings?: Record<string, unknown>
  }
  roles: RoleWithPermissions[]
  groups: GroupSummary[]
  credentials: CredentialSummary[]
  sessions: SessionSummary[]
}

export interface LoginResponseDto {
  accessToken: string
  refreshToken: string
  user: UserProfileDto
}

export interface RefreshTokenResponseDto {
  accessToken: string
  refreshToken: string
}
