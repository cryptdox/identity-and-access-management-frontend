import type { ComponentType } from 'react'
import { Navigate } from 'react-router-dom'
import { useCan } from '@/common/hooks/usePermission'
import type { ResourceName, TypeAction } from '@/api/types/enums.types'
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
