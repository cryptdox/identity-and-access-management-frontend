import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLazyListPackageModuleLogsQuery } from '@/api/endpoints/package.api'
import { useCursorList } from '@/common/hooks/useCursorList'
import { useDebounce } from '@/common/hooks/useDebounce'
import { DataTable, type DataTableColumn } from '@/common/components/ui/DataTable'
import { Badge } from '@/common/components/ui/Badge'
import { Select } from '@/common/components/ui/Select'
import { DateRangeFilter } from '@/common/components/ui/DateRangeFilter'
import { formatDateTime } from '@/common/utils/formatDate'
import type { RealmPackageLogWithRealm } from '@/features/realms/realmPackage.types'

const ACTION_TONE = {
  ASSIGNED: 'info',
  REQUESTED: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  UPDATED: 'primary',
} as const

const ACTION_OPTIONS = [
  { value: '', label: 'All actions' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'REQUESTED', label: 'Requested' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'UPDATED', label: 'Updated' },
]

/** The full package lifecycle feed across every realm — every trial grant,
 * request, approval, rejection, and direct Master change, newest first. */
export function PackageLogsTab() {
  const navigate = useNavigate()
  const [realmSearch, setRealmSearch] = useState('')
  const debouncedRealmSearch = useDebounce(realmSearch, 300)
  const [actionFilter, setActionFilter] = useState('')
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null })

  const [trigger] = useLazyListPackageModuleLogsQuery()
  const { items, isLoading, isLoadingMore, hasMore, loadMore } = useCursorList(trigger, {
    limit: 20,
    realmName: debouncedRealmSearch || undefined,
    action: actionFilter || undefined,
    dateFrom: dateRange.from?.toISOString(),
    dateTo: dateRange.to?.toISOString(),
  })

  const columns: DataTableColumn<RealmPackageLogWithRealm>[] = [
    { key: 'realmName', header: 'Realm', render: (l) => <span className="font-medium">{l.realmName}</span> },
    { key: 'action', header: 'Action', render: (l) => <Badge tone={ACTION_TONE[l.action]}>{l.action}</Badge> },
    { key: 'createdAt', header: 'When', render: (l) => formatDateTime(l.createdAt) },
  ]

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search by realm..."
          value={realmSearch}
          onChange={(e) => setRealmSearch(e.target.value)}
          className="h-10 w-full max-w-xs rounded-lg border border-border bg-surface px-3 text-sm text-text placeholder:text-text-secondary/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <div className="w-44">
          <Select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} options={ACTION_OPTIONS} />
        </div>
        <DateRangeFilter from={dateRange.from} to={dateRange.to} onChange={setDateRange} />
      </div>

      <DataTable<RealmPackageLogWithRealm>
        columns={columns}
        rows={items}
        rowKey={(l) => l.realmPackageLogId}
        loading={isLoading}
        hasMore={hasMore}
        loadingMore={isLoadingMore}
        onLoadMore={() => void loadMore()}
        onRowClick={(l) => navigate(`/r/${l.realmId}/settings`)}
        emptyMessage="No package logs found."
      />
    </div>
  )
}
