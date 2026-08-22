import { useState } from 'react'
import { Trash2, User as UserIcon } from 'lucide-react'
import { useListUserRolesQuery, useAssignUserRoleMutation, useRemoveUserRoleMutation } from '@/api/endpoints/userRole.api'
import { useListUsersQuery } from '@/api/endpoints/user.api'
import { useListRealmsQuery } from '@/api/endpoints/realm.api'
import { useRealmId } from '@/common/hooks/useRealmId'
import { useDebounce } from '@/common/hooks/useDebounce'
import { SearchMultiSelect, type SearchMultiSelectOption } from '@/common/components/ui/SearchMultiSelect'
import { Button } from '@/common/components/ui/Button'
import { Select } from '@/common/components/ui/Select'
import { EmptyState } from '@/common/components/ui/EmptyState'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { confirm } from '@/common/utils/confirm'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { useCan } from '@/common/hooks/usePermission'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { ResourceName, TypeAction } from '@/api/types/enums.types'
import { UserIdentity } from '@/common/components/ui/UserIdentity'

/** The reverse view of UserRolesTab — who currently holds this role, and a way to
 * assign it to several users at once. A role's client can be shared across many
 * realms (e.g. iam-client), so a Master admin gets a realm picker (defaulting to
 * their own/Master realm) to avoid seeing every realm's assignees mixed together; a
 * tenant realm has nothing to pick — they only ever see their own realm's assignees,
 * enforced server-side regardless of this UI. User search is scoped to this realm
 * (matches every other assignment picker in the app) and always capped to 10 matches
 * at a time, since a realm's user list can be far too large for a plain <select>. */
export function RoleUsersTab({ roleId }: { roleId: string }) {
  const realmId = useRealmId()
  const { user, isMasterRealmUser } = useCurrentUser()
  const canManage = useCan(ResourceName.USER_ROLE, TypeAction.CREATE)
  // Hooks must run unconditionally every render (Rules of Hooks) — combine after.
  const hasReadAllRealms = useCan(ResourceName.REALM, TypeAction.READ_ALL)
  const canListRealms = isMasterRealmUser && hasReadAllRealms
  const toast = useToast()

  const [selectedRealmId, setSelectedRealmId] = useState(user?.realmId ?? '')
  const { data: realmsData } = useListRealmsQuery(undefined, { skip: !canListRealms })
  const realms = realmsData?.data?.items ?? []
  // Master picks any realm (defaulting to their own/Master realm); a tenant realm has
  // no picker at all — always their own current realm, matching the backend's forced
  // scoping for non-master callers regardless of what's sent.
  const effectiveRealmId = canListRealms ? selectedRealmId : realmId

  const { data: assignedData, isLoading } = useListUserRolesQuery({ roleId, realmId: effectiveRealmId || undefined, limit: 200 })
  const assigned = assignedData?.data?.items ?? []
  const assignedIds = new Set(assigned.map((ur) => ur.userId))

  const [userQuery, setUserQuery] = useState('')
  const debouncedUserQuery = useDebounce(userQuery, 300)
  const { data: userOptionsData, isFetching: isSearchingUsers } = useListUsersQuery({
    realmId: effectiveRealmId,
    search: debouncedUserQuery || undefined,
    limit: 10,
  })
  const userOptions: SearchMultiSelectOption[] = (userOptionsData?.data?.items ?? [])
    .filter((u) => !assignedIds.has(u.userId))
    .map((u) => ({ value: u.userId, label: `${u.username} (${u.email})` }))

  const [selectedUsers, setSelectedUsers] = useState<SearchMultiSelectOption[]>([])
  const [isAssigning, setIsAssigning] = useState(false)

  function toggleUser(option: SearchMultiSelectOption) {
    setSelectedUsers((prev) =>
      prev.some((u) => u.value === option.value) ? prev.filter((u) => u.value !== option.value) : [...prev, option],
    )
  }

  const [assignUserRole] = useAssignUserRoleMutation()
  const [removeUserRole] = useRemoveUserRoleMutation()

  async function handleAssign() {
    if (selectedUsers.length === 0) return
    setIsAssigning(true)
    try {
      await Promise.all(selectedUsers.map((u) => assignUserRole({ userId: u.value, roleId }).unwrap()))
      toast.success(selectedUsers.length > 1 ? 'Users assigned' : 'User assigned')
      setSelectedUsers([])
      setUserQuery('')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to assign user(s)'))
    } finally {
      setIsAssigning(false)
    }
  }

  async function handleRemove(userId: string, label: string) {
    const confirmed = await confirm({ message: `Remove ${label} from this role?`, confirmLabel: 'Remove', danger: true })
    if (!confirmed) return
    try {
      await removeUserRole({ userId, roleId }).unwrap()
      toast.success('User removed')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to remove user'))
    }
  }

  return (
    <div className="max-w-lg">
      {canListRealms && (
        <div className="mb-4 max-w-xs">
          <Select
            label="Realm"
            options={realms.map((r) => ({ value: r.realmId, label: r.name }))}
            value={selectedRealmId}
            onChange={(e) => setSelectedRealmId(e.target.value)}
          />
        </div>
      )}

      {canManage && (
        <div className="mb-4 flex flex-col gap-3">
          <SearchMultiSelect
            label="Assign to user(s)"
            placeholder="Search users in this realm…"
            query={userQuery}
            onQueryChange={setUserQuery}
            options={userOptions}
            selected={selectedUsers}
            onToggle={toggleUser}
            loading={isSearchingUsers}
          />
          <Button
            size="sm"
            className="w-fit"
            loading={isAssigning}
            disabled={selectedUsers.length === 0}
            onClick={() => void handleAssign()}
          >
            Assign {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}
          </Button>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : assigned.length === 0 ? (
        <EmptyState title="No users assigned" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {assigned.map((ur) => (
            <div key={ur.userId} className="flex items-center justify-between border-b border-border px-4 py-2.5 text-sm last:border-0">
              <div className="flex items-center gap-2 text-text">
                <UserIcon className="size-4 text-text-secondary" />
                <UserIdentity user={ur.user} fallbackId={ur.userId} />
              </div>
              {canManage && (
                <button
                  onClick={() => void handleRemove(ur.userId, ur.user?.name ?? ur.user?.username ?? ur.userId)}
                  className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                  aria-label="Remove user"
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
