import { useMemo, useState } from 'react'
import { useListPermissionsByClientQuery } from '@/api/endpoints/permission.api'
import { useRoleMutations } from '@/features/roles/hooks/useRoleMutations'
import { Button } from '@/common/components/ui/Button'
import { Badge } from '@/common/components/ui/Badge'
import { EmptyState } from '@/common/components/ui/EmptyState'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { useCan } from '@/common/hooks/usePermission'
import { ClientOwnerOnlyNotice } from '@/common/components/ui/ClientOwnerOnlyNotice'
import { ResourceName, TypeAction } from '@/api/types/enums.types'
import type { Role } from '@/features/roles/role.types'

const ACTIONS = Object.values(TypeAction)

/** Assigns EXISTING permission records to a role — creating new resource/permission
 * definitions is Phase 4's job (the Resource x Permission matrix screen). Saving here
 * replaces the role's whole permission set (that's how POST /role/:id/permissions
 * behaves server-side: delete-then-recreate), so we always submit the full selection.
 * Restricted server-side to the role's client's owning realm (role.client.isOwner
 * already folds in the Master bypass). Fetches only this role's own client's
 * permissions (not a global page capped at some limit) — a role can only ever hold
 * permissions from its own client anyway. */
export function RolePermissionPanel({ role }: { role: Role }) {
  const canManage = useCan(ResourceName.ROLE, TypeAction.UPDATE) && Boolean(role.client?.isOwner)
  const { data, isLoading } = useListPermissionsByClientQuery({ clientIdInternal: role.clientIdInternal, limit: 500 })
  const { assignPermissions, isAssigningPermissions } = useRoleMutations()

  const [selected, setSelected] = useState(() => new Set(role.permissions.map((p) => p.permissionId)))
  const [dirty, setDirty] = useState(false)

  const grouped = useMemo(() => {
    const byResource = new Map<string, { resourceName: string; resourceType: string; cells: Map<string, string> }>()
    for (const perm of data?.data?.items ?? []) {
      const key = perm.resource.resourceId
      if (!byResource.has(key)) {
        byResource.set(key, { resourceName: perm.resource.name, resourceType: perm.resource.type, cells: new Map() })
      }
      byResource.get(key)!.cells.set(perm.action, perm.permissionId)
    }
    return Array.from(byResource.values())
  }, [data])

  function toggle(permissionId: string) {
    setDirty(true)
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(permissionId)) next.delete(permissionId)
      else next.add(permissionId)
      return next
    })
  }

  async function handleSave() {
    await assignPermissions(role.roleId, Array.from(selected))
    setDirty(false)
  }

  if (isLoading) return <Skeleton className="h-64 w-full max-w-3xl" />

  if (grouped.length === 0) {
    return (
      <EmptyState
        title="No resources defined for this client yet"
        description="Add resources and permissions from the client's Resources & Permissions page before assigning them to a role."
      />
    )
  }

  return (
    <div className="max-w-3xl">
      {!role.client?.isOwner && <ClientOwnerOnlyNotice feature="assign or remove role permissions" clientName={role.client?.clientId} />}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-alt/50">
              <th className="px-4 py-2.5 font-medium text-text-secondary">Resource</th>
              <th className="px-3 py-2.5 font-medium text-text-secondary">Type</th>
              {ACTIONS.map((action) => (
                <th key={action} className="px-3 py-2.5 text-center font-medium text-text-secondary">
                  {action}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grouped.map(({ resourceName, resourceType, cells }) => (
              <tr key={resourceName} className="border-b border-border last:border-0">
                <td className="px-4 py-2 font-medium text-text">{resourceName}</td>
                <td className="px-3 py-2">
                  <Badge tone="neutral">{resourceType}</Badge>
                </td>
                {ACTIONS.map((action) => {
                  const permissionId = cells.get(action)
                  return (
                    <td key={action} className="px-3 py-2 text-center">
                      {permissionId ? (
                        <input
                          type="checkbox"
                          checked={selected.has(permissionId)}
                          onChange={() => toggle(permissionId)}
                          disabled={!canManage}
                          className="size-4 rounded border-border text-primary focus:ring-primary/30"
                        />
                      ) : (
                        <span className="text-text-secondary/40">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canManage && (
        <Button size="sm" className="mt-4" loading={isAssigningPermissions} disabled={!dirty} onClick={() => void handleSave()}>
          Save permissions
        </Button>
      )}
    </div>
  )
}
