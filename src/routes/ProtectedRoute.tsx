import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import LandingPage from '@/features/landing/pages/LandingPage'

/** Layout-route guard for the whole authenticated subtree. For gating one specific
 * page by permission (not just "is logged in"), routes.config.tsx wraps that page's
 * element with common/hocs/withPermission.tsx instead. */
export function ProtectedRoute() {
  const status = useAppSelector((state) => state.auth.status)
  const location = useLocation()

  if (status !== 'authenticated') {
    // `/` is the one route reachable both logged in and logged out — an
    // unauthenticated visitor sees the public marketing landing page here
    // instead of being bounced to /login, the way every other route under
    // this guard still is. Authenticated visitors at `/` are unaffected —
    // they fall through to <Outlet/> below exactly as before, rendering
    // HomeRedirect inside AppShell.
    if (location.pathname === '/') {
      return <LandingPage />
    }
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
