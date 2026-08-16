import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useListUserSessionsQuery, useRevokeUserSessionMutation } from '@/api/endpoints/userSession.api'
import { useRealmId } from '@/common/hooks/useRealmId'
import { usePagination } from '@/common/hooks/usePagination'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { DataTable, type DataTableColumn } from '@/common/components/ui/DataTable'
import { Badge } from '@/common/components/ui/Badge'
import { Button } from '@/common/components/ui/Button'
import { Select } from '@/common/components/ui/Select'
import { confirm } from '@/common/utils/confirm'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { formatDateTime, formatRelativeTime } from '@/common/utils/formatDate'
import { useCan } from '@/common/hooks/usePermission'
import { ResourceName, TypeAction } from '@/api/types/enums.types'
import type { UserSession } from '@/features/users/user.types'

export default function SessionsPage() {
  const { t } = useTranslation('sessions')
  const realmId = useRealmId()
  const canRevoke = useCan(ResourceName.SESSION, TypeAction.UPDATE)
  const { params, page, setPage, state } = usePagination({ sortBy: 'lastAccess', sortOrder: 'desc' })
  const [revokedFilter, setRevokedFilter] = useState('')
  const { data, isFetching } = useListUserSessionsQuery({
    ...params,
    realmId,
    revoked: revokedFilter === '' ? undefined : revokedFilter === 'true',
  })
  const [revokeSession, { isLoading: isRevoking }] = useRevokeUserSessionMutation()
  const toast = useToast()

  const statusOptions = [
    { value: '', label: t('filter.all') },
    { value: 'false', label: t('filter.active') },
    { value: 'true', label: t('filter.revoked') },
  ]

  async function handleRevoke(userSessionId: string) {
    const confirmed = await confirm({ message: t('revokeConfirm'), confirmLabel: t('revoke'), danger: true })
    if (!confirmed) return
    try {
      await revokeSession({ userSessionId, realmId }).unwrap()
      toast.success('Session revoked')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to revoke session'))
    }
  }

  const columns: DataTableColumn<UserSession>[] = [
    { key: 'userId', header: 'User', render: (s) => <span className="font-mono text-xs">{s.userId}</span> },
    { key: 'ipAddress', header: 'IP address', render: (s) => s.ipAddress ?? '—' },
    {
      key: 'userAgent',
      header: 'Device',
      render: (s) => s.userAgent ?? '—',
      className: 'max-w-64 truncate overflow-hidden whitespace-nowrap',
    },
    { key: 'lastAccess', header: 'Last active', sortable: true, render: (s) => formatRelativeTime(s.lastAccess) },
    { key: 'startedAt', header: 'Started', render: (s) => formatDateTime(s.startedAt) },
    {
      key: 'revoked',
      header: 'Status',
      render: (s) => <Badge tone={s.revoked ? 'neutral' : 'success'}>{s.revoked ? t('status.revoked') : t('status.active')}</Badge>,
    },
    ...(canRevoke
      ? [
          {
            key: 'actions',
            header: '',
            render: (s: UserSession) =>
              !s.revoked && (
                <Button size="sm" variant="outline" loading={isRevoking} onClick={() => void handleRevoke(s.userSessionId)}>
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
        <Select options={statusOptions} value={revokedFilter} onChange={(e) => setRevokedFilter(e.target.value)} />
      </div>

      <DataTable<UserSession>
        columns={columns}
        rows={data?.data?.items ?? []}
        rowKey={(s) => s.userSessionId}
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
