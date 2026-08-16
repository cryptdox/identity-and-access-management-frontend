import { useNavigate } from 'react-router-dom'
import { Plus, Building2 } from 'lucide-react'
import { useListRealmsQuery } from '@/api/endpoints/realm.api'
import { usePagination } from '@/common/hooks/usePagination'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { DataTable, type DataTableColumn } from '@/common/components/ui/DataTable'
import { Badge } from '@/common/components/ui/Badge'
import { Button } from '@/common/components/ui/Button'
import type { Realm } from '@/features/realms/realm.types'

export default function RealmListPage() {
  const navigate = useNavigate()
  const { params, page, setPage, setSearch, state } = usePagination()
  const { data, isFetching } = useListRealmsQuery(params)

  const columns: DataTableColumn<Realm>[] = [
    { key: 'name', header: 'Realm', render: (r) => <span className="font-medium">{r.name}</span> },
    {
      key: 'enabled',
      header: 'Status',
      render: (r) => <Badge tone={r.enabled ? 'success' : 'neutral'}>{r.enabled ? 'Enabled' : 'Disabled'}</Badge>,
    },
    { key: 'createdAt', header: 'Created', render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—') },
  ]

  return (
    <div>
      <PageHeader
        title="Realms"
        description="Tenants in this IAM instance — pick one to manage its users, roles, and clients."
        actions={
          <Button size="sm" onClick={() => navigate('/realms/new')}>
            <Plus className="size-4" /> New realm
          </Button>
        }
      />

      <div className="mb-4 max-w-xs">
        <input
          type="search"
          placeholder="Search realms…"
          defaultValue={state.search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text placeholder:text-text-secondary/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <DataTable<Realm>
        columns={columns}
        rows={data?.data?.items ?? []}
        rowKey={(r) => r.realmId}
        loading={isFetching}
        page={page}
        limit={state.limit}
        total={data?.data?.total ?? 0}
        onPageChange={setPage}
        emptyMessage="No realms yet."
      />

      {!isFetching && (data?.data?.items.length ?? 0) > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data?.data?.items.map((realm) => (
            <button
              key={realm.realmId}
              onClick={() => navigate(`/r/${realm.realmId}/dashboard`)}
              className="animate-fade-in flex items-center gap-3 rounded-xl border border-border bg-surface p-4 text-left transition-shadow hover:shadow-md"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-text">{realm.name}</p>
                <p className="text-xs text-text-secondary">Open dashboard →</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
