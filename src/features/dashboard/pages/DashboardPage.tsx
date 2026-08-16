import { Users, FolderTree, ShieldCheck, AppWindow } from 'lucide-react'
import { useGetRealmQuery } from '@/api/endpoints/realm.api'
import { useRealmId } from '@/common/hooks/useRealmId'
import { PageHeader } from '@/common/components/ui/PageHeader'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { FadeIn } from '@/common/components/transitions/FadeIn'

const cards = [
  { key: 'users', label: 'Users', icon: Users },
  { key: 'groups', label: 'Groups', icon: FolderTree },
  { key: 'roles', label: 'Roles', icon: ShieldCheck },
  { key: 'clients', label: 'Clients', icon: AppWindow },
]

export default function DashboardPage() {
  const realmId = useRealmId()
  const { data, isLoading } = useGetRealmQuery(realmId)

  return (
    <div>
      <PageHeader
        title={isLoading ? 'Dashboard' : `${data?.data?.name ?? 'Realm'} Dashboard`}
        description="Overview of this realm's IAM configuration."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ key, label, icon: Icon }, i) => (
          <FadeIn key={key} delay={i * 0.05}>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              {isLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <p className="text-2xl font-semibold text-text">—</p>
              )}
              <p className="mt-1 text-sm text-text-secondary">{label}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  )
}
