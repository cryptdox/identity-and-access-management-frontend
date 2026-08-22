import { Users, FolderTree, ShieldCheck, AppWindow, Building2, Activity, KeyRound, History, LayoutGrid } from 'lucide-react'
import { useGetRealmQuery } from '@/api/endpoints/realm.api'
import { useGetDashboardDataQuery } from '@/api/endpoints/dashboard.api'
import { useRealmId } from '@/common/hooks/useRealmId'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { EmptyState } from '@/common/components/ui/EmptyState'
import { FadeIn } from '@/common/components/transitions/FadeIn'
import type { DashboardViewWithData } from '@/features/dashboard/dashboard.types'

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

function DashboardCard({ view, delay }: { view: DashboardViewWithData; delay: number }) {
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

export default function DashboardPage() {
  const realmId = useRealmId()
  const { data: realmData, isLoading: isRealmLoading } = useGetRealmQuery(realmId)
  const { data: dashboardData, isLoading: isDashboardLoading } = useGetDashboardDataQuery()

  const views = dashboardData?.data ?? []

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {views.map((view, i) => (
            <DashboardCard key={view.dashboardViewId} view={view} delay={i * 0.05} />
          ))}
        </div>
      )}
    </div>
  )
}
