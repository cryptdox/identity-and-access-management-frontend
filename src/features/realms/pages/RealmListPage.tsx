import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { useListRealmsQuery } from '@/api/endpoints/realm.api'
import { usePagination } from '@/common/hooks/usePagination'
import { useDebounce } from '@/common/hooks/useDebounce'
import { useRealmMutations } from '@/features/realms/hooks/useRealmMutations'
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { DataTable, type DataTableColumn } from '@/common/components/ui/DataTable'
import { Badge } from '@/common/components/ui/Badge'
import { Button } from '@/common/components/ui/Button'
import { confirm } from '@/common/utils/confirm'
import { formatDate } from '@/common/utils/formatDate'
import type { Realm } from '@/features/realms/realm.types'

export default function RealmListPage() {
  const { t } = useTranslation('realms')
  const navigate = useNavigate()
  const { user, isMasterRealmUser } = useCurrentUser()
  const { updateRealm, resetAllRateLimiters, isResettingAllRateLimiters } = useRealmMutations()
  const { params, page, setPage, setSearch, state } = usePagination()
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)
  const { data, isFetching } = useListRealmsQuery(params)
  // Which row's enable/disable toggle is in flight — tracked locally (not just
  // useRealmMutations().isUpdating) so only that one row's button shows loading,
  // not every button in the table at once.
  const [pendingRealmId, setPendingRealmId] = useState<string | null>(null)

  async function handleResetAllRateLimiters() {
    const confirmed = await confirm({
      title: 'Reset all rate limiters',
      message:
        "Clears login/register/email/reset-password rate-limit counters for EVERY realm, not just one. Anyone currently blocked anywhere can retry immediately — only use this for a genuine platform-wide issue.",
      confirmLabel: 'Reset all rate limiters',
      danger: true,
    })
    if (!confirmed) return
    await resetAllRateLimiters()
  }

  async function handleToggleEnabled(realm: Realm) {
    if (realm.enabled) {
      const confirmed = await confirm({
        title: 'Disable realm',
        message: `Disabling "${realm.name}" stops logins, registration, and API access for it immediately. Nothing is deleted — re-enable it any time to restore access.`,
        confirmLabel: 'Disable realm',
        danger: true,
      })
      if (!confirmed) return
    }
    setPendingRealmId(realm.realmId)
    try {
      await updateRealm(realm.realmId, { enabled: !realm.enabled })
    } finally {
      setPendingRealmId(null)
    }
  }

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
    {
      key: 'actions',
      header: '',
      render: (r) =>
        isMasterRealmUser ? (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/r/${r.realmId}/settings`)
              }}
            >
              Manage plan
            </Button>
            {/* Master's own realm never gets Enable/Disable — that would lock
            every admin, including Master's own, out of the whole console. */}
            {r.realmId !== user?.realmId && (
              <Button
                size="sm"
                variant="outline"
                loading={pendingRealmId === r.realmId}
                onClick={(e) => {
                  e.stopPropagation()
                  void handleToggleEnabled(r)
                }}
              >
                {r.enabled ? 'Disable' : 'Enable'}
              </Button>
            )}
          </div>
        ) : null,
    },
  ]

  return (
    <div>
      <PageHeader
        title={t('list.title')}
        description={t('list.description')}
        actions={
          <div className="flex items-center gap-2">
            {isMasterRealmUser && (
              <Button size="sm" variant="outline" loading={isResettingAllRateLimiters} onClick={() => void handleResetAllRateLimiters()}>
                Reset all rate limiters
              </Button>
            )}
            <Button size="sm" onClick={() => navigate('/realms/new')}>
              <Plus className="size-4" /> {t('new')}
            </Button>
          </div>
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
