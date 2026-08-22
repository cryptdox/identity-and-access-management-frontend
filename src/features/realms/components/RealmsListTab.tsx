import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLazyListRealmsCursorQuery } from '@/api/endpoints/realm.api'
import { useCursorList } from '@/common/hooks/useCursorList'
import { useDebounce } from '@/common/hooks/useDebounce'
import { useRealmMutations } from '@/features/realms/hooks/useRealmMutations'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { DataTable, type DataTableColumn } from '@/common/components/ui/DataTable'
import { Badge } from '@/common/components/ui/Badge'
import { Button } from '@/common/components/ui/Button'
import { Select } from '@/common/components/ui/Select'
import { confirm } from '@/common/utils/confirm'
import { formatDate } from '@/common/utils/formatDate'
import type { Realm } from '@/features/realms/realm.types'

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Enabled' },
  { value: 'false', label: 'Disabled' },
]

// Filters directly on the RealmOrigin enum column (schema.prisma) — not the
// derived requestStatus shown in the table's "Request status" column below.
const ORIGIN_OPTIONS = [
  { value: '', label: 'Any origin' },
  { value: 'MASTER_CREATED', label: 'Created directly' },
  { value: 'PUBLIC_REQUEST', label: 'Public request' },
]

const REQUEST_STATUS_LABEL: Record<string, string> = {
  PENDING_REVIEW: 'Pending review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
}
const REQUEST_STATUS_TONE = { PENDING_REVIEW: 'warning', APPROVED: 'success', REJECTED: 'danger' } as const

// Filters directly on the persisted RealmRequestStatus enum column
// (schema.prisma) — independent of, and combinable with, the origin filter.
const REQUEST_STATUS_OPTIONS = [
  { value: '', label: 'Any status' },
  { value: 'PENDING_REVIEW', label: 'Pending review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
]

/** Cursor ("load more") paginated, newest realm first — the Realms list page's
 * "Realms" tab. See useCursorList for why this list (and Package requests
 * alongside it) is cursor-paginated while every other list in the app isn't. */
export function RealmsListTab() {
  const { t } = useTranslation('realms')
  const navigate = useNavigate()
  const { user, isMasterRealmUser } = useCurrentUser()
  const { updateRealm, rejectRealmRequest } = useRealmMutations()
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)
  const [statusFilter, setStatusFilter] = useState('')
  const [originFilter, setOriginFilter] = useState('')
  const [requestStatusFilter, setRequestStatusFilter] = useState('')
  // Which row's enable/disable toggle is in flight — tracked locally so only
  // that one row's button shows loading, not every button in the table at once.
  const [pendingRealmId, setPendingRealmId] = useState<string | null>(null)

  const [trigger] = useLazyListRealmsCursorQuery()
  const { items, isLoading, isLoadingMore, hasMore, loadMore, reload } = useCursorList(trigger, {
    limit: 20,
    search: debouncedSearch || undefined,
    enabled: statusFilter === '' ? undefined : statusFilter === 'true',
    origin: (originFilter || undefined) as 'MASTER_CREATED' | 'PUBLIC_REQUEST' | undefined,
    requestStatus: (requestStatusFilter || undefined) as 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | undefined,
  })

  async function handleToggleEnabled(realm: Realm) {
    if (realm.enabled) {
      const confirmed = await confirm({
        title: 'Disable realm',
        message: `Disabling "${realm.name}" stops logins, registration, and API access for it immediately. Nothing is deleted — re-enable it any time to restore access.`,
        confirmLabel: 'Disable realm',
        danger: true,
      })
      if (!confirmed) return
    }
    setPendingRealmId(realm.realmId)
    try {
      await updateRealm(realm.realmId, { enabled: !realm.enabled })
      void reload()
    } finally {
      setPendingRealmId(null)
    }
  }

  async function handleReject(realm: Realm) {
    const confirmed = await confirm({
      title: 'Reject realm request',
      message: `Declining "${realm.name}" leaves it disabled — nothing is deleted, and you can still enable it later if you change your mind.`,
      confirmLabel: 'Reject request',
      danger: true,
    })
    if (!confirmed) return
    setPendingRealmId(realm.realmId)
    try {
      await rejectRealmRequest(realm.realmId)
      void reload()
    } finally {
      setPendingRealmId(null)
    }
  }

  const columns: DataTableColumn<Realm>[] = [
    { key: 'name', header: 'Realm', render: (r) => <span className="font-medium">{r.name}</span> },
    {
      key: 'enabled',
      header: 'Status',
      render: (r) => <Badge tone={r.enabled ? 'success' : 'neutral'}>{r.enabled ? 'Enabled' : 'Disabled'}</Badge>,
    },
    {
      key: 'requestStatus',
      header: 'Request status',
      render: (r) =>
        r.requestStatus ? (
          <Badge tone={REQUEST_STATUS_TONE[r.requestStatus]}>{REQUEST_STATUS_LABEL[r.requestStatus]}</Badge>
        ) : (
          '—'
        ),
    },
    { key: 'createdAt', header: 'Created', render: (r) => formatDate(r.createdAt) },
    {
      key: 'actions',
      header: '',
      render: (r) =>
        isMasterRealmUser ? (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/r/${r.realmId}/settings`)
              }}
            >
              Manage plan
            </Button>
            {/* Master's own realm never gets Enable/Disable — that would lock
            every admin, including Master's own, out of the whole console. */}
            {r.realmId !== user?.realmId && (
              <Button
                size="sm"
                variant="outline"
                loading={pendingRealmId === r.realmId}
                onClick={(e) => {
                  e.stopPropagation()
                  void handleToggleEnabled(r)
                }}
              >
                {r.enabled ? 'Disable' : 'Enable'}
              </Button>
            )}
            {r.origin === 'PUBLIC_REQUEST' && r.requestStatus === 'PENDING_REVIEW' && (
              <Button
                size="sm"
                variant="danger"
                loading={pendingRealmId === r.realmId}
                onClick={(e) => {
                  e.stopPropagation()
                  void handleReject(r)
                }}
              >
                Reject
              </Button>
            )}
          </div>
        ) : null,
    },
  ]

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder={t('list.searchPlaceholder')}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-10 w-full max-w-xs rounded-lg border border-border bg-surface px-3 text-sm text-text placeholder:text-text-secondary/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <div className="w-40">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={STATUS_OPTIONS} />
        </div>
        <div className="w-52">
          <Select value={originFilter} onChange={(e) => setOriginFilter(e.target.value)} options={ORIGIN_OPTIONS} />
        </div>
        <div className="w-48">
          <Select
            value={requestStatusFilter}
            onChange={(e) => setRequestStatusFilter(e.target.value)}
            options={REQUEST_STATUS_OPTIONS}
          />
        </div>
      </div>

      <DataTable<Realm>
        columns={columns}
        rows={items}
        rowKey={(r) => r.realmId}
        loading={isLoading}
        hasMore={hasMore}
        loadingMore={isLoadingMore}
        onLoadMore={() => void loadMore()}
        onRowClick={(realm) => navigate(`/r/${realm.realmId}/dashboard`)}
        emptyMessage={t('list.empty')}
      />
    </div>
  )
}
