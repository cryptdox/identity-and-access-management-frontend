import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useListRefreshTokensQuery, useRevokeRefreshTokenMutation } from '@/api/endpoints/refreshToken.api'
import { usePagination } from '@/common/hooks/usePagination'
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
import { ResourceName, TypeAction } from '@/api/types/enums.types'
import type { RefreshToken } from '@/features/tokens/token.types'

export default function RefreshTokensPage() {
  const { t } = useTranslation('tokens')
  const canRevoke = useCan(ResourceName.REFRESH_TOKEN, TypeAction.UPDATE)
  const { params, page, setPage, state } = usePagination()
  const [userId, setUserId] = useState('')
  const { data, isFetching } = useListRefreshTokensQuery({ ...params, userId: userId || undefined })
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
    { key: 'userId', header: 'User ID', render: (token) => <span className="font-mono text-xs">{token.userId}</span> },
    { key: 'sessionId', header: 'Session ID', render: (token) => <span className="font-mono text-xs">{token.sessionId}</span> },
    { key: 'expiresAt', header: 'Expires', render: (token) => formatDateTime(token.expiresAt) },
    {
      key: 'revoked',
      header: 'Status',
      render: (token) => <Badge tone={token.revoked ? 'neutral' : 'success'}>{token.revoked ? 'Revoked' : 'Active'}</Badge>,
    },
    ...(canRevoke
      ? [
          {
            key: 'actions',
            header: '',
            render: (token: RefreshToken) =>
              !token.revoked && (
                <Button size="sm" variant="outline" loading={isRevoking} onClick={() => void handleRevoke(token.refreshTokenId)}>
                  {t('revoke')}
                </Button>
              ),
          },
        ]
      : []),
  ]

  return (
    <div>
      <PageHeader title={t('title')} description={t('description')} />

      <div className="mb-4 max-w-xs">
        <Input placeholder={t('filterByUser')} value={userId} onChange={(e) => setUserId(e.target.value)} />
      </div>

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
