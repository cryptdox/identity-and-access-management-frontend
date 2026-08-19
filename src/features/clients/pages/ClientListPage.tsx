import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { useListClientsQuery } from '@/api/endpoints/client.api'
import { useRealmId } from '@/common/hooks/useRealmId'
import { usePagination } from '@/common/hooks/usePagination'
import { useDebounce } from '@/common/hooks/useDebounce'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { DataTable, type DataTableColumn } from '@/common/components/ui/DataTable'
import { Badge } from '@/common/components/ui/Badge'
import { Button } from '@/common/components/ui/Button'
import { useCan } from '@/common/hooks/usePermission'
import { ResourceName, TypeAction } from '@/api/types/enums.types'
import type { Client } from '@/features/clients/client.types'

export default function ClientListPage() {
  const { t } = useTranslation('clients')
  const realmId = useRealmId()
  const navigate = useNavigate()
  const canCreate = useCan(ResourceName.CLIENT, TypeAction.CREATE)
  const { params, page, setPage, setSearch, state } = usePagination()
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)
  const { data, isFetching } = useListClientsQuery({ ...params, realmId })

  useEffect(() => {
    setSearch(debouncedSearch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const columns: DataTableColumn<Client>[] = [
    { key: 'clientId', header: 'Client ID', render: (c) => <span className="font-medium">{c.clientId}</span> },
    { key: 'name', header: 'Name', render: (c) => c.name || '—' },
    { key: 'type', header: 'Type', render: (c) => <Badge tone={c.type === 'PUBLIC' ? 'info' : 'primary'}>{c.type}</Badge> },
    {
      key: 'enabled',
      header: 'Status',
      render: (c) => <Badge tone={c.enabled ? 'success' : 'neutral'}>{c.enabled ? 'Enabled' : 'Disabled'}</Badge>,
    },
    {
      key: 'crAccessCode',
      header: 'CR Access code',
      render: (c) => (c.crAccessCode ? <code className="text-xs">{c.crAccessCode}</code> : '—'),
    },
  ]

  return (
    <div>
      <PageHeader
        title={t('list.title')}
        description={t('list.description')}
        actions={
          canCreate && (
            <Button size="sm" onClick={() => navigate(`/r/${realmId}/clients/new`)}>
              <Plus className="size-4" /> {t('new')}
            </Button>
          )
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

      <DataTable<Client>
        columns={columns}
        rows={data?.data?.items ?? []}
        rowKey={(c) => c.clientIdInternal}
        loading={isFetching}
        page={page}
        limit={state.limit}
        total={data?.data?.total ?? 0}
        onPageChange={setPage}
        onRowClick={(c) => navigate(`/r/${realmId}/clients/${c.clientIdInternal}`)}
        emptyMessage={t('list.empty')}
      />
    </div>
  )
}
