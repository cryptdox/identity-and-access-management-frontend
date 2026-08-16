import { Monitor } from 'lucide-react'
import { useListUserSessionsQuery, useRevokeUserSessionMutation } from '@/api/endpoints/userSession.api'
import { Button } from '@/common/components/ui/Button'
import { Badge } from '@/common/components/ui/Badge'
import { EmptyState } from '@/common/components/ui/EmptyState'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { confirm } from '@/common/utils/confirm'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { formatDateTime, formatRelativeTime } from '@/common/utils/formatDate'
import { useCan } from '@/common/hooks/usePermission'
import { ResourceName, TypeAction } from '@/api/types/enums.types'

export function UserSessionsTab({ userId }: { userId: string }) {
  const canRevoke = useCan(ResourceName.SESSION, TypeAction.UPDATE)
  const { data, isLoading } = useListUserSessionsQuery({ userId, limit: 100, sortBy: 'lastAccess', sortOrder: 'desc' })
  const [revokeSession, { isLoading: isRevoking }] = useRevokeUserSessionMutation()
  const toast = useToast()

  async function handleRevoke(userSessionId: string) {
    const confirmed = await confirm({ message: 'Revoke this session? The user will be signed out on that device.', confirmLabel: 'Revoke', danger: true })
    if (!confirmed) return
    try {
      await revokeSession({ userSessionId, userId }).unwrap()
      toast.success('Session revoked')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to revoke session'))
    }
  }

  const sessions = data?.data?.items ?? []

  if (isLoading) return <Skeleton className="h-32 w-full max-w-2xl" />
  if (sessions.length === 0) return <EmptyState title="No active sessions" />

  return (
    <div className="max-w-2xl overflow-hidden rounded-xl border border-border">
      {sessions.map((session) => (
        <div
          key={session.userSessionId}
          className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 text-sm last:border-0"
        >
          <div className="flex min-w-0 items-center gap-3">
            <Monitor className="size-4 shrink-0 text-text-secondary" />
            <div className="min-w-0">
              <p className="truncate text-text">{session.userAgent ?? 'Unknown device'}</p>
              <p className="text-xs text-text-secondary">
                {session.ipAddress ?? 'Unknown IP'} · last active {formatRelativeTime(session.lastAccess)} · started{' '}
                {formatDateTime(session.startedAt)}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge tone={session.revoked ? 'neutral' : 'success'}>{session.revoked ? 'Revoked' : 'Active'}</Badge>
            {canRevoke && !session.revoked && (
              <Button
                size="sm"
                variant="outline"
                loading={isRevoking}
                onClick={() => void handleRevoke(session.userSessionId)}
              >
                Revoke
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
