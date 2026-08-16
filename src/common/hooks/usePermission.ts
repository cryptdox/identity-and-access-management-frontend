import { useMemo } from 'react'
import { useAppSelector } from '@/app/hooks'
import { can, type CanOptions } from '@/common/utils/permissionString'
import type { ResourceName, TypeAction } from '@/api/types/enums.types'

/** Redux stores permissions as string[] (the natural/serializable shape); this memoizes
 * the Set conversion so it only rebuilds when the array reference actually changes
 * (login, profile refresh) rather than on every can()/useCan() call. */
function usePermissionSet(): Set<string> {
  const permissions = useAppSelector((state) => state.auth.permissions)
  return useMemo(() => new Set(permissions), [permissions])
}

/** Element-level gate — hide/disable one button inside an already-visible page. */
export function usePermission() {
  const permissionSet = usePermissionSet()
  return {
    can: (resource: ResourceName, action: TypeAction, opts?: CanOptions) =>
      can(permissionSet, resource, action, opts),
  }
}

export function useCan(resource: ResourceName, action: TypeAction, opts?: CanOptions): boolean {
  const permissionSet = usePermissionSet()
  return can(permissionSet, resource, action, opts)
}
