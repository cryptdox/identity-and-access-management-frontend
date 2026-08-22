import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useListEventsQuery } from '@/api/endpoints/event.api'
import { useRealmId } from '@/common/hooks/useRealmId'
import { usePagination } from '@/common/hooks/usePagination'
import { useDebounce } from '@/common/hooks/useDebounce'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { DataTable, type DataTableColumn } from '@/common/components/ui/DataTable'
import { Badge } from '@/common/components/ui/Badge'
import { EventFilterBar } from '@/features/events/components/EventFilterBar'
import { formatDateTime } from '@/common/utils/formatDate'
import { UserIdentity } from '@/common/components/ui/UserIdentity'
import { useCan } from '@/common/hooks/usePermission'
import { ResourceName, TypeAction } from '@/api/types/enums.types'
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
  // Without EVENT:READ_ALL, the backend force-scopes this list to the caller's own
  // events — adjust the framing and hide the now-dead search filter to match.
  const canReadAll = useCan(ResourceName.EVENT, TypeAction.READ_ALL)
  const [type, setType] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const debouncedUserSearch = useDebounce(userSearch, 300)

  const { data, isFetching } = useListEventsQuery({
    realmId,
    type: (type || undefined) as TypeEvent | undefined,
    userSearch: debouncedUserSearch || undefined,
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
    { key: 'userId', header: 'User', render: (e) => (e.userId ? <UserIdentity user={e.user} fallbackId={e.userId} /> : '—') },
    { key: 'ipAddress', header: 'IP address', render: (e) => e.ipAddress ?? '—' },
    { key: 'createdAt', header: 'When', render: (e) => formatDateTime(e.createdAt) },
  ]

  return (
    <div>
      <PageHeader title={canReadAll ? t('title') : 'My activity'} description={canReadAll ? t('description') : 'Events recorded for your own account.'} />
      <EventFilterBar type={type} onTypeChange={setType} userSearch={userSearch} onUserSearchChange={setUserSearch} hideUserFilter={!canReadAll} />

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
