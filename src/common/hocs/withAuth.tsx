import type { ComponentType } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'

/** Wraps a single component so it only ever renders for an authenticated session —
 * the route-table equivalent is routes/ProtectedRoute.tsx (a layout-route guard for
 * a whole subtree); this HOC is for the rare one-off component used outside that tree. */
export function withAuth<P extends object>(Component: ComponentType<P>) {
  return function AuthGated(props: P) {
    const status = useAppSelector((state) => state.auth.status)
    const location = useLocation()

    if (status !== 'authenticated') {
      return <Navigate to="/login" state={{ from: location }} replace />
    }
    return <Component {...props} />
  }
}
