import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLazyListPackageModuleRequestsQuery, useListPackageModuleDefinitionsQuery } from '@/api/endpoints/package.api'
import { useApprovePackageRequestMutation, useRejectPackageRequestMutation } from '@/api/endpoints/realm.api'
import { useCursorList } from '@/common/hooks/useCursorList'
import { useDebounce } from '@/common/hooks/useDebounce'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { confirm } from '@/common/utils/confirm'
import { formatDateTime } from '@/common/utils/formatDate'
import { DataTable, type DataTableColumn } from '@/common/components/ui/DataTable'
import { Badge } from '@/common/components/ui/Badge'
import { Button } from '@/common/components/ui/Button'
import { Select } from '@/common/components/ui/Select'
import { DateRangeFilter } from '@/common/components/ui/DateRangeFilter'
import type { DowngradeConfirmationRequired, RealmPackageRequestWithRealm } from '@/features/realms/realmPackage.types'

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: '', label: 'All' },
]

const STATUS_TONE = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' } as const

function asDowngradeConfirmation(err: unknown): DowngradeConfirmationRequired | null {
  if (err && typeof err === 'object' && 'data' in err) {
    const data = (err as { data?: unknown }).data
    if (data && typeof data === 'object' && 'requiresConfirmation' in data) {
      return data as DowngradeConfirmationRequired
    }
  }
  return null
}

/** Every tenant's package change requests in one place, newest first. */
export function PackageRequestsTab() {
  const navigate = useNavigate()
  const toast = useToast()
  const [status, setStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | ''>('PENDING')
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [realmSearch, setRealmSearch] = useState('')
  const debouncedRealmSearch = useDebounce(realmSearch, 300)
  const [definitionFilter, setDefinitionFilter] = useState('')
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null })

  const { data: definitionsData } = useListPackageModuleDefinitionsQuery()
  const definitionOptions = [
    { value: '', label: 'All plans' },
    ...(definitionsData?.data ?? []).map((d) => ({
      value: d.packageDefinitionId,
      label: `${d.tier} (${d.billingCycle})`,
    })),
  ]

  const [trigger] = useLazyListPackageModuleRequestsQuery()
  const { items, isLoading, isLoadingMore, hasMore, loadMore, reload } = useCursorList(trigger, {
    status: status || undefined,
    realmName: debouncedRealmSearch || undefined,
    packageDefinitionId: definitionFilter || undefined,
    dateFrom: dateRange.from?.toISOString(),
    dateTo: dateRange.to?.toISOString(),
    limit: 20,
  })

  const [approveRequest] = useApprovePackageRequestMutation()
  const [rejectRequest] = useRejectPackageRequestMutation()

  async function handleApprove(r: RealmPackageRequestWithRealm, confirmForceDowngrade?: boolean) {
    setActioningId(r.realmPackageRequestId)
    try {
      await approveRequest({ realmId: r.realmId, requestId: r.realmPackageRequestId, confirmForceDowngrade }).unwrap()
      toast.success('Package request approved')
      void reload()
    } catch (err) {
      const confirmation = asDowngradeConfirmation(err)
      if (confirmation) {
        const ok = await confirm({
          title: 'Confirm downgrade',
          message: confirmation.message,
          confirmLabel: 'Deactivate & apply',
          danger: true,
        })
        if (ok) await handleApprove(r, true)
        return
      }
      toast.error(getApiErrorMessage(err, 'Failed to approve request'))
    } finally {
      setActioningId(null)
    }
  }

  async function handleReject(r: RealmPackageRequestWithRealm) {
    setActioningId(r.realmPackageRequestId)
    try {
      await rejectRequest({ realmId: r.realmId, requestId: r.realmPackageRequestId }).unwrap()
      toast.success('Package request rejected')
      void reload()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to reject request'))
    } finally {
      setActioningId(null)
    }
  }

  const columns: DataTableColumn<RealmPackageRequestWithRealm>[] = [
    { key: 'realmName', header: 'Realm', render: (r) => <span className="font-medium">{r.realmName}</span> },
    {
      key: 'requested',
      header: 'Requested plan',
      render: (r) => `${r.packageDefinition.tier} (${r.packageDefinition.billingCycle})`,
    },
    {
      key: 'price',
      header: 'Price',
      render: (r) =>
        r.calculatedPrice == null
          ? 'Contact us'
          : r.calculatedPrice >= 0
            ? `$${r.calculatedPrice.toFixed(2)} due`
            : `$${Math.abs(r.calculatedPrice).toFixed(2)} credit`,
    },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge> },
    { key: 'createdAt', header: 'Requested', render: (r) => formatDateTime(r.createdAt) },
    {
      key: 'actions',
      header: '',
      render: (r) =>
        r.status === 'PENDING' ? (
          <div className="flex justify-end gap-2">
            <Button size="sm" loading={actioningId === r.realmPackageRequestId} onClick={(e) => { e.stopPropagation(); void handleApprove(r) }}>
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              loading={actioningId === r.realmPackageRequestId}
              onClick={(e) => {
                e.stopPropagation()
                void handleReject(r)
              }}
            >
              Reject
            </Button>
          </div>
        ) : null,
    },
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
        <div className="w-40">
          <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} options={STATUS_OPTIONS} />
        </div>
        <div className="w-56">
          <Select value={definitionFilter} onChange={(e) => setDefinitionFilter(e.target.value)} options={definitionOptions} />
        </div>
        <DateRangeFilter from={dateRange.from} to={dateRange.to} onChange={setDateRange} />
      </div>

      <DataTable<RealmPackageRequestWithRealm>
        columns={columns}
        rows={items}
        rowKey={(r) => r.realmPackageRequestId}
        loading={isLoading}
        hasMore={hasMore}
        loadingMore={isLoadingMore}
        onLoadMore={() => void loadMore()}
        onRowClick={(r) => navigate(`/r/${r.realmId}/settings`)}
        emptyMessage="No package requests found."
      />
    </div>
  )
}
