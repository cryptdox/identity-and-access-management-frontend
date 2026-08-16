import { TypeResource, type ResourceName, type TypeAction } from '@/api/types/enums.types'
import type { RoleWithPermissions } from '@/features/auth/auth.types'

/** The client this admin console authenticates as — see .env's VITE_IAM_CLIENT_ID. */
const DEFAULT_CLIENT_ID = (import.meta.env.VITE_IAM_CLIENT_ID as string | undefined) ?? ''

/**
 * GET /auth/me has no flat permission-string array — only roles[].permissions[],
 * each carrying its own resource (with the owning client's business id). This
 * reconstructs the same `CLIENTID:RESOURCE:ACTION:RESOURCETYPE` strings the backend
 * caches server-side, deduplicated, so `can()` below can do a simple Set lookup.
 */
export function derivePermissionStrings(roles: RoleWithPermissions[]): string[] {
  const strings = new Set<string>()
  for (const role of roles) {
    for (const grant of role.permissions) {
      strings.add(
        `${grant.resource.clientId.toUpperCase()}:${grant.resource.name}:${grant.action}:${grant.resource.type}`,
      )
    }
  }
  return Array.from(strings)
}

export interface CanOptions {
  clientId?: string
  resourceType?: TypeResource
}

/**
 * Mirrors the exact string format built server-side in AuthService.setProfilePermission:
 * `${clientId.toUpperCase()}:${resourceName}:${action}:${resourceType}`.
 */
export function can(
  permissions: string[],
  resource: ResourceName,
  action: TypeAction,
  opts: CanOptions = {},
): boolean {
  const clientId = (opts.clientId ?? DEFAULT_CLIENT_ID).toUpperCase()
  const resourceType = opts.resourceType ?? TypeResource.API_ENDPOINT
  const needle = `${clientId}:${resource}:${action}:${resourceType}`
  return permissions.includes(needle)
}
