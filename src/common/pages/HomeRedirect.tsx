import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'

/** `preferences.lastRealmId` is only a convenience for this one redirect — once a
 * realm id is present in the URL, every page reads it from there, never from redux. */
export default function HomeRedirect() {
  const lastRealmId = useAppSelector((state) => state.preferences.lastRealmId)
  return <Navigate to={lastRealmId ? `/r/${lastRealmId}/dashboard` : '/realms'} replace />
}
