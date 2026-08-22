import type { ComponentType } from 'react'
import { Navigate } from 'react-router-dom'
import { useCan } from '@/common/hooks/usePermission'
import { TypeAction, type ResourceName } from '@/api/types/enums.types'
import type { CanOptions } from '@/common/utils/permissionString'

/** Route/page-level gate — used from routes.config.tsx to guard a whole page. For
 * gating a single button/action inside an already-visible page, use useCan/usePermission
 * instead; both read the same permissions array via common/utils/permissionString.ts. */
export function withPermission<P extends object>(
  Component: ComponentType<P>,
  resource: ResourceName,
  action: TypeAction,
  opts?: CanOptions,
) {
  return function PermissionGated(props: P) {
    const allowed = useCan(resource, action, opts)
    if (!allowed) return <Navigate to="/unauthorized" replace />
    return <Component {...props} />
  }
}

/** Same as withPermission, but for list pages where backend's
 * selfOrReadAllMiddleware also accepts a plain READ grant (not just READ_ALL) — READ
 * gets the caller their own rows only (own sessions/tokens/events/group memberships/
 * roles), READ_ALL gets everyone's. Neither grant → still blocked, same as
 * withPermission; this is NOT an unconditional bypass for any particular role. */
export function withPermissionOrSelfService<P extends object>(
  Component: ComponentType<P>,
  resource: ResourceName,
) {
  return function PermissionOrSelfServiceGated(props: P) {
    // Both hooks must run unconditionally every render (Rules of Hooks) — don't
    // short-circuit with `||` directly on the calls.
    const hasReadAll = useCan(resource, TypeAction.READ_ALL)
    const hasRead = useCan(resource, TypeAction.READ)
    if (!hasReadAll && !hasRead) return <Navigate to="/unauthorized" replace />
    return <Component {...props} />
  }
}
