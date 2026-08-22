import { useState } from 'react'
import { Trash2, User as UserIcon } from 'lucide-react'
import {
  useListUserGroupsQuery,
  useAddUserToGroupMutation,
  useRemoveUserFromGroupMutation,
} from '@/api/endpoints/userGroup.api'
import { useListUsersQuery } from '@/api/endpoints/user.api'
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
import { UserIdentity } from '@/common/components/ui/UserIdentity'

export function GroupMembersTab({ groupId }: { groupId: string }) {
  const realmId = useRealmId()
  const canManage = useCan(ResourceName.USER_GROUP, TypeAction.CREATE)
  const { data: membersData, isLoading } = useListUserGroupsQuery({ groupId, limit: 200 })
  const { data: usersData } = useListUsersQuery({ realmId, limit: 500 })
  const [addMember, { isLoading: isAdding }] = useAddUserToGroupMutation()
  const [removeMember] = useRemoveUserFromGroupMutation()
  const toast = useToast()
  const [selectedUserId, setSelectedUserId] = useState('')

  const members = membersData?.data?.items ?? []
  const memberIds = new Set(members.map((m) => m.userId))
  const availableUsers = (usersData?.data?.items ?? []).filter((u) => !memberIds.has(u.userId))

  async function handleAdd() {
    if (!selectedUserId) return
    try {
      await addMember({ userId: selectedUserId, groupId }).unwrap()
      toast.success('User added to group')
      setSelectedUserId('')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to add user'))
    }
  }

  async function handleRemove(userId: string, username: string) {
    const confirmed = await confirm({ message: `Remove ${username} from this group?`, confirmLabel: 'Remove', danger: true })
    if (!confirmed) return
    try {
      await removeMember({ userId, groupId }).unwrap()
      toast.success('User removed from group')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to remove user'))
    }
  }

  return (
    <div className="max-w-lg">
      {canManage && (
        <div className="mb-4 flex items-end gap-2">
          <div className="flex-1">
            <Select
              label="Add a user"
              placeholder="Select a user…"
              options={availableUsers.map((u) => ({ value: u.userId, label: `${u.username} (${u.email})` }))}
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            />
          </div>
          <Button size="sm" loading={isAdding} disabled={!selectedUserId} onClick={() => void handleAdd()}>
            Add
          </Button>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : members.length === 0 ? (
        <EmptyState title="No members" description="Add users to this group." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {members.map((m) => (
            <div key={m.userId} className="flex items-center justify-between border-b border-border px-4 py-2.5 text-sm last:border-0">
              <div className="flex items-center gap-2 text-text">
                <UserIcon className="size-4 text-text-secondary" />
                <UserIdentity user={m.user} fallbackId={m.userId} />
              </div>
              {canManage && (
                <button
                  onClick={() => void handleRemove(m.userId, m.user?.name ?? m.user?.username ?? m.userId)}
                  className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                  aria-label="Remove member"
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
