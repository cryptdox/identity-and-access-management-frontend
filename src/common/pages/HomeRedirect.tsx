import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'

/** `preferences.lastRealmId` is only a convenience for this one redirect — once a
 * realm id is present in the URL, every page reads it from there, never from redux.
 *
 * Non-master users can't be sent to /realms at all (the backend now restricts
 * listing all realms to isMasterRealmUser) — they only ever have their own realm,
 * so route them straight there regardless of lastRealmId. */
export default function HomeRedirect() {
  const lastRealmId = useAppSelector((state) => state.preferences.lastRealmId)
  const user = useAppSelector((state) => state.auth.user)

  if (!user?.isMasterRealmUser) {
    return user?.realmId ? <Navigate to={`/r/${user.realmId}/dashboard`} replace /> : <Navigate to="/unauthorized" replace />
  }

  return <Navigate to={lastRealmId ? `/r/${lastRealmId}/dashboard` : '/realms'} replace />
}
