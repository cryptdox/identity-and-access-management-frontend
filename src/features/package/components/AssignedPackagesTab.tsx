import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLazyListAssignedPackagesQuery, useListPackageModuleDefinitionsQuery } from '@/api/endpoints/package.api'
import { useCursorList } from '@/common/hooks/useCursorList'
import { useDebounce } from '@/common/hooks/useDebounce'
import { DataTable, type DataTableColumn } from '@/common/components/ui/DataTable'
import { Select } from '@/common/components/ui/Select'
import { formatDate } from '@/common/utils/formatDate'
import type { RealmPackageWithRealm } from '@/features/realms/realmPackage.types'

/** Which realm currently has which package, in one directory — most
 * recently-changed assignment first — instead of visiting each realm's own
 * Package tab to find out. */
export function AssignedPackagesTab() {
  const navigate = useNavigate()
  const [realmSearch, setRealmSearch] = useState('')
  const debouncedRealmSearch = useDebounce(realmSearch, 300)
  const [definitionFilter, setDefinitionFilter] = useState('')

  const { data: definitionsData } = useListPackageModuleDefinitionsQuery()
  const definitionOptions = [
    { value: '', label: 'All plans' },
    ...(definitionsData?.data ?? []).map((d) => ({
      value: d.packageDefinitionId,
      label: `${d.tier} (${d.billingCycle})`,
    })),
  ]

  const [trigger] = useLazyListAssignedPackagesQuery()
  const { items, isLoading, isLoadingMore, hasMore, loadMore } = useCursorList(trigger, {
    limit: 20,
    realmName: debouncedRealmSearch || undefined,
    packageDefinitionId: definitionFilter || undefined,
  })

  const columns: DataTableColumn<RealmPackageWithRealm>[] = [
    { key: 'realmName', header: 'Realm', render: (r) => <span className="font-medium">{r.realmName}</span> },
    {
      key: 'plan',
      header: 'Plan',
      render: (r) => `${r.packageDefinition.tier} (${r.packageDefinition.billingCycle})`,
    },
    { key: 'userLimit', header: 'User limit', render: (r) => r.packageDefinition.userLimit ?? 'Unlimited' },
    {
      key: 'concurrentLoginLimit',
      header: 'Concurrent logins',
      render: (r) => r.packageDefinition.concurrentLoginLimit ?? 'Unlimited',
    },
    { key: 'activeFrom', header: 'Active from', render: (r) => formatDate(r.activeFrom) },
    { key: 'activeTo', header: 'Active to', render: (r) => formatDate(r.activeTo) },
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
        <div className="w-56">
          <Select value={definitionFilter} onChange={(e) => setDefinitionFilter(e.target.value)} options={definitionOptions} />
        </div>
      </div>

      <DataTable<RealmPackageWithRealm>
        columns={columns}
        rows={items}
        rowKey={(r) => r.realmPackageId}
        loading={isLoading}
        hasMore={hasMore}
        loadingMore={isLoadingMore}
        onLoadMore={() => void loadMore()}
        onRowClick={(r) => navigate(`/r/${r.realmId}/settings`)}
        emptyMessage="No assigned packages found."
      />
    </div>
  )
}
