import { useMemo, useState } from 'react'
import { useListPermissionsQuery } from '@/api/endpoints/permission.api'
import { useRoleMutations } from '@/features/roles/hooks/useRoleMutations'
import { Button } from '@/common/components/ui/Button'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { useCan } from '@/common/hooks/usePermission'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { ResourceName, TypeAction } from '@/api/types/enums.types'
import type { Role } from '@/features/roles/role.types'

const ACTIONS = Object.values(TypeAction)

/** Assigns EXISTING permission records to a role — creating new resource/permission
 * definitions is Phase 4's job (the Resource x Permission matrix screen). Saving here
 * replaces the role's whole permission set (that's how POST /role/:id/permissions
 * behaves server-side: delete-then-recreate), so we always submit the full selection.
 * Roles are global/shared across tenants, so this mutation is Master-only server-side. */
export function RolePermissionPanel({ role }: { role: Role }) {
  const { isMasterRealmUser } = useCurrentUser()
  const canManage = useCan(ResourceName.ROLE, TypeAction.UPDATE) && isMasterRealmUser
  const { data, isLoading } = useListPermissionsQuery({ limit: 500 })
  const { assignPermissions, isAssigningPermissions } = useRoleMutations()

  const [selected, setSelected] = useState(() => new Set(role.permissions.map((p) => p.permissionId)))
  const [dirty, setDirty] = useState(false)

  const grouped = useMemo(() => {
    const byResource = new Map<string, { resourceName: string; cells: Map<string, string> }>()
    for (const perm of data?.data?.items ?? []) {
      const key = `${perm.resource.name}:${perm.resource.clientId ?? ''}`
      if (!byResource.has(key)) byResource.set(key, { resourceName: perm.resource.name, cells: new Map() })
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

  return (
    <div className="max-w-3xl">
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-alt/50">
              <th className="px-4 py-2.5 font-medium text-text-secondary">Resource</th>
              {ACTIONS.map((action) => (
                <th key={action} className="px-3 py-2.5 text-center font-medium text-text-secondary">
                  {action}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grouped.map(({ resourceName, cells }) => (
              <tr key={resourceName} className="border-b border-border last:border-0">
                <td className="px-4 py-2 font-medium text-text">{resourceName}</td>
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
