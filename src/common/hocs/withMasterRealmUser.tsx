import type { ComponentType } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'

/** Route-level gate for Master-only pages (realm list/create) — this is a distinct
 * dimension from withPermission's resource+action check. Permissions in this backend
 * are global, not realm-scoped, so a tenant admin has the same REALM:CREATE/READ_ALL
 * grant Master's admin does; the backend now separately enforces isMasterRealmUser
 * for realm management (see realm.middlewares.ts), and the frontend must gate on the
 * same claim or it'd show actions that only fail once clicked. */
export function withMasterRealmUser<P extends object>(Component: ComponentType<P>) {
  return function MasterRealmGated(props: P) {
    const status = useAppSelector((state) => state.auth.status)
    const isMasterRealmUser = useAppSelector((state) => Boolean(state.auth.user?.isMasterRealmUser))
    // Logging out clears `user` before/around the same render this component's
    // route unmounts — without this check it briefly reads isMasterRealmUser as
    // false and fires its own <Navigate to="/unauthorized">, which can win the
    // race against ProtectedRoute's "/login" redirect and strand the user on
    // /unauthorized. Only make the master-only call once actually authenticated;
    // otherwise defer to ProtectedRoute, which owns the "not logged in" redirect.
    if (status !== 'authenticated') return null
    if (!isMasterRealmUser) return <Navigate to="/unauthorized" replace />
    return <Component {...props} />
  }
}
