import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  useGetDashboardViewTypesQuery,
  useGetClientDashboardViewsQuery,
  useCreateClientDashboardViewMutation,
  useDeleteDashboardViewMutation,
} from '@/api/endpoints/dashboard.api'
import { Input } from '@/common/components/ui/Input'
import { Select } from '@/common/components/ui/Select'
import { Button } from '@/common/components/ui/Button'
import { Badge } from '@/common/components/ui/Badge'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { EmptyState } from '@/common/components/ui/EmptyState'
import { confirm } from '@/common/utils/confirm'
import { useToast } from '@/common/hooks/useToast'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { useCan } from '@/common/hooks/usePermission'
import { ClientOwnerOnlyNotice } from '@/common/components/ui/ClientOwnerOnlyNotice'
import { ResourceName, TypeAction } from '@/api/types/enums.types'
import type { Client } from '@/features/clients/client.types'
import type { DashboardChartType, DashboardRealmScope } from '@/features/dashboard/dashboard.types'

const REALM_SCOPE_OPTIONS: { value: DashboardRealmScope; label: string }[] = [
  { value: 'BOTH', label: 'Every realm' },
  { value: 'MASTER', label: 'Master realm only' },
  { value: 'TENANT', label: 'Tenant realms only' },
]

const CHART_TYPE_OPTIONS: { value: DashboardChartType; label: string }[] = [
  { value: 'NUMBER', label: 'Number (stat card)' },
  { value: 'BAR', label: 'Bar chart' },
  { value: 'LINE', label: 'Line chart' },
  { value: 'AREA', label: 'Area chart' },
  { value: 'PIE', label: 'Pie chart' },
  { value: 'SCATTER', label: 'Scatter plot' },
]

export function ClientDashboardViewsForm({ client }: { client: Client }) {
  const clientIdInternal = client.clientIdInternal
  const canManage = useCan(ResourceName.CLIENT, TypeAction.UPDATE) && Boolean(client.isOwner)
  const toast = useToast()

  const { data: typesData, isLoading: isLoadingTypes } = useGetDashboardViewTypesQuery()
  const { data: viewsData, isLoading: isLoadingViews } = useGetClientDashboardViewsQuery(clientIdInternal)
  const [createView, { isLoading: isCreating }] = useCreateClientDashboardViewMutation()
  const [deleteView] = useDeleteDashboardViewMutation()

  const types = typesData?.data ?? []
  const views = viewsData?.data ?? []

  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [chartType, setChartType] = useState<DashboardChartType>('NUMBER')
  const [realmScope, setRealmScope] = useState<DashboardRealmScope>('BOTH')

  function handleTypeChange(nextType: string) {
    setType(nextType)
    // Default the chart type to whatever this data type usually renders as — the
    // admin can still override it below.
    const meta = types.find((t) => t.type === nextType)
    if (meta) setChartType(meta.defaultChartType)
  }

  async function handleCreate() {
    if (!name.trim() || !type) return
    try {
      await createView({ clientIdInternal, body: { name: name.trim(), type, chartType, realmScope } }).unwrap()
      toast.success('Dashboard view created')
      setName('')
      setType('')
      setChartType('NUMBER')
      setRealmScope('BOTH')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create dashboard view'))
    }
  }

  async function handleDelete(dashboardViewId: string, viewName: string) {
    const confirmed = await confirm({
      title: 'Delete dashboard view',
      message: `Delete "${viewName}"? Any role it's assigned to will lose it.`,
      confirmLabel: 'Delete',
      danger: true,
    })
    if (!confirmed) return
    try {
      await deleteView({ dashboardViewId, clientIdInternal }).unwrap()
      toast.success('Dashboard view deleted')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete dashboard view'))
    }
  }

  if (isLoadingTypes || isLoadingViews) {
    return (
      <div className="max-w-2xl space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      {!client.isOwner && (
        <ClientOwnerOnlyNotice feature="manage dashboard views" clientName={client.clientId ?? undefined} />
      )}

      <div className="space-y-2">
        {views.length === 0 ? (
          <EmptyState title="No dashboard views yet" description="Create one below, then assign it to roles from a role's Dashboard tab." />
        ) : (
          views.map((view) => (
            <div key={view.dashboardViewId} className="grid grid-cols-[1fr_7rem_7rem_8rem_2.5rem] items-center gap-3 rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium text-text">{view.name}</p>
                <p className="text-xs text-text-secondary">{types.find((t) => t.type === view.type)?.label ?? view.type}</p>
              </div>
              <Badge tone="neutral">{view.type}</Badge>
              <Badge tone="primary">{CHART_TYPE_OPTIONS.find((o) => o.value === view.chartType)?.label.split(' ')[0] ?? view.chartType}</Badge>
              <Badge tone={view.realmScope === 'BOTH' ? 'success' : 'info'}>
                {REALM_SCOPE_OPTIONS.find((o) => o.value === view.realmScope)?.label ?? view.realmScope}
              </Badge>
              {canManage && (
                <button
                  type="button"
                  onClick={() => void handleDelete(view.dashboardViewId, view.name)}
                  className="justify-self-center rounded-lg p-2 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
                  aria-label="Delete"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {canManage && (
        <div className="space-y-3 rounded-xl border border-border p-4">
          <p className="text-sm font-medium text-text">Create a dashboard view</p>
          <div className="grid grid-cols-[1fr_1fr] gap-3">
            <Input label="Label" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Active sessions" />
            <Select
              label="Data type"
              placeholder="Select a type…"
              options={types.map((t) => ({ value: t.type, label: t.label }))}
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
            />
          </div>
          {type && (
            <p className="text-xs text-text-secondary">{types.find((t) => t.type === type)?.description}</p>
          )}
          <div className="grid grid-cols-[1fr_1fr] gap-3">
            <Select
              label="Chart type"
              options={CHART_TYPE_OPTIONS}
              value={chartType}
              onChange={(e) => setChartType(e.target.value as DashboardChartType)}
            />
            <Select
              label="Visible to"
              options={REALM_SCOPE_OPTIONS}
              value={realmScope}
              onChange={(e) => setRealmScope(e.target.value as DashboardRealmScope)}
            />
          </div>
          <Button size="sm" loading={isCreating} disabled={!name.trim() || !type} onClick={() => void handleCreate()}>
            <Plus className="size-4" /> Create view
          </Button>
        </div>
      )}
    </div>
  )
}
