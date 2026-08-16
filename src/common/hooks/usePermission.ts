import { useAppSelector } from '@/app/hooks'
import { can, type CanOptions } from '@/common/utils/permissionString'
import type { ResourceName, TypeAction } from '@/api/types/enums.types'

/** Element-level gate — hide/disable one button inside an already-visible page. */
export function usePermission() {
  const permissions = useAppSelector((state) => state.auth.permissions)
  return {
    can: (resource: ResourceName, action: TypeAction, opts?: CanOptions) =>
      can(permissions, resource, action, opts),
  }
}

export function useCan(resource: ResourceName, action: TypeAction, opts?: CanOptions): boolean {
  const permissions = useAppSelector((state) => state.auth.permissions)
  return can(permissions, resource, action, opts)
}
