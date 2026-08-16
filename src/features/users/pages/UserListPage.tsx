import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { useListUsersQuery } from '@/api/endpoints/user.api'
import { useRealmId } from '@/common/hooks/useRealmId'
import { usePagination } from '@/common/hooks/usePagination'
import { useDebounce } from '@/common/hooks/useDebounce'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { DataTable, type DataTableColumn } from '@/common/components/ui/DataTable'
import { Badge } from '@/common/components/ui/Badge'
import { Button } from '@/common/components/ui/Button'
import { useCan } from '@/common/hooks/usePermission'
import { ResourceName, TypeAction } from '@/api/types/enums.types'
import type { User } from '@/features/users/user.types'

export default function UserListPage() {
  const { t } = useTranslation('users')
  const realmId = useRealmId()
  const navigate = useNavigate()
  const canCreate = useCan(ResourceName.USER, TypeAction.CREATE)
  const { params, page, setPage, setSearch, setSort, state } = usePagination({ sortBy: 'createdAt', sortOrder: 'desc' })
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)
  const { data, isFetching } = useListUsersQuery({ ...params, realmId })

  useEffect(() => {
    setSearch(debouncedSearch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const columns: DataTableColumn<User>[] = [
    {
      key: 'username',
      header: 'Username',
      sortable: true,
      render: (u) => <span className="font-medium">{u.username}</span>,
    },
    { key: 'email', header: 'Email' },
    {
      key: 'enabled',
      header: 'Status',
      render: (u) => <Badge tone={u.enabled ? 'success' : 'neutral'}>{u.enabled ? 'Enabled' : 'Disabled'}</Badge>,
    },
    {
      key: 'emailVerified',
      header: 'Email verified',
      render: (u) => <Badge tone={u.emailVerified ? 'info' : 'warning'}>{u.emailVerified ? 'Verified' : 'Unverified'}</Badge>,
    },
  ]

  return (
    <div>
      <PageHeader
        title={t('list.title')}
        description={t('list.description')}
        actions={
          canCreate && (
            <Button size="sm" onClick={() => navigate(`/r/${realmId}/users/new`)}>
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

      <DataTable<User>
        columns={columns}
        rows={data?.data?.items ?? []}
        rowKey={(u) => u.userId}
        loading={isFetching}
        page={page}
        limit={state.limit}
        total={data?.data?.total ?? 0}
        onPageChange={setPage}
        sortBy={state.sortBy}
        sortOrder={state.sortOrder}
        onSort={setSort}
        onRowClick={(u) => navigate(`/r/${realmId}/users/${u.userId}`)}
        emptyMessage={t('list.empty')}
      />
    </div>
  )
}
