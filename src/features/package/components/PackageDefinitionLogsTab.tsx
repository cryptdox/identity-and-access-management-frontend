import { useLazyListPackageDefinitionLogsQuery } from '@/api/endpoints/package.api'
import { useCursorList } from '@/common/hooks/useCursorList'
import { DataTable, type DataTableColumn } from '@/common/components/ui/DataTable'
import { Badge } from '@/common/components/ui/Badge'
import { formatDateTime } from '@/common/utils/formatDate'
import type { PackageDefinitionLog } from '@/features/realms/realmPackage.types'

const ACTION_TONE = {
  CREATED: 'info',
  UPDATED: 'primary',
  ACTIVATED: 'success',
  DEACTIVATED: 'danger',
} as const

function formatValue(v: unknown): string {
  if (v == null) return 'Unlimited'
  if (typeof v === 'boolean') return v ? 'Active' : 'Inactive'
  return String(v)
}

function renderChanges(log: PackageDefinitionLog): string {
  if (!log.changes) return '—'
  return Object.entries(log.changes)
    .map(([field, { from, to }]) => `${field}: ${formatValue(from)} → ${formatValue(to)}`)
    .join(', ')
}

/** Catalog-level change feed — every create, edit, activate, and deactivate of
 * a pricing plan definition, across every tier/cycle combo. Distinct from the
 * Logs tab, which tracks each REALM's own package lifecycle instead. */
export function PackageDefinitionLogsTab() {
  const [trigger] = useLazyListPackageDefinitionLogsQuery()
  const { items, isLoading, isLoadingMore, hasMore, loadMore } = useCursorList(trigger, { limit: 20 })

  const columns: DataTableColumn<PackageDefinitionLog>[] = [
    {
      key: 'plan',
      header: 'Plan',
      render: (l) => (
        <span className="font-medium">
          {l.packageDefinition.tier} ({l.packageDefinition.billingCycle})
        </span>
      ),
    },
    { key: 'action', header: 'Action', render: (l) => <Badge tone={ACTION_TONE[l.action]}>{l.action}</Badge> },
    { key: 'changes', header: 'Changes', render: (l) => <span className="text-sm text-text-secondary">{renderChanges(l)}</span> },
    { key: 'createdAt', header: 'When', render: (l) => formatDateTime(l.createdAt) },
  ]

  return (
    <DataTable<PackageDefinitionLog>
      columns={columns}
      rows={items}
      rowKey={(l) => l.packageDefinitionLogId}
      loading={isLoading}
      hasMore={hasMore}
      loadingMore={isLoadingMore}
      onLoadMore={() => void loadMore()}
      emptyMessage="No package definition changes logged yet."
    />
  )
}
