import { useState } from 'react'
import { Trash2, ShieldCheck } from 'lucide-react'
import {
  useListClientRolesQuery,
  useAssignClientRoleMutation,
  useRemoveClientRoleMutation,
} from '@/api/endpoints/clientRole.api'
import { useListRolesQuery } from '@/api/endpoints/role.api'
import { Select } from '@/common/components/ui/Select'
import { Button } from '@/common/components/ui/Button'
import { EmptyState } from '@/common/components/ui/EmptyState'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { confirm } from '@/common/utils/confirm'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { useCan } from '@/common/hooks/usePermission'
import { ResourceName, TypeAction } from '@/api/types/enums.types'

export function ClientRolesTab({ clientIdInternal }: { clientIdInternal: string }) {
  const canManage = useCan(ResourceName.CLIENT_ROLE, TypeAction.CREATE)
  const { data: assignedData, isLoading } = useListClientRolesQuery({ clientIdInternal, limit: 200 })
  const { data: allRolesData } = useListRolesQuery({ limit: 500 })
  const [assignRole, { isLoading: isAssigning }] = useAssignClientRoleMutation()
  const [removeRole] = useRemoveClientRoleMutation()
  const toast = useToast()
  const [selectedRoleId, setSelectedRoleId] = useState('')

  const assigned = assignedData?.data?.items ?? []
  const assignedIds = new Set(assigned.map((cr) => cr.roleId))
  const availableRoles = (allRolesData?.data?.items ?? []).filter((r) => !assignedIds.has(r.roleId))

  async function handleAssign() {
    if (!selectedRoleId) return
    try {
      await assignRole({ clientIdInternal, roleId: selectedRoleId }).unwrap()
      toast.success('Role assigned')
      setSelectedRoleId('')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to assign role'))
    }
  }

  async function handleRemove(roleId: string, roleName: string) {
    const confirmed = await confirm({ message: `Remove role "${roleName}" from this client?`, confirmLabel: 'Remove', danger: true })
    if (!confirmed) return
    try {
      await removeRole({ clientIdInternal, roleId }).unwrap()
      toast.success('Role removed')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to remove role'))
    }
  }

  return (
    <div className="max-w-lg">
      {canManage && (
        <div className="mb-4 flex items-end gap-2">
          <div className="flex-1">
            <Select
              label="Assign a role"
              placeholder="Select a role…"
              options={availableRoles.map((r) => ({ value: r.roleId, label: r.name }))}
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
            />
          </div>
          <Button size="sm" loading={isAssigning} disabled={!selectedRoleId} onClick={() => void handleAssign()}>
            Assign
          </Button>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : assigned.length === 0 ? (
        <EmptyState title="No roles assigned" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {assigned.map((cr) => (
            <div key={cr.roleId} className="flex items-center justify-between border-b border-border px-4 py-2.5 text-sm last:border-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-text-secondary" />
                <span className="text-text">{cr.role?.name ?? cr.roleId}</span>
              </div>
              {canManage && (
                <button
                  onClick={() => void handleRemove(cr.roleId, cr.role?.name ?? cr.roleId)}
                  className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                  aria-label="Remove role"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
