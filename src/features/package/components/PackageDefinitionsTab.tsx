import { useMemo, useState } from 'react'
import { useLazyListPackageModuleDefinitionsQuery, useUpdatePackageDefinitionMutation } from '@/api/endpoints/package.api'
import { useCursorList } from '@/common/hooks/useCursorList'
import { DataTable, type DataTableColumn } from '@/common/components/ui/DataTable'
import { Badge } from '@/common/components/ui/Badge'
import { Button } from '@/common/components/ui/Button'
import { Select } from '@/common/components/ui/Select'
import { useDebounce } from '@/common/hooks/useDebounce'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { PackageDefinitionFormModal } from './PackageDefinitionFormModal'
import type { PackageDefinition } from '@/features/realms/realmPackage.types'

const CYCLE_OPTIONS = [
  { value: '', label: 'All cycles' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' },
]

const ACTIVE_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
]

/** The pricing catalog — seeded at bootstrap, but manageable by Master here:
 * create a new tier/cycle combo, edit its limits/price, or deactivate one so
 * it stops being offered publicly without deleting it (existing realms may
 * still be on it). Cursor-paginated, newest-first, like every other Packages
 * module tab; tier/cycle/active filters apply client-side over the currently
 * loaded page(s) since the whole catalog is always small. */
export function PackageDefinitionsTab() {
  const [trigger] = useLazyListPackageModuleDefinitionsQuery()
  const { items, isLoading, isLoadingMore, hasMore, loadMore, reload } = useCursorList(trigger, { limit: 20 })
  const [updateDefinition] = useUpdatePackageDefinitionMutation()
  const toast = useToast()

  const [tierSearch, setTierSearch] = useState('')
  const debouncedTierSearch = useDebounce(tierSearch, 300)
  const [cycleFilter, setCycleFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PackageDefinition | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const filtered = useMemo(
    () =>
      items.filter((d) => {
        if (debouncedTierSearch && !d.tier.toLowerCase().includes(debouncedTierSearch.toLowerCase())) return false
        if (cycleFilter && d.billingCycle !== cycleFilter) return false
        if (activeFilter && String(d.isActive) !== activeFilter) return false
        return true
      }),
    [items, debouncedTierSearch, cycleFilter, activeFilter],
  )

  async function handleToggleActive(d: PackageDefinition) {
    setTogglingId(d.packageDefinitionId)
    try {
      await updateDefinition({ packageDefinitionId: d.packageDefinitionId, body: { isActive: !d.isActive } }).unwrap()
      toast.success(d.isActive ? 'Definition deactivated' : 'Definition activated')
      void reload()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update package definition'))
    } finally {
      setTogglingId(null)
    }
  }

  const columns: DataTableColumn<PackageDefinition>[] = [
    { key: 'tier', header: 'Tier', render: (d) => <span className="font-medium">{d.tier}</span> },
    { key: 'billingCycle', header: 'Billing cycle', render: (d) => <Badge tone="info">{d.billingCycle}</Badge> },
    { key: 'userLimit', header: 'User limit', render: (d) => d.userLimit ?? 'Unlimited' },
    { key: 'concurrentLoginLimit', header: 'Concurrent logins', render: (d) => d.concurrentLoginLimit ?? 'Unlimited' },
    { key: 'price', header: 'Price', render: (d) => (d.price == null ? 'Contact us' : `$${d.price}`) },
    {
      key: 'isActive',
      header: 'Status',
      render: (d) => <Badge tone={d.isActive ? 'success' : 'neutral'}>{d.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      render: (d) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              setEditing(d)
              setModalOpen(true)
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            loading={togglingId === d.packageDefinitionId}
            onClick={(e) => {
              e.stopPropagation()
              void handleToggleActive(d)
            }}
          >
            {d.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search by tier..."
          value={tierSearch}
          onChange={(e) => setTierSearch(e.target.value)}
          className="h-10 w-full max-w-xs rounded-lg border border-border bg-surface px-3 text-sm text-text placeholder:text-text-secondary/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <div className="w-40">
          <Select value={cycleFilter} onChange={(e) => setCycleFilter(e.target.value)} options={CYCLE_OPTIONS} />
        </div>
        <div className="w-40">
          <Select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)} options={ACTIVE_OPTIONS} />
        </div>
        <Button
          className="ml-auto"
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
        >
          New definition
        </Button>
      </div>

      <DataTable<PackageDefinition>
        columns={columns}
        rows={filtered}
        rowKey={(d) => d.packageDefinitionId}
        loading={isLoading}
        hasMore={hasMore}
        loadingMore={isLoadingMore}
        onLoadMore={() => void loadMore()}
        emptyMessage="No package definitions found."
      />

      <PackageDefinitionFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          void reload()
        }}
        editing={editing}
      />
    </div>
  )
}
