import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { useCan } from '@/common/hooks/usePermission'
import { ResourceName, TypeAction } from '@/api/types/enums.types'

/** `preferences.lastRealmId` is only a convenience for this one redirect — once a
 * realm id is present in the URL, every page reads it from there, never from redux.
 *
 * isMasterRealmUser only means "belongs to the Master realm" — a Master-realm
 * Manager/Viewer/User is still isMasterRealmUser=true but was never granted
 * REALM:READ_ALL (only the ADMIN role gets that), so sending them to /realms
 * would land them on a page that immediately denies them. Only an account that
 * actually holds REALM:READ_ALL gets the "browse all realms" treatment; everyone
 * else — master-realm or not — only ever has their own realm. */
export default function HomeRedirect() {
  const lastRealmId = useAppSelector((state) => state.preferences.lastRealmId)
  const user = useAppSelector((state) => state.auth.user)
  const hasReadAllRealms = useCan(ResourceName.REALM, TypeAction.READ_ALL)
  const canListRealms = Boolean(user?.isMasterRealmUser) && hasReadAllRealms

  if (!canListRealms) {
    return user?.realmId ? <Navigate to={`/r/${user.realmId}/dashboard`} replace /> : <Navigate to="/unauthorized" replace />
  }

  return <Navigate to={lastRealmId ? `/r/${lastRealmId}/dashboard` : '/realms'} replace />
}
