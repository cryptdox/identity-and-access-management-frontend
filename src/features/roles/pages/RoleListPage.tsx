import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { useListRolesByClientQuery } from '@/api/endpoints/role.api'
import { useListClientsQuery } from '@/api/endpoints/client.api'
import { useRealmId } from '@/common/hooks/useRealmId'
import { usePagination } from '@/common/hooks/usePagination'
import { useDebounce } from '@/common/hooks/useDebounce'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { DataTable, type DataTableColumn } from '@/common/components/ui/DataTable'
import { Select } from '@/common/components/ui/Select'
import { Badge } from '@/common/components/ui/Badge'
import { Button } from '@/common/components/ui/Button'
import { useCan } from '@/common/hooks/usePermission'
import { ResourceName, TypeAction } from '@/api/types/enums.types'
import type { Role } from '@/features/roles/role.types'

/** The client this admin console itself authenticates as — see .env's
 * VITE_IAM_CLIENT_ID (same constant used by useLogin.ts/permissionString.ts). Used
 * only to pick a sensible default client for the filter below, not for auth. */
const IAM_CLIENT_ID = (import.meta.env.VITE_IAM_CLIENT_ID as string | undefined) ?? ''

export default function RoleListPage() {
  const { t } = useTranslation('roles')
  const realmId = useRealmId()
  const navigate = useNavigate()
  const canCreate = useCan(ResourceName.ROLE, TypeAction.CREATE)
  const { params, page, setPage, setSearch, state } = usePagination()
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)

  // Roles belong to exactly one client, so the list is always scoped to a single
  // client at a time (never a mixed "all clients" view) — defaults to this admin
  // console's own client once the client list loads.
  const { data: clientsData } = useListClientsQuery({ realmId, limit: 200 })
  const clients = clientsData?.data?.items ?? []
  const [clientIdInternal, setClientIdInternal] = useState('')

  useEffect(() => {
    if (clientIdInternal || clients.length === 0) return
    const iamClient = clients.find((c) => c.clientId === IAM_CLIENT_ID)
    setClientIdInternal(iamClient?.clientIdInternal ?? clients[0].clientIdInternal)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients])

  const { data, isFetching } = useListRolesByClientQuery(
    { clientIdInternal, ...params },
    { skip: !clientIdInternal },
  )

  useEffect(() => {
    setSearch(debouncedSearch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const columns: DataTableColumn<Role>[] = [
    {
      key: 'name',
      header: 'Role',
      render: (r) => (
        <span className="flex items-center gap-2">
          <Badge tone="neutral">{r.client?.clientId ?? r.clientIdInternal}</Badge>
          <span className="font-medium">{r.name}</span>
        </span>
      ),
    },
    { key: 'description', header: 'Description', render: (r) => r.description || '—' },
    {
      key: 'permissions',
      header: 'Permissions',
      render: (r) => <Badge tone="info">{r.permissions?.length ?? 0}</Badge>,
    },
  ]

  return (
    <div>
      <PageHeader
        title={t('list.title')}
        description={t('list.description')}
        actions={
          canCreate && (
            <Button size="sm" onClick={() => navigate(`/r/${realmId}/roles/new`)}>
              <Plus className="size-4" /> {t('new')}
            </Button>
          )
        }
      />

      <div className="mb-4 flex max-w-xl gap-3">
        <input
          type="search"
          placeholder={t('list.searchPlaceholder')}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-10 w-full max-w-xs rounded-lg border border-border bg-surface px-3 text-sm text-text placeholder:text-text-secondary/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <div className="w-56 shrink-0">
          <Select
            options={clients.map((c) => ({ value: c.clientIdInternal, label: c.clientId }))}
            value={clientIdInternal}
            onChange={(e) => {
              setClientIdInternal(e.target.value)
              setPage(0)
            }}
          />
        </div>
      </div>

      <DataTable<Role>
        columns={columns}
        rows={data?.data?.items ?? []}
        rowKey={(r) => r.roleId}
        loading={isFetching}
        page={page}
        limit={state.limit}
        total={data?.data?.total ?? 0}
        onPageChange={setPage}
        onRowClick={(r) => navigate(`/r/${realmId}/roles/${r.roleId}`)}
        emptyMessage={t('list.empty')}
      />
    </div>
  )
}
