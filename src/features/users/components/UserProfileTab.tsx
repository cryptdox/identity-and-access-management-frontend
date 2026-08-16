import { useNavigate } from 'react-router-dom'
import { useUserMutations } from '@/features/users/hooks/useUserMutations'
import { useRealmId } from '@/common/hooks/useRealmId'
import { Button } from '@/common/components/ui/Button'
import { Badge } from '@/common/components/ui/Badge'
import { confirm } from '@/common/utils/confirm'
import { useCan } from '@/common/hooks/usePermission'
import { ResourceName, TypeAction } from '@/api/types/enums.types'
import type { User } from '@/features/users/user.types'

export function UserProfileTab({ user }: { user: User }) {
  const realmId = useRealmId()
  const navigate = useNavigate()
  const { updateUser, deleteUser, isUpdating, isDeleting } = useUserMutations()
  const canUpdate = useCan(ResourceName.USER, TypeAction.UPDATE)
  const canDelete = useCan(ResourceName.USER, TypeAction.DELETE)

  async function toggleEnabled() {
    await updateUser(user.userId, { enabled: !user.enabled })
  }

  async function handleDelete() {
    const confirmed = await confirm({
      title: 'Delete user',
      message: `This removes "${user.username}" from the realm. This cannot be undone.`,
      confirmLabel: 'Delete user',
      danger: true,
    })
    if (!confirmed) return
    await deleteUser(user.userId)
    navigate(`/r/${realmId}/users`, { replace: true })
  }

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <div className="grid grid-cols-[120px_1fr] gap-y-3 text-sm">
        <span className="text-text-secondary">Username</span>
        <span className="text-text">{user.username}</span>
        <span className="text-text-secondary">Email</span>
        <span className="text-text">{user.email}</span>
        <span className="text-text-secondary">Email verified</span>
        <span>
          <Badge tone={user.emailVerified ? 'info' : 'warning'}>{user.emailVerified ? 'Verified' : 'Unverified'}</Badge>
        </span>
        <span className="text-text-secondary">Status</span>
        <span>
          <Badge tone={user.enabled ? 'success' : 'neutral'}>{user.enabled ? 'Enabled' : 'Disabled'}</Badge>
        </span>
      </div>
      <p className="text-xs text-text-secondary">
        Username and email can't be changed from here yet — only the enabled status.
      </p>

      {canUpdate && (
        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          loading={isUpdating}
          onClick={() => void toggleEnabled()}
        >
          {user.enabled ? 'Disable user' : 'Enable user'}
        </Button>
      )}

      {canDelete && (
        <div className="rounded-xl border border-danger/30 bg-danger/5 p-4">
          <p className="text-sm font-medium text-danger">Danger zone</p>
          <p className="mt-1 text-sm text-text-secondary">Permanently remove this user from the realm.</p>
          <Button variant="danger" size="sm" className="mt-3" loading={isDeleting} onClick={() => void handleDelete()}>
            Delete user
          </Button>
        </div>
      )}
    </div>
  )
}
