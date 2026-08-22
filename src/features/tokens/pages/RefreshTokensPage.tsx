import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useListRefreshTokensQuery, useRevokeRefreshTokenMutation } from '@/api/endpoints/refreshToken.api'
import { usePagination } from '@/common/hooks/usePagination'
import { useRealmId } from '@/common/hooks/useRealmId'
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
  // caller's own tokens regardless of the userId filter below — hide that filter
  // in that case since it'd be a dead control, not a real admin search.
  const canReadAll = useCan(ResourceName.REFRESH_TOKEN, TypeAction.READ_ALL)
  const { params, page, setPage, state } = usePagination()
  const [userId, setUserId] = useState('')
  const { data, isFetching } = useListRefreshTokensQuery({ ...params, realmId, userId: userId || undefined })
  const [revokeToken, { isLoading: isRevoking }] = useRevokeRefreshTokenMutation()
  const toast = useToast()

  async function handleRevoke(refreshTokenId: string) {
    const confirmed = await confirm({ message: t('revokeConfirm'), confirmLabel: t('revoke'), danger: true })
    if (!confirmed) return
    try {
      await revokeToken(refreshTokenId).unwrap()
      toast.success('Refresh token revoked')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to revoke token'))
    }
  }

  const columns: DataTableColumn<RefreshToken>[] = [
    { key: 'userId', header: 'User', render: (token) => <UserIdentity user={token.user} fallbackId={token.userId} /> },
    { key: 'sessionId', header: 'Session ID', render: (token) => <span className="font-mono text-xs">{token.sessionId}</span> },
    { key: 'clientIdInternal', header: 'Client', render: (token) => <ClientIdentity client={token.client} fallbackId={token.clientIdInternal} /> },
    { key: 'expiresAt', header: 'Expires', render: (token) => formatDateTime(token.expiresAt) },
    {
      key: 'revoked',
      header: 'Status',
      render: (token) => <Badge tone={token.revoked ? 'neutral' : 'success'}>{token.revoked ? 'Revoked' : 'Active'}</Badge>,
    },
    ...(canUpdate || canUpdateAll
      ? [
          {
            key: 'actions',
            header: '',
            render: (token: RefreshToken) => {
              const canRevokeThis = canUpdateAll || (canUpdate && token.userId === user?.userId)
              return !token.revoked && canRevokeThis && (
                <Button size="sm" variant="outline" loading={isRevoking} onClick={() => void handleRevoke(token.refreshTokenId)}>
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
          <Input placeholder={t('filterByUser')} value={userId} onChange={(e) => setUserId(e.target.value)} />
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
