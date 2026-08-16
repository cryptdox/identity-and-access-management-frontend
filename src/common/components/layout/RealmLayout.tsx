import { Navigate, Outlet, useParams } from 'react-router-dom'
import { useGetRealmQuery } from '@/api/endpoints/realm.api'
import { useEffect } from 'react'
import { useAppDispatch } from '@/app/hooks'
import { setLastRealmId } from '@/app/preferencesSlice'
import { Skeleton } from '@/common/components/ui/Skeleton'
import { EmptyState } from '@/common/components/ui/EmptyState'
import { AlertTriangle } from 'lucide-react'

/** Validates the :realmId segment of the URL against the backend — catches a
 * stale/bookmarked/garbage realm id and redirects instead of rendering broken
 * realm-scoped pages. See common/hooks/useRealmId.ts for how pages read this id. */
export function RealmLayout() {
  const { realmId } = useParams<{ realmId: string }>()
  const dispatch = useAppDispatch()
  const { data, isLoading, isError } = useGetRealmQuery(realmId ?? '', { skip: !realmId })

  useEffect(() => {
    if (realmId) dispatch(setLastRealmId(realmId))
  }, [realmId, dispatch])

  if (!realmId) return <Navigate to="/realms" replace />

  if (isLoading) {
    return (
      <div className="space-y-3 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  const realm = data?.data
  if (isError || !realm) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<AlertTriangle className="size-6" />}
          title="Realm not found"
          description="This realm doesn't exist or you no longer have access to it."
        />
      </div>
    )
  }

  if (!realm.enabled) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<AlertTriangle className="size-6" />}
          title="Realm disabled"
          description={`"${realm.name}" is currently disabled by an administrator.`}
        />
      </div>
    )
  }

  return <Outlet />
}
