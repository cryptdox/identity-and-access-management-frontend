import {
  useGetClientDashboardViewsQuery,
  useGetRoleDashboardViewsQuery,
  useAssignRoleDashboardViewMutation,
  useRevokeRoleDashboardViewMutation,
} from '@/api/endpoints/dashboard.api'
import { Badge } from '@/common/components/ui/Badge'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { EmptyState } from '@/common/components/ui/EmptyState'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { useCan } from '@/common/hooks/usePermission'
import { ClientOwnerOnlyNotice } from '@/common/components/ui/ClientOwnerOnlyNotice'
import { ResourceName, TypeAction } from '@/api/types/enums.types'
import type { Role } from '@/features/roles/role.types'

/** Which of this role's client's dashboard view labels its members can see on their
 * own dashboard — toggling a checkbox immediately assigns/revokes (no batch save;
 * matches the per-item assign/revoke endpoints, same immediacy as GroupRolesTab's
 * role assignment). Restricted to the role's client's owning realm, same rule as
 * RolePermissionPanel. */
export function RoleDashboardViewsTab({ role }: { role: Role }) {
  const canManage = useCan(ResourceName.ROLE, TypeAction.UPDATE) && Boolean(role.client?.isOwner)
  const toast = useToast()

  const { data: catalogData, isLoading: isLoadingCatalog } = useGetClientDashboardViewsQuery(role.clientIdInternal)
  const { data: assignedData, isLoading: isLoadingAssigned } = useGetRoleDashboardViewsQuery(role.roleId)
  const [assignView, { isLoading: isAssigning }] = useAssignRoleDashboardViewMutation()
  const [revokeView, { isLoading: isRevoking }] = useRevokeRoleDashboardViewMutation()

  const catalog = catalogData?.data ?? []
  const assignedIds = new Set((assignedData?.data ?? []).map((rv) => rv.dashboardViewId))

  async function toggle(dashboardViewId: string, checked: boolean) {
    try {
      if (checked) {
        await assignView({ roleId: role.roleId, dashboardViewId }).unwrap()
      } else {
        await revokeView({ roleId: role.roleId, dashboardViewId }).unwrap()
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update dashboard view assignment'))
    }
  }

  if (isLoadingCatalog || isLoadingAssigned) {
    return (
      <div className="max-w-lg space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (catalog.length === 0) {
    return (
      <EmptyState
        title="No dashboard views defined for this client yet"
        description="Create one from this client's Dashboard views tab first, then assign it here."
      />
    )
  }

  return (
    <div className="max-w-lg space-y-4">
      {!role.client?.isOwner && (
        <ClientOwnerOnlyNotice feature="assign dashboard views to this role" clientName={role.client?.clientId} />
      )}
      <div className="space-y-2">
        {catalog.map((view) => (
          <label
            key={view.dashboardViewId}
            className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
          >
            <span className="flex flex-col">
              <span className="text-sm text-text">{view.name}</span>
              <span className="text-xs text-text-secondary">{view.type}</span>
            </span>
            <span className="flex items-center gap-2">
              <Badge tone={view.realmScope === 'BOTH' ? 'success' : 'info'}>{view.realmScope}</Badge>
              <input
                type="checkbox"
                checked={assignedIds.has(view.dashboardViewId)}
                disabled={!canManage || isAssigning || isRevoking}
                onChange={(e) => void toggle(view.dashboardViewId, e.target.checked)}
                className="size-4 rounded border-border text-primary focus:ring-primary/30"
              />
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
