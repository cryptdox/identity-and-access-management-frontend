import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy } from 'lucide-react'
import { useListRefreshTokensQuery, useRevokeRefreshTokenMutation } from '@/api/endpoints/refreshToken.api'
import { usePagination } from '@/common/hooks/usePagination'
import { useRealmId } from '@/common/hooks/useRealmId'
import { useDebounce } from '@/common/hooks/useDebounce'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { DataTable, type DataTableColumn } from '@/common/components/ui/DataTable'
import { Badge } from '@/common/components/ui/Badge'
import { Button } from '@/common/components/ui/Button'
import { Input } from '@/common/components/ui/Input'
import { confirm } from '@/common/utils/confirm'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { formatDateTime } from '@/common/utils/formatDate'
import { useCan } from '@/common/hooks/usePermission'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { ResourceName, TypeAction } from '@/api/types/enums.types'
import { UserIdentity } from '@/common/components/ui/UserIdentity'
import { ClientIdentity } from '@/common/components/ui/ClientIdentity'
import type { RefreshToken } from '@/features/tokens/token.types'

export default function RefreshTokensPage() {
  const { t } = useTranslation('tokens')
  const realmId = useRealmId()
  const { user } = useCurrentUser()
  // Plain UPDATE only revokes the caller's OWN token (backend enforces this too —
  // it's not just a UI nicety) — UPDATE_ALL is required to revoke anyone else's.
  const canUpdate = useCan(ResourceName.REFRESH_TOKEN, TypeAction.UPDATE)
  const canUpdateAll = useCan(ResourceName.REFRESH_TOKEN, TypeAction.UPDATE_ALL)
  // Without REFRESH_TOKEN:READ_ALL, the backend force-scopes this list to the
  // caller's own tokens regardless of the search filter below — hide that filter
  // in that case since it'd be a dead control, not a real admin search.
  const canReadAll = useCan(ResourceName.REFRESH_TOKEN, TypeAction.READ_ALL)
  // Newest-first by default, matching Sessions/Events/Users — this page previously
  // called usePagination() bare, which defaults to ascending (oldest first).
  const { params, page, setPage, state } = usePagination({ sortBy: 'createdAt', sortOrder: 'desc' })
  const [userSearch, setUserSearch] = useState('')
  const debouncedUserSearch = useDebounce(userSearch, 300)
  const listArgs = { ...params, realmId, userSearch: debouncedUserSearch || undefined }
  const { data, isFetching } = useListRefreshTokensQuery(listArgs)
  const [revokeToken] = useRevokeRefreshTokenMutation()
  // Tracks which row is being revoked so only THAT row's button shows a spinner —
  // isLoading from the mutation hook is shared across every row, not per-row.
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const toast = useToast()

  // The token's own secret value is never recoverable (only its bcrypt hash is
  // stored) — this copies the row's id, the same identity pattern used everywhere
  // else in the app (session id, client id, etc.).
  function copyTokenId(refreshTokenId: string) {
    void navigator.clipboard.writeText(refreshTokenId)
    toast.success('Token ID copied')
  }

  async function handleRevoke(refreshTokenId: string) {
    const confirmed = await confirm({ message: t('revokeConfirm'), confirmLabel: t('revoke'), danger: true })
    if (!confirmed) return
    setRevokingId(refreshTokenId)
    try {
      // Passing listArgs patches this one row's `revoked` straight in the cache on
      // success instead of invalidating and refetching the whole list.
      await revokeToken({ refreshTokenId, listArgs }).unwrap()
      toast.success('Refresh token revoked')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to revoke token'))
    } finally {
      setRevokingId(null)
    }
  }

  const columns: DataTableColumn<RefreshToken>[] = [
    {
      key: 'refreshTokenId',
      header: 'Token ID',
      render: (token) => (
        <span className="inline-flex items-center gap-1.5">
          <code className="max-w-32 truncate font-mono text-xs text-text">{token.refreshTokenId}</code>
          <button
            type="button"
            onClick={() => copyTokenId(token.refreshTokenId)}
            className="shrink-0 rounded-md p-1 text-text-secondary transition-colors hover:bg-surface-alt hover:text-text"
            aria-label="Copy token ID"
            title="Copy token ID"
          >
            <Copy className="size-3.5" />
          </button>
        </span>
      ),
    },
    { key: 'userId', header: 'User', render: (token) => <UserIdentity user={token.user} fallbackId={token.userId} /> },
    { key: 'sessionId', header: 'Session ID', render: (token) => <span className="font-mono text-xs">{token.sessionId}</span> },
    { key: 'clientIdInternal', header: 'Client', render: (token) => <ClientIdentity client={token.client} fallbackId={token.clientIdInternal} /> },
    { key: 'expiresAt', header: 'Expires', render: (token) => formatDateTime(token.expiresAt) },
    {
      key: 'revoked',
      header: 'Status',
      // "Expired" is derived purely client-side from expiresAt vs. now — the backend
      // only ever tracks `revoked`, it never flips a row to expired on its own.
      render: (token) => {
        const isExpired = new Date(token.expiresAt) < new Date()
        const status = token.revoked ? 'Revoked' : isExpired ? 'Expired' : 'Active'
        const tone = token.revoked ? 'neutral' : isExpired ? 'warning' : 'success'
        return <Badge tone={tone}>{status}</Badge>
      },
    },
    ...(canUpdate || canUpdateAll
      ? [
          {
            key: 'actions',
            header: '',
            render: (token: RefreshToken) => {
              const canRevokeThis = canUpdateAll || (canUpdate && token.userId === user?.userId)
              return !token.revoked && canRevokeThis && (
                <Button
                  size="sm"
                  variant="outline"
                  loading={revokingId === token.refreshTokenId}
                  onClick={() => void handleRevoke(token.refreshTokenId)}
                >
                  {t('revoke')}
                </Button>
              )
            },
          },
        ]
      : []),
  ]

  return (
    <div>
      <PageHeader title={canReadAll ? t('title') : 'My refresh tokens'} description={canReadAll ? t('description') : 'Refresh tokens issued to your own account.'} />

      {canReadAll && (
        <div className="mb-4 max-w-xs">
          <Input placeholder={t('filterByUser')} value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
        </div>
      )}

      <DataTable<RefreshToken>
        columns={columns}
        rows={data?.data?.items ?? []}
        rowKey={(token) => token.refreshTokenId}
        loading={isFetching}
        page={page}
        limit={state.limit}
        total={data?.data?.total ?? 0}
        onPageChange={setPage}
        emptyMessage={t('empty')}
      />
    </div>
  )
}
