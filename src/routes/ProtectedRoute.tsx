import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'

/** Layout-route guard for the whole authenticated subtree. For gating one specific
 * page by permission (not just "is logged in"), routes.config.tsx wraps that page's
 * element with common/hocs/withPermission.tsx instead. */
export function ProtectedRoute() {
  const status = useAppSelector((state) => state.auth.status)
  const location = useLocation()

  if (status !== 'authenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
