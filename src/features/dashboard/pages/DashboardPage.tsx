import { useState } from 'react'
import { Users, FolderTree, ShieldCheck, AppWindow, Building2, Activity, KeyRound, History, LayoutGrid } from 'lucide-react'
import { useGetRealmQuery } from '@/api/endpoints/realm.api'
import { useGetDashboardDataQuery } from '@/api/endpoints/dashboard.api'
import { useRealmId } from '@/common/hooks/useRealmId'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { EmptyState } from '@/common/components/ui/EmptyState'
import { FadeIn } from '@/common/components/transitions/FadeIn'
import { TimeRangePicker } from '@/features/dashboard/components/TimeRangePicker'
import { DashboardChart } from '@/features/dashboard/components/DashboardChart'
import type { DashboardChartType, DashboardGranularity, DashboardTimeRange, DashboardViewWithData } from '@/features/dashboard/dashboard.types'

// Which chart types make sense for each data kind — a breakdown (category snapshot)
// has no continuous x-axis, so LINE/SCATTER don't apply to it the way they do to a
// timeseries.
const CHART_TYPE_CHOICES: Record<'timeseries' | 'breakdown', { value: DashboardChartType; label: string }[]> = {
  timeseries: [
    { value: 'BAR', label: 'Bar' },
    { value: 'LINE', label: 'Line' },
    { value: 'AREA', label: 'Area' },
    { value: 'SCATTER', label: 'Scatter' },
  ],
  breakdown: [
    { value: 'PIE', label: 'Pie' },
    { value: 'BAR', label: 'Bar' },
  ],
}

const ICON_BY_TYPE: Record<string, typeof Users> = {
  USER_COUNT: Users,
  GROUP_COUNT: FolderTree,
  ROLE_COUNT: ShieldCheck,
  CLIENT_COUNT: AppWindow,
  REALM_COUNT: Building2,
  ACTIVE_SESSION_COUNT: Activity,
  ACTIVE_REFRESH_TOKEN_COUNT: KeyRound,
  RECENT_LOGIN_EVENTS: History,
  RECENT_EVENTS: History,
}

function StatCard({ view, delay }: { view: DashboardViewWithData; delay: number }) {
  const Icon = ICON_BY_TYPE[view.type] ?? LayoutGrid

  return (
    <FadeIn delay={delay}>
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        {view.data.kind === 'count' ? (
          <p className="text-2xl font-semibold text-text">{view.data.count ?? 0}</p>
        ) : (
          <p className="text-2xl font-semibold text-text">{view.data.items?.length ?? 0}</p>
        )}
        <p className="mt-1 text-sm text-text-secondary">{view.name}</p>
      </div>
    </FadeIn>
  )
}

function ChartCard({ view, delay, granularity }: { view: DashboardViewWithData; delay: number; granularity?: DashboardGranularity }) {
  const isBreakdown = view.data.kind === 'breakdown'
  const choices = CHART_TYPE_CHOICES[isBreakdown ? 'breakdown' : 'timeseries']
  // Local-only preview switch — lets a viewer see the same data as, say, a line
  // instead of a bar, without needing an admin to change the view's saved chartType.
  const [chartType, setChartType] = useState<DashboardChartType>(
    choices.some((c) => c.value === view.chartType) ? view.chartType : choices[0].value,
  )

  return (
    <FadeIn delay={delay}>
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-text">{view.name}</p>
            {/* This view is a single all-time snapshot — it does NOT change with the
            time-range picker above, unlike the timeseries charts in that section. */}
            {isBreakdown && (
              <span className="rounded-full bg-surface-alt px-2 py-0.5 text-xs text-text-secondary" title="This chart always shows all-time data — it doesn't follow the date range above.">
                All-time
              </span>
            )}
          </div>
          <div className="flex gap-1">
            {choices.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setChartType(c.value)}
                className={`rounded-md px-2 py-0.5 text-xs transition-colors ${
                  chartType === c.value ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-surface-alt'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <DashboardChart chartType={chartType} data={view.data} granularity={isBreakdown ? undefined : granularity} />
      </div>
    </FadeIn>
  )
}

export default function DashboardPage() {
  const realmId = useRealmId()
  const { data: realmData, isLoading: isRealmLoading } = useGetRealmQuery(realmId)
  const [range, setRange] = useState<DashboardTimeRange>()
  const { data: dashboardData, isLoading: isDashboardLoading } = useGetDashboardDataQuery(range)

  const views = dashboardData?.data ?? []
  const statViews = views.filter((v) => v.data.kind === 'count' || v.data.kind === 'list')
  // Kept as two separate sections (not one shared grid) specifically so the
  // TimeRangePicker's scope is unambiguous — it only ever governs the timeseries
  // charts directly under it, never the all-time breakdowns below.
  const timeseriesViews = views.filter((v) => v.data.kind === 'timeseries')
  const breakdownViews = views.filter((v) => v.data.kind === 'breakdown')

  return (
    <div>
      <PageHeader
        title={isRealmLoading ? 'Dashboard' : `${realmData?.data?.name ?? 'Realm'} Dashboard`}
        description="Views here depend on your role — an admin can assign more from a role's Dashboard tab."
      />

      {isDashboardLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : views.length === 0 ? (
        <EmptyState
          title="No dashboard views assigned to you yet"
          description="Ask an admin to assign some from one of your roles' Dashboard tab."
        />
      ) : (
        <>
          {statViews.length > 0 && (
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {statViews.map((view, i) => (
                <StatCard key={view.dashboardViewId} view={view} delay={i * 0.05} />
              ))}
            </div>
          )}

          {timeseriesViews.length > 0 && (
            <div className="mb-6">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
                Over the selected time range
              </p>
              <TimeRangePicker onChange={setRange} />
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {timeseriesViews.map((view, i) => (
                  <ChartCard key={view.dashboardViewId} view={view} delay={i * 0.05} granularity={range?.granularity} />
                ))}
              </div>
            </div>
          )}

          {breakdownViews.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
                All-time — not affected by the time range above
              </p>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {breakdownViews.map((view, i) => (
                  <ChartCard key={view.dashboardViewId} view={view} delay={i * 0.05} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
