import type { ResourceName, TypeAction, TypeResource } from '@/api/types/enums.types'

/** Mirrors backend `src/modules/auth/auth.dto.ts`. */
export interface LoginDto {
  realmName: string
  clientId: string
  clientSecret?: string
  email: string
  password: string
}

export interface RegisterDto {
  realmName: string
  clientId: string
  email: string
  password: string
  name?: string
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
