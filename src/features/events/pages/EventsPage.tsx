import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useListEventsQuery } from '@/api/endpoints/event.api'
import { useRealmId } from '@/common/hooks/useRealmId'
import { usePagination } from '@/common/hooks/usePagination'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { DataTable, type DataTableColumn } from '@/common/components/ui/DataTable'
import { Badge } from '@/common/components/ui/Badge'
import { EventFilterBar } from '@/features/events/components/EventFilterBar'
import { formatDateTime } from '@/common/utils/formatDate'
import type { TypeEvent } from '@/api/types/enums.types'
import type { Event } from '@/features/events/event.types'

const EVENT_TONE: Record<string, 'success' | 'danger' | 'info' | 'warning' | 'neutral'> = {
  LOGIN: 'success',
  LOGOUT: 'neutral',
  USER_CREATED: 'info',
  USER_UPDATED: 'info',
  PASSWORD_CHANGED: 'warning',
  PERMISSION_GRANTED: 'success',
  PERMISSION_REVOKED: 'danger',
  RESOURCE_ACCESSED: 'neutral',
  TOKEN_REFRESHED: 'neutral',
  CLIENT_CREATED: 'info',
}

export default function EventsPage() {
  const { t } = useTranslation('events')
  const realmId = useRealmId()
  const { page, setPage, state } = usePagination({ sortBy: 'createdAt', sortOrder: 'desc' })
  const [type, setType] = useState('')
  const [userId, setUserId] = useState('')

  const { data, isFetching } = useListEventsQuery({
    realmId,
    type: (type || undefined) as TypeEvent | undefined,
    userId: userId || undefined,
    offset: page * state.limit,
    limit: state.limit,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
  })

  const columns: DataTableColumn<Event>[] = [
    {
      key: 'type',
      header: 'Event',
      render: (e) => <Badge tone={EVENT_TONE[e.type] ?? 'neutral'}>{e.type}</Badge>,
    },
    { key: 'userId', header: 'User', render: (e) => (e.userId ? <span className="font-mono text-xs">{e.userId}</span> : '—') },
    { key: 'ipAddress', header: 'IP address', render: (e) => e.ipAddress ?? '—' },
    { key: 'createdAt', header: 'When', render: (e) => formatDateTime(e.createdAt) },
  ]

  return (
    <div>
      <PageHeader title={t('title')} description={t('description')} />
      <EventFilterBar type={type} onTypeChange={setType} userId={userId} onUserIdChange={setUserId} />

      <DataTable<Event>
        columns={columns}
        rows={data?.data?.items ?? []}
        rowKey={(e) => e.eventId}
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
