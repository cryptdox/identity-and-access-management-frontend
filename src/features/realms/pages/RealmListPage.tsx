import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { useListRealmsQuery } from '@/api/endpoints/realm.api'
import { usePagination } from '@/common/hooks/usePagination'
import { useDebounce } from '@/common/hooks/useDebounce'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { DataTable, type DataTableColumn } from '@/common/components/ui/DataTable'
import { Badge } from '@/common/components/ui/Badge'
import { Button } from '@/common/components/ui/Button'
import { formatDate } from '@/common/utils/formatDate'
import type { Realm } from '@/features/realms/realm.types'

export default function RealmListPage() {
  const { t } = useTranslation('realms')
  const navigate = useNavigate()
  const { params, page, setPage, setSearch, state } = usePagination()
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)
  const { data, isFetching } = useListRealmsQuery(params)

  useEffect(() => {
    setSearch(debouncedSearch)
    // setSearch's identity is stable (useCallback with no deps in usePagination), so
    // this only re-runs when the debounced value actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const columns: DataTableColumn<Realm>[] = [
    { key: 'name', header: 'Realm', render: (r) => <span className="font-medium">{r.name}</span> },
    {
      key: 'enabled',
      header: 'Status',
      render: (r) => <Badge tone={r.enabled ? 'success' : 'neutral'}>{r.enabled ? 'Enabled' : 'Disabled'}</Badge>,
    },
    { key: 'createdAt', header: 'Created', render: (r) => formatDate(r.createdAt) },
  ]

  return (
    <div>
      <PageHeader
        title={t('list.title')}
        description={t('list.description')}
        actions={
          <Button size="sm" onClick={() => navigate('/realms/new')}>
            <Plus className="size-4" /> {t('new')}
          </Button>
        }
      />

      <div className="mb-4 max-w-xs">
        <input
          type="search"
          placeholder={t('list.searchPlaceholder')}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
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
        onRowClick={(realm) => navigate(`/r/${realm.realmId}/dashboard`)}
        emptyMessage={t('list.empty')}
      />
    </div>
  )
}
