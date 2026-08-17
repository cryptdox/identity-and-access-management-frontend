import { useState } from 'react'
import { Trash2, FolderTree } from 'lucide-react'
import {
  useListUserGroupsQuery,
  useAddUserToGroupMutation,
  useRemoveUserFromGroupMutation,
} from '@/api/endpoints/userGroup.api'
import { useListGroupsQuery } from '@/api/endpoints/group.api'
import { useRealmId } from '@/common/hooks/useRealmId'
import { Select } from '@/common/components/ui/Select'
import { Button } from '@/common/components/ui/Button'
import { EmptyState } from '@/common/components/ui/EmptyState'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { confirm } from '@/common/utils/confirm'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { useCan } from '@/common/hooks/usePermission'
import { ResourceName, TypeAction } from '@/api/types/enums.types'

/** Mirror of GroupMembersTab.tsx from the other direction — same user-group
 * assignment, just managed from the user's own page instead of the group's. */
export function UserGroupsTab({ userId }: { userId: string }) {
  const realmId = useRealmId()
  const canManage = useCan(ResourceName.USER_GROUP, TypeAction.CREATE)
  const { data: membershipsData, isLoading } = useListUserGroupsQuery({ userId, limit: 200 })
  const { data: groupsData } = useListGroupsQuery({ realmId, limit: 500 })
  const [addToGroup, { isLoading: isAdding }] = useAddUserToGroupMutation()
  const [removeFromGroup] = useRemoveUserFromGroupMutation()
  const toast = useToast()
  const [selectedGroupId, setSelectedGroupId] = useState('')

  const memberships = membershipsData?.data?.items ?? []
  const memberOfIds = new Set(memberships.map((m) => m.groupId))
  const availableGroups = (groupsData?.data?.items ?? []).filter((g) => !memberOfIds.has(g.groupId))

  async function handleAdd() {
    if (!selectedGroupId) return
    try {
      await addToGroup({ userId, groupId: selectedGroupId }).unwrap()
      toast.success('Added to group')
      setSelectedGroupId('')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to add to group'))
    }
  }

  async function handleRemove(groupId: string, groupName: string) {
    const confirmed = await confirm({ message: `Remove this user from "${groupName}"?`, confirmLabel: 'Remove', danger: true })
    if (!confirmed) return
    try {
      await removeFromGroup({ userId, groupId }).unwrap()
      toast.success('Removed from group')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to remove from group'))
    }
  }

  return (
    <div className="max-w-lg">
      {canManage && (
        <div className="mb-4 flex items-end gap-2">
          <div className="flex-1">
            <Select
              label="Add to a group"
              placeholder="Select a group…"
              options={availableGroups.map((g) => ({ value: g.groupId, label: g.name }))}
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
            />
          </div>
          <Button size="sm" loading={isAdding} disabled={!selectedGroupId} onClick={() => void handleAdd()}>
            Add
          </Button>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : memberships.length === 0 ? (
        <EmptyState title="Not a member of any group" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {memberships.map((m) => (
            <div key={m.groupId} className="flex items-center justify-between border-b border-border px-4 py-2.5 text-sm last:border-0">
              <div className="flex items-center gap-2">
                <FolderTree className="size-4 text-text-secondary" />
                <span className="text-text">{m.group?.name ?? m.groupId}</span>
              </div>
              {canManage && (
                <button
                  onClick={() => void handleRemove(m.groupId, m.group?.name ?? m.groupId)}
                  className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                  aria-label="Remove from group"
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
