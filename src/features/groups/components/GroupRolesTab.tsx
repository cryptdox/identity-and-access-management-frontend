import { useState } from 'react'
import { Trash2, ShieldCheck } from 'lucide-react'
import { useListGroupRolesQuery, useAssignGroupRoleMutation, useRemoveGroupRoleMutation } from '@/api/endpoints/groupRole.api'
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

export function GroupRolesTab({ groupId }: { groupId: string }) {
  const canManage = useCan(ResourceName.GROUP_ROLE, TypeAction.CREATE)
  const { data: assignedData, isLoading } = useListGroupRolesQuery({ groupId, limit: 200 })
  const { data: allRolesData } = useListRolesQuery({ limit: 500 })
  const [assignRole, { isLoading: isAssigning }] = useAssignGroupRoleMutation()
  const [removeRole] = useRemoveGroupRoleMutation()
  const toast = useToast()
  const [selectedRoleId, setSelectedRoleId] = useState('')

  const assigned = assignedData?.data?.items ?? []
  const assignedIds = new Set(assigned.map((gr) => gr.roleId))
  const availableRoles = (allRolesData?.data?.items ?? []).filter((r) => !assignedIds.has(r.roleId))

  async function handleAssign() {
    if (!selectedRoleId) return
    try {
      await assignRole({ groupId, roleId: selectedRoleId }).unwrap()
      toast.success('Role assigned')
      setSelectedRoleId('')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to assign role'))
    }
  }

  async function handleRemove(roleId: string, roleName: string) {
    const confirmed = await confirm({ message: `Remove role "${roleName}" from this group?`, confirmLabel: 'Remove', danger: true })
    if (!confirmed) return
    try {
      await removeRole({ groupId, roleId }).unwrap()
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
        <EmptyState title="No roles assigned" description="Members of this group inherit these roles." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {assigned.map((gr) => (
            <div key={gr.roleId} className="flex items-center justify-between border-b border-border px-4 py-2.5 text-sm last:border-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-text-secondary" />
                <span className="text-text">{gr.role?.name ?? gr.roleId}</span>
              </div>
              {canManage && (
                <button
                  onClick={() => void handleRemove(gr.roleId, gr.role?.name ?? gr.roleId)}
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
